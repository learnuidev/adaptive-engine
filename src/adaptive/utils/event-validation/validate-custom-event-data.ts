import { sanitizeValue } from "./sanitize-value.ts";
import { validatePropertyName } from "./validate-property-name.ts";

export const validateCustomEventData = (
  customData: any
): Record<string, string> | null => {
  if (
    !customData ||
    typeof customData !== "object" ||
    Array.isArray(customData)
  ) {
    console.warn("Adaptive: customData must be a non-null object");
    return {};
  }

  const entries = Object.entries(customData);
  if (entries.length > 10) {
    console.error("Adaptive: Maximum 10 custom parameters allowed");
    return null;
  }

  const validatedData = entries.reduce(
    (acc: Record<string, string> | null, [key, value], index) => {
      if (acc === null) return null;

      if (key === "eventName") {
        acc[key] = sanitizeValue(value);
        return acc;
      }

      if (!validatePropertyName(key)) {
        console.error(
          `Adaptive: Invalid property name "${key}". Use only lowercase letters, numbers, underscores, and hyphens. Max 32 characters.`
        );
        return null;
      }

      acc[key.toLowerCase()] = sanitizeValue(value);
      return acc;
    },
    {}
  );

  return validatedData;
};
