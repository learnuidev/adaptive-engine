// Usage with TypeScript
// const cleanup = runOnceOnUrlChange((newUrl: string) => {
//   console.log('URL changed to:', newUrl);
//   // Your code here
// });

// If you need to cancel before it runs
// cleanup();

// export const setupHistoryTracking = (schedulePageview: () => void): void => {
//   let currentPathname = window.location.pathname;
//   const originalPushState = window.history.pushState;

//   window.history.pushState = function (...args: any[]) {
//     // @ts-ignore
//     originalPushState.apply(this, args);
//     if (currentPathname !== window.location.pathname) {
//       currentPathname = window.location.pathname;
//       schedulePageview();
//     }
//   };

//   window.addEventListener("popstate", () => {
//     if (currentPathname !== window.location.pathname) {
//       currentPathname = window.location.pathname;
//       schedulePageview();
//     }
//   });
// };

let isTrackingSetup = false;
let trackingTimeout: NodeJS.Timeout | null = null;

export const setupHistoryTracking = (schedulePageview: () => void): void => {
  if (isTrackingSetup) {
    return;
  }
  isTrackingSetup = true;

  let currentPathname = window.location.pathname;

  const handleUrlChange = () => {
    if (currentPathname !== window.location.pathname) {
      currentPathname = window.location.pathname;

      // Debounce to prevent multiple rapid calls
      if (trackingTimeout) {
        clearTimeout(trackingTimeout);
      }

      trackingTimeout = setTimeout(() => {
        schedulePageview();
      }, 50); // 50ms debounce delay
    }
  };

  const originalPushState = window.history.pushState;
  window.history.pushState = function (...args: any[]) {
    // @ts-ignore
    originalPushState.apply(this, args);
    handleUrlChange();
  };

  // Use a named function for proper cleanup
  const popStateHandler = () => {
    handleUrlChange();
  };

  window.addEventListener("popstate", popStateHandler);

  // Optional: Cleanup function
  // @ts-ignore
  return () => {
    window.history.pushState = originalPushState;
    window.removeEventListener("popstate", popStateHandler);
    if (trackingTimeout) {
      clearTimeout(trackingTimeout);
    }
    isTrackingSetup = false;
  };
};
