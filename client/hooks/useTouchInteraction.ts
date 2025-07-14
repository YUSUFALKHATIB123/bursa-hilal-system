import { useState, useEffect, useRef, useCallback } from "react";

interface TouchInteractionOptions {
  onTap?: () => void;
  onDoubleTap?: () => void;
  onPress?: () => void;
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  onSwipeUp?: () => void;
  onSwipeDown?: () => void;
  pressDelay?: number;
  swipeThreshold?: number;
  doubleTapDelay?: number;
  preventDefaultTouch?: boolean;
}

interface TouchPoint {
  x: number;
  y: number;
  time: number;
}

export const useTouchInteraction = (options: TouchInteractionOptions = {}) => {
  const {
    onTap,
    onDoubleTap,
    onPress,
    onSwipeLeft,
    onSwipeRight,
    onSwipeUp,
    onSwipeDown,
    pressDelay = 500,
    swipeThreshold = 50,
    doubleTapDelay = 300,
    preventDefaultTouch = true,
  } = options;

  const [isPressed, setIsPressed] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  const touchStartRef = useRef<TouchPoint | null>(null);
  const touchEndRef = useRef<TouchPoint | null>(null);
  const pressTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastTapRef = useRef<number>(0);
  const tapCountRef = useRef<number>(0);

  const clearPressTimeout = useCallback(() => {
    if (pressTimeoutRef.current) {
      clearTimeout(pressTimeoutRef.current);
      pressTimeoutRef.current = null;
    }
  }, []);

  const handleTouchStart = useCallback(
    (e: TouchEvent) => {
      if (preventDefaultTouch) {
        e.preventDefault();
      }

      const touch = e.touches[0];
      const now = Date.now();

      touchStartRef.current = {
        x: touch.clientX,
        y: touch.clientY,
        time: now,
      };

      setIsPressed(true);
      setIsDragging(false);

      // Setup press detection
      if (onPress) {
        pressTimeoutRef.current = setTimeout(() => {
          if (touchStartRef.current) {
            onPress();
            setIsPressed(false);
          }
        }, pressDelay);
      }
    },
    [onPress, pressDelay, preventDefaultTouch],
  );

  const handleTouchMove = useCallback(
    (e: TouchEvent) => {
      if (!touchStartRef.current) return;

      if (preventDefaultTouch) {
        e.preventDefault();
      }

      const touch = e.touches[0];
      const deltaX = Math.abs(touch.clientX - touchStartRef.current.x);
      const deltaY = Math.abs(touch.clientY - touchStartRef.current.y);

      // If moved more than 10px, consider it a drag
      if (deltaX > 10 || deltaY > 10) {
        setIsDragging(true);
        clearPressTimeout();
      }
    },
    [clearPressTimeout, preventDefaultTouch],
  );

  const handleTouchEnd = useCallback(
    (e: TouchEvent) => {
      if (preventDefaultTouch) {
        e.preventDefault();
      }

      const touch = e.changedTouches[0];
      const now = Date.now();

      touchEndRef.current = {
        x: touch.clientX,
        y: touch.clientY,
        time: now,
      };

      setIsPressed(false);
      clearPressTimeout();

      if (!touchStartRef.current || isDragging) {
        setIsDragging(false);
        return;
      }

      const deltaX = touchEndRef.current.x - touchStartRef.current.x;
      const deltaY = touchEndRef.current.y - touchStartRef.current.y;
      const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

      // If it's a swipe (moved more than threshold)
      if (distance > swipeThreshold) {
        const absX = Math.abs(deltaX);
        const absY = Math.abs(deltaY);

        if (absX > absY) {
          // Horizontal swipe
          if (deltaX > 0 && onSwipeRight) {
            onSwipeRight();
          } else if (deltaX < 0 && onSwipeLeft) {
            onSwipeLeft();
          }
        } else {
          // Vertical swipe
          if (deltaY > 0 && onSwipeDown) {
            onSwipeDown();
          } else if (deltaY < 0 && onSwipeUp) {
            onSwipeUp();
          }
        }
        return;
      }

      // Handle tap/double tap
      const timeSinceLastTap = now - lastTapRef.current;

      if (timeSinceLastTap < doubleTapDelay) {
        // Double tap
        tapCountRef.current++;
        if (tapCountRef.current === 2 && onDoubleTap) {
          onDoubleTap();
          tapCountRef.current = 0;
          lastTapRef.current = 0;
          return;
        }
      } else {
        tapCountRef.current = 1;
      }

      lastTapRef.current = now;

      // Single tap (with delay to check for double tap)
      if (onTap) {
        setTimeout(() => {
          if (tapCountRef.current === 1 && onTap) {
            onTap();
          }
          tapCountRef.current = 0;
        }, doubleTapDelay);
      }
    },
    [
      clearPressTimeout,
      isDragging,
      swipeThreshold,
      doubleTapDelay,
      onTap,
      onDoubleTap,
      onSwipeLeft,
      onSwipeRight,
      onSwipeUp,
      onSwipeDown,
      preventDefaultTouch,
    ],
  );

  const touchHandlers = {
    onTouchStart: handleTouchStart,
    onTouchMove: handleTouchMove,
    onTouchEnd: handleTouchEnd,
    onTouchCancel: () => {
      setIsPressed(false);
      setIsDragging(false);
      clearPressTimeout();
    },
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      clearPressTimeout();
    };
  }, [clearPressTimeout]);

  return {
    touchHandlers,
    isPressed,
    isDragging,
  };
};

// Hook for detecting device orientation changes
export const useDeviceOrientation = () => {
  const [orientation, setOrientation] = useState<
    "portrait" | "landscape" | null
  >(null);

  useEffect(() => {
    const updateOrientation = () => {
      if (typeof window === "undefined") return;

      const isPortrait = window.innerHeight > window.innerWidth;
      setOrientation(isPortrait ? "portrait" : "landscape");
    };

    updateOrientation();
    window.addEventListener("resize", updateOrientation);
    window.addEventListener("orientationchange", updateOrientation);

    return () => {
      window.removeEventListener("resize", updateOrientation);
      window.removeEventListener("orientationchange", updateOrientation);
    };
  }, []);

  return orientation;
};

// Hook for detecting if device has touch capabilities
export const useHasTouch = () => {
  const [hasTouch, setHasTouch] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const checkTouch = () => {
      setHasTouch(
        "ontouchstart" in window ||
          navigator.maxTouchPoints > 0 ||
          (navigator as any).msMaxTouchPoints > 0,
      );
    };

    checkTouch();
  }, []);

  return hasTouch;
};

// Hook for improved scroll handling on mobile
export const useScrollLock = (isLocked: boolean) => {
  useEffect(() => {
    if (typeof window === "undefined") return;

    const originalStyle = window.getComputedStyle(document.body).overflow;

    if (isLocked) {
      document.body.style.overflow = "hidden";
      document.body.style.touchAction = "none";
    } else {
      document.body.style.overflow = originalStyle;
      document.body.style.touchAction = "auto";
    }

    return () => {
      document.body.style.overflow = originalStyle;
      document.body.style.touchAction = "auto";
    };
  }, [isLocked]);
};
