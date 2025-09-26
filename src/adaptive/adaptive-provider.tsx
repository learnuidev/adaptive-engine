import { IAdaptive, IAdaptiveInput } from "./adaptive.types.ts";
import { adaptive } from "./adaptive.ts";
import React, { createContext, useContext } from "react";

export const AdaptiveContext = createContext<IAdaptive | undefined>(undefined);

export const useAdaptive = () => {
  const context = useContext(AdaptiveContext);
  if (!context) {
    throw new Error("useAdaptive must be used within a AdaptiveProvider");
  }
  return context;
};

export const AdaptiveProvider = ({
  children,
  domain,
  apiKey,
  apiUrl,
  identity,
}: { children: React.ReactNode } & IAdaptiveInput) => {
  const selfHostedAdaptive = adaptive({
    apiKey,
    apiUrl,
    domain,
    identity,
  });

  if (!selfHostedAdaptive) {
    throw new Error("AdaptivefastProvider: Failed to initialize adaptive");
  }

  return (
    <AdaptiveContext.Provider value={selfHostedAdaptive}>
      {children}
    </AdaptiveContext.Provider>
  );
};
