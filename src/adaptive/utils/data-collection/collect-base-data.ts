import { AdaptiveIdentity, BaseData } from "../../adaptive.types.ts";
import { createIdGenerator } from "../id-generation/create-id-generator.ts";
import { collectAdClickIds } from "./collect-add-click-ids.ts";

export const collectBaseData = (
  websiteId: string | null,
  trackingDomain: string | null,
  getOrCreateSessionId: () => string,
  identity: AdaptiveIdentity
): BaseData | null => {
  const getOrCreateVisitorId = createIdGenerator(
    "adaptive_visitor_id",
    "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx",
    365
  );

  const currentUrl = window.location.href;
  if (!currentUrl) {
    console.warn(
      "Adaptive: Unable to collect href. This may indicate incorrect script implementation or browser issues."
    );
    return null;
  }

  if (!websiteId || !trackingDomain) {
    return null;
  }

  const url = new URL(currentUrl);
  const adClickIds = collectAdClickIds(url);

  return {
    websiteId,
    domain: trackingDomain,
    href: currentUrl,
    referrer: document.referrer || null,
    viewport: { width: window.innerWidth, height: window.innerHeight },
    visitorId: getOrCreateVisitorId(),
    sessionId: getOrCreateSessionId(),
    adClickIds: Object.keys(adClickIds).length > 0 ? adClickIds : undefined,
  };
};
