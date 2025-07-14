// Performance monitoring and optimization utilities

// Debounce function for search inputs and resize events
export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  wait: number,
): ((...args: Parameters<T>) => void) => {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
};

// Throttle function for scroll events
export const throttle = <T extends (...args: any[]) => any>(
  func: T,
  wait: number,
): ((...args: Parameters<T>) => void) => {
  let inThrottle = false;
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), wait);
    }
  };
};

// Intersection Observer for lazy loading
export const createIntersectionObserver = (
  callback: (entries: IntersectionObserverEntry[]) => void,
  options?: IntersectionObserverInit,
) => {
  if (typeof window === "undefined" || !("IntersectionObserver" in window)) {
    return null;
  }

  return new IntersectionObserver(callback, {
    threshold: 0.1,
    rootMargin: "50px",
    ...options,
  });
};

// Preload critical resources
export const preloadResource = (
  url: string,
  type: "image" | "font" | "script",
) => {
  if (typeof window === "undefined") return;

  const link = document.createElement("link");
  link.rel = "preload";
  link.href = url;

  switch (type) {
    case "image":
      link.as = "image";
      break;
    case "font":
      link.as = "font";
      link.type = "font/woff2";
      link.crossOrigin = "anonymous";
      break;
    case "script":
      link.as = "script";
      break;
  }

  document.head.appendChild(link);
};

// Memory usage monitoring (development only)
export const getMemoryUsage = () => {
  if (typeof window === "undefined" || !(performance as any).memory) {
    return null;
  }

  const memory = (performance as any).memory;
  return {
    used: Math.round(memory.usedJSHeapSize / 1048576), // MB
    total: Math.round(memory.totalJSHeapSize / 1048576), // MB
    limit: Math.round(memory.jsHeapSizeLimit / 1048576), // MB
  };
};

// FPS monitoring
export class FPSMonitor {
  private lastTime = 0;
  private frames = 0;
  private fps = 0;
  private isRunning = false;

  start() {
    if (this.isRunning) return;
    this.isRunning = true;
    this.lastTime = performance.now();
    this.frames = 0;
    this.update();
  }

  stop() {
    this.isRunning = false;
  }

  private update = () => {
    if (!this.isRunning) return;

    const now = performance.now();
    this.frames++;

    if (now >= this.lastTime + 1000) {
      this.fps = Math.round((this.frames * 1000) / (now - this.lastTime));
      this.frames = 0;
      this.lastTime = now;
    }

    requestAnimationFrame(this.update);
  };

  getFPS() {
    return this.fps;
  }
}

// Device capability detection
export const getDeviceCapabilities = () => {
  if (typeof window === "undefined") return null;

  const isMobile =
    /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
      navigator.userAgent,
    );

  const isTablet = /(tablet|ipad|playbook|silk)|(android(?!.*mobi))/i.test(
    navigator.userAgent,
  );

  const hasTouch = "ontouchstart" in window || navigator.maxTouchPoints > 0;

  const hasReducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)",
  ).matches;

  const pixelRatio = window.devicePixelRatio || 1;

  const screenWidth = window.screen.width;
  const screenHeight = window.screen.height;

  const isLowEnd =
    (navigator as any).hardwareConcurrency <= 2 ||
    screenWidth * screenHeight * pixelRatio < 1920 * 1080;

  return {
    isMobile,
    isTablet,
    isDesktop: !isMobile && !isTablet,
    hasTouch,
    hasReducedMotion,
    pixelRatio,
    screenWidth,
    screenHeight,
    isLowEnd,
    connectionType: (navigator as any).connection?.effectiveType || "unknown",
  };
};

// Optimize animations based on device capability
export const getOptimizedAnimationConfig = () => {
  const capabilities = getDeviceCapabilities();

  if (!capabilities) {
    return { duration: 0.3, ease: "easeInOut" };
  }

  if (capabilities.hasReducedMotion) {
    return { duration: 0.01, ease: "linear" };
  }

  if (capabilities.isLowEnd || capabilities.connectionType === "slow-2g") {
    return { duration: 0.2, ease: "linear" };
  }

  if (capabilities.isMobile) {
    return { duration: 0.25, ease: "easeOut" };
  }

  return { duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] };
};

// Request idle callback polyfill
export const requestIdleCallback = (callback: () => void, timeout = 5000) => {
  if (typeof window === "undefined") return;

  if ("requestIdleCallback" in window) {
    return window.requestIdleCallback(callback, { timeout });
  }

  // Fallback for Safari and older browsers
  return setTimeout(callback, 1);
};

// Batch DOM operations
export const batchDOMUpdates = (updates: (() => void)[]) => {
  if (typeof window === "undefined") return;

  requestAnimationFrame(() => {
    updates.forEach((update) => update());
  });
};

// Image optimization
export const optimizeImageSrc = (
  src: string,
  width: number,
  quality = 80,
  format = "webp",
) => {
  // This would integrate with your image optimization service
  // For now, return the original src
  return src;
};

// Service Worker registration for caching
export const registerServiceWorker = () => {
  if (
    typeof window === "undefined" ||
    !("serviceWorker" in navigator) ||
    process.env.NODE_ENV !== "production"
  ) {
    return;
  }

  window.addEventListener("load", () => {
    navigator.serviceWorker
      .register("/sw.js")
      .then((registration) => {
        console.log("SW registered: ", registration);
      })
      .catch((registrationError) => {
        console.log("SW registration failed: ", registrationError);
      });
  });
};

// Performance timing metrics
export const getPerformanceMetrics = () => {
  if (typeof window === "undefined" || !performance.timing) {
    return null;
  }

  const timing = performance.timing;
  const navigation = performance.navigation;

  return {
    // Navigation timing
    loadTime: timing.loadEventEnd - timing.navigationStart,
    domReadyTime: timing.domContentLoadedEventEnd - timing.navigationStart,
    firstPaintTime: timing.responseStart - timing.navigationStart,

    // Network timing
    dnsTime: timing.domainLookupEnd - timing.domainLookupStart,
    tcpTime: timing.connectEnd - timing.connectStart,
    requestTime: timing.responseEnd - timing.requestStart,

    // Navigation type
    navigationType: navigation.type,
    redirectCount: navigation.redirectCount,
  };
};

// Export default configuration
export const performanceConfig = {
  animations: getOptimizedAnimationConfig(),
  debounceDelay: 300,
  throttleDelay: 100,
  lazyLoadMargin: "50px",
  maxConcurrentRequests: 6,
};
