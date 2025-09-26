import { identity } from "ramda";
import {
  BaseData,
  DatafastIdentity,
  EventCallback,
} from "../../datafast.types.ts";
import { setCookie } from "../cookie-management/set-cookie.ts";
import { isBot } from "../environment-detection/is-bot.ts";

export const sendEvent = (
  eventData: BaseData,
  callback: EventCallback | undefined,
  apiEndpoint: string,
  trackingDomain: string | null,
  getOrCreateSessionId: () => string,
  identity: DatafastIdentity
): void => {
  if (localStorage.getItem("datafast_ignore") === "true") {
    console.log("DataFast: Tracking disabled via localStorage flag");
    callback?.({ status: 200 });
    return;
  }

  if (isBot()) {
    console.log("DataFast: Bot detected, not sending data");
    callback?.({ status: 200 });
    return;
  }

  const xhr = new XMLHttpRequest();
  xhr.open("POST", apiEndpoint, true);
  xhr.setRequestHeader("Content-Type", "application/json");

  xhr.onreadystatechange = function () {
    if (xhr.readyState === XMLHttpRequest.DONE) {
      if (xhr.status === 200) {
        console.log("Event data sent successfully");
        setCookie(
          "datafast_session_id",
          getOrCreateSessionId(),
          1 / 48,
          trackingDomain
        );
      } else {
        console.error("Error sending event data:", xhr.status);
      }
      callback?.({ status: xhr.status });
    }
  };

  xhr.send(JSON.stringify({ ...eventData, ...identity }));
};
