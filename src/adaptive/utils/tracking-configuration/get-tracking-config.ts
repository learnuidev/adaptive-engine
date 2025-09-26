import { IAdaptiveInput, TrackingConfig } from "../../adaptive.types.ts";

export const getTrackingConfig = ({
  apiKey,
  domain,
  apiUrl,
}: IAdaptiveInput): TrackingConfig => {
  // const currentScript = document.currentScript as HTMLScriptElement;
  // const dataPrefix = "data-";
  // const getScriptAttribute = currentScript.getAttribute.bind(currentScript);
  // const baseApiUrl = apiUrl || "https://datafa.st/api/events";

  // const allowFileProtocol =
  //   getScriptAttribute(`${dataPrefix}allow-file-protocol`) === "true";
  // const allowLocalhost =
  //   getScriptAttribute(`${dataPrefix}allow-localhost`) === "true";
  // const debugMode = getScriptAttribute(`${dataPrefix}debug`) === "true";
  // const websiteId = apiKey || getScriptAttribute(`${dataPrefix}website-id`);
  // const trackingDomain = domain || getScriptAttribute(`${dataPrefix}domain`);

  // const isSelfHosted = !currentScript?.src.includes("datafa.st");
  // const apiBaseUrl =
  //   getScriptAttribute(`${dataPrefix}api-url`) || window.location.origin;
  // const apiEndpoint = isSelfHosted
  //   ? new URL("/api/events", apiBaseUrl).href
  //   : baseApiUrl;

  // const dataPrefix = "data-";

  const baseApiUrl = apiUrl;

  const allowFileProtocol = true;
  const allowLocalhost = true;
  const debugMode = true;
  const websiteId = apiKey;
  const trackingDomain = domain;

  const apiBaseUrl = true;
  const apiEndpoint = baseApiUrl;
  const addEventEndpoint = `${baseApiUrl}/v1/analytics/add-events`;

  return {
    allowFileProtocol,
    allowLocalhost,
    debugMode,
    websiteId,
    trackingDomain,
    // apiEndpoint,
    addEventEndpoint,
  };
};
