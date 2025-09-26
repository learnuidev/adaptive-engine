import { IAdaptive, IAdaptiveInput } from "./adaptive.types.ts";
import { adaptive } from "./adaptive.ts";
import React, { createContext, useContext } from "react";

export const AdaptiveContext = createContext<IAdaptive | undefined>(undefined);

export const useAdaptive = () => {
  const context = useContext(AdaptiveContext);
  if (!context) {
    throw new Error("useAdaptive must be used within a DatafastProvider");
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
  const selfHostedDataFast = adaptive({
    apiKey,
    apiUrl,
    domain,
    identity,
  });

  if (!selfHostedDataFast) {
    throw new Error("AdaptivefastProvider: Failed to initialize adaptive");
  }

  return (
    <AdaptiveContext.Provider value={selfHostedDataFast}>
      {children}
    </AdaptiveContext.Provider>
  );
};
