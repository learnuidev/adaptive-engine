// ========== TYPE DEFINITIONS ==========

import {
  BaseData,
  EventCallback,
  IAdaptive,
  IAdaptiveInput,
  PageviewState,
} from "./adaptive.types.ts";
import { collectBaseData } from "./utils/data-collection/collect-base-data.ts";
import { sendEvent } from "./utils/event-management/send-event.ts";
import { validateCustomEventData } from "./utils/event-validation/validate-custom-event-data.ts";
import { createIdGenerator } from "./utils/id-generation/create-id-generator.ts";
import { getTrackingConfig } from "./utils/tracking-configuration/get-tracking-config.ts";
import { shouldEnableTracking } from "./utils/tracking-configuration/should-enable-tracking.ts";
import { createElementTracker } from "./utils/tracking-management/create-element-tracker.ts";
import { createEventTracker } from "./utils/tracking-management/create-event-tracker.ts";
import { createPaymentDetector } from "./utils/tracking-management/create-payment-detector.ts";
import { initializeScrollTracking } from "./utils/tracking-management/initialize-scroll-tracking.ts";
import { setupHistoryTracking } from "./utils/tracking-management/setup-history-tracking.ts";

export function adaptive({
  apiKey,
  domain,
  apiUrl,
  identity,
}: IAdaptiveInput): IAdaptive {
  // ========== MAIN INITIALIZATION ==========

  const config = getTrackingConfig({ apiKey, domain, apiUrl, identity });
  const trackingStatus = shouldEnableTracking(config);
  const { enabled: trackingEnabled, reason: disabledReason } = trackingStatus;

  const getOrCreateSessionId = createIdGenerator(
    "adaptive_session_id",
    "sxxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx",
    1 / 48
  );

  // Process queued calls
  const queuedCalls: any[][] = (
    (window as any).adaptive?.q && Array.isArray((window as any).adaptive.q)
      ? (window as any).adaptive.q.map((call: any) => Array.from(call))
      : []
  ) as any[][];

  // Restore pageview state
  const restorePageviewState = (): PageviewState => {
    try {
      const savedState = sessionStorage.getItem("adaptive_pageview_state");
      if (savedState) {
        const { time, url } = JSON.parse(savedState);
        return { lastTime: time || 0, lastUrl: url || "" };
      }
    } catch (error) {
      // Ignore errors
    }
    return { lastTime: 0, lastUrl: "" };
  };

  let pageviewState = restorePageviewState();

  // Create trackers
  const baseDataCollector = (): BaseData | null =>
    collectBaseData(
      config.websiteId,
      config.trackingDomain,
      getOrCreateSessionId,
      identity
    );

  const eventSender = (eventData: BaseData, callback?: EventCallback): void =>
    sendEvent(
      eventData,
      callback,
      config.addEventEndpoint,
      config.trackingDomain,
      getOrCreateSessionId,
      identity
    );

  const eventTracker = createEventTracker(
    trackingEnabled,
    baseDataCollector,
    eventSender,
    config.addEventEndpoint,
    config.trackingDomain
  );

  const identify = async () => {
    const baseData = collectBaseData(
      config.websiteId,
      config.trackingDomain,
      getOrCreateSessionId,
      identity
    );

    const identifyResponse = await fetch(config.identifyEndpoint, {
      method: "POST",
      body: JSON.stringify(baseData),
    });

    if (!identifyResponse.ok) {
      throw new Error(`Error identifying user`);
    }

    const identifyJson: any = await identifyResponse.json();

    if (identifyJson?.id) {
      (window as any).identityId = identifyJson.id;
    }

    return identifyJson;
  };

  const identifyTracker = createEventTracker(
    trackingEnabled,
    baseDataCollector,
    eventSender,
    config.identifyEndpoint,
    config.trackingDomain
  );

  const elementTracker = createElementTracker(
    eventTracker.trackEvent,
    validateCustomEventData
  );

  // Main adaptive function
  const adaptive = (eventName: string, eventData?: any): void => {
    if (!trackingEnabled) {
      console.log(`Adaptive: Event '${eventName}' ignored - ${disabledReason}`);
      return;
    }

    if (!eventName) {
      console.warn("Adaptive: Missing event_name for custom event");
      return;
    }

    const eventHandlers: Record<string, () => void> = {
      payment: () => {
        if (!eventData?.email) {
          console.warn("Adaptive: Missing email for payment event");
          return;
        }
        eventTracker.trackEvent("payment", { email: eventData.email });
      },

      identify: () => {
        if (!eventData?.user_id) {
          console.warn("Adaptive: Missing user_id for identify event");
          return;
        }
        eventTracker.trackEvent("identify", {
          user_id: eventData.user_id,
          name: eventData.name || "",
          ...eventData,
        });
      },

      default: () => {
        const validatedData = validateCustomEventData(eventData || {});
        if (validatedData === null) {
          console.error(
            "Adaptive: Custom event rejected due to validation errors"
          );
          return;
        }
        eventTracker.trackEvent("custom", { eventName, ...validatedData });
      },
    };

    const handler = eventHandlers[eventName] || eventHandlers.default;
    handler();
  };

  // Initialize global function
  (window as any).adaptive = adaptive;
  delete (window as any).adaptive?.q;

  // Process queued calls
  queuedCalls.forEach((call) => {
    if (Array.isArray(call) && call.length > 0) {
      try {
        // @ts-ignore
        adaptive.apply(null, call);
      } catch (error) {
        console.error("Adaptive: Error processing queued call:", error, call);
      }
    }
  });

  // Exit if tracking is disabled
  if (!trackingEnabled) {
    console.warn(`Adaptive: ${disabledReason}`);
    return;
  }

  // Set up event listeners
  const setupEventListeners = (): void => {
    let clickTimeout: number | null = null;
    document.addEventListener("click", (event) => {
      const goalElement = (event.target as Element).closest("[adaptive-goal]");
      if (goalElement) elementTracker.trackGoalClick(goalElement);
      elementTracker.trackExternalLink((event.target as Element).closest("a"));
    });

    document.addEventListener("keydown", (event) => {
      if (event.key === "Enter" || event.key === " ") {
        const goalElement = (event.target as Element).closest(
          "[adaptive-goal]"
        );
        if (goalElement) elementTracker.trackGoalClick(goalElement);
        elementTracker.trackExternalLink(
          (event.target as Element).closest("a")
        );
      }
    });
  };

  // Initialize scroll tracking
  const initScrollTracking = (): void => {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", () =>
        initializeScrollTracking(elementTracker.trackScrollElement)
      );
    } else {
      initializeScrollTracking(elementTracker.trackScrollElement);
    }
  };

  // Pageview scheduling
  let pageviewTimeout: number | null = null;
  const schedulePageview = (): void => {
    if (pageviewTimeout) clearTimeout(pageviewTimeout);
    pageviewTimeout = window.setTimeout(triggerPageview, 100);
  };

  const triggerPageview = (): void => {
    pageviewState = eventTracker.trackPageview(() => {}, pageviewState);

    // Auto-detect payments
    const paymentDetector = createPaymentDetector(eventTracker.trackPayment);
    paymentDetector.detectStripePayment();
    paymentDetector.detectPolarPayment();
    paymentDetector.detectLemonSqueezyPayment();
  };

  // Initial setup
  setupEventListeners();
  initScrollTracking();
  setupHistoryTracking(schedulePageview);

  // Initial pageview
  triggerPageview();

  return { adaptive, identify };
}
