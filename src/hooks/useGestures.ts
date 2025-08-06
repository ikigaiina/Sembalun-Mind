import { useState, useRef, useCallback, useEffect } from 'react';

export interface GestureConfig {
  onSwipeUp?: () => void;
  onSwipeDown?: () => void;
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  onPinchIn?: (scale: number) => void;
  onPinchOut?: (scale: number) => void;
  onDragStart?: (position: { x: number; y: number }) => void;
  onDragMove?: (position: { x: number; y: number }, delta: { x: number; y: number }) => void;
  onDragEnd?: (position: { x: number; y: number }, velocity: { x: number; y: number }) => void;
  onTap?: () => void;
  onDoubleTap?: () => void;
  onLongPress?: () => void;
  threshold?: number;
  longPressDelay?: number;
  doubleTapDelay?: number;
}

interface TouchPosition {
  x: number;
  y: number;
  timestamp: number;
}

interface TouchData {
  startPosition: TouchPosition;
  currentPosition: TouchPosition;
  lastPosition: TouchPosition;
  isDragging: boolean;
  isMultiTouch: boolean;
  touchCount: number;
  initialDistance: number;
}

export const useGestures = (config: GestureConfig = {}) => {
  const {
    onSwipeUp,
    onSwipeDown,
    onSwipeLeft,
    onSwipeRight,
    onPinchIn,
    onPinchOut,
    onDragStart,
    onDragMove,
    onDragEnd,
    onTap,
    onDoubleTap,
    onLongPress,
    threshold = 50,
    longPressDelay = 500,
    doubleTapDelay = 300,
  } = config;

  const touchDataRef = useRef<TouchData>({
    startPosition: { x: 0, y: 0, timestamp: 0 },
    currentPosition: { x: 0, y: 0, timestamp: 0 },
    lastPosition: { x: 0, y: 0, timestamp: 0 },
    isDragging: false,
    isMultiTouch: false,
    touchCount: 0,
    initialDistance: 0,
  });

  const longPressTimer = useRef<NodeJS.Timeout | null>(null);
  const doubleTapTimer = useRef<NodeJS.Timeout | null>(null);
  const [lastTapTime, setLastTapTime] = useState(0);

  // Utility functions
  const getDistance = (touch1: Touch, touch2: Touch): number => {
    const dx = touch1.clientX - touch2.clientX;
    const dy = touch1.clientY - touch2.clientY;
    return Math.sqrt(dx * dx + dy * dy);
  };

  const getTouchPosition = (touch: Touch): TouchPosition => ({
    x: touch.clientX,
    y: touch.clientY,
    timestamp: Date.now(),
  });

  const calculateVelocity = (current: TouchPosition, previous: TouchPosition): { x: number; y: number } => {
    const deltaTime = current.timestamp - previous.timestamp;
    if (deltaTime === 0) return { x: 0, y: 0 };
    
    return {
      x: (current.x - previous.x) / deltaTime,
      y: (current.y - previous.y) / deltaTime,
    };
  };

  // Clear timers
  const clearTimers = useCallback(() => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }
    if (doubleTapTimer.current) {
      clearTimeout(doubleTapTimer.current);
      doubleTapTimer.current = null;
    }
  }, []);

  // Touch start handler
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    clearTimers();
    
    const touches = e.touches;
    const touchData = touchDataRef.current;
    
    touchData.touchCount = touches.length;
    touchData.isMultiTouch = touches.length > 1;
    
    if (touches.length === 1) {
      const position = getTouchPosition(touches[0]);
      touchData.startPosition = position;
      touchData.currentPosition = position;
      touchData.lastPosition = position;
      touchData.isDragging = false;
      
      // Start long press timer
      if (onLongPress) {
        longPressTimer.current = setTimeout(() => {
          if (!touchData.isDragging) {
            onLongPress();
          }
        }, longPressDelay);
      }
    } else if (touches.length === 2) {
      // Initialize pinch gesture
      touchData.initialDistance = getDistance(touches[0], touches[1]);
    }
  }, [onLongPress, longPressDelay, clearTimers]);

  // Touch move handler
  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    const touches = e.touches;
    const touchData = touchDataRef.current;
    
    if (touches.length === 1 && !touchData.isMultiTouch) {
      const currentPosition = getTouchPosition(touches[0]);
      const deltaX = currentPosition.x - touchData.startPosition.x;
      const deltaY = currentPosition.y - touchData.startPosition.y;
      const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
      
      if (distance > 10 && !touchData.isDragging) {
        touchData.isDragging = true;
        clearTimers();
        
        if (onDragStart) {
          onDragStart(touchData.startPosition);
        }
      }
      
      if (touchData.isDragging && onDragMove) {
        const delta = {
          x: currentPosition.x - touchData.lastPosition.x,
          y: currentPosition.y - touchData.lastPosition.y,
        };
        onDragMove(currentPosition, delta);
      }
      
      touchData.lastPosition = touchData.currentPosition;
      touchData.currentPosition = currentPosition;
    } else if (touches.length === 2) {
      // Handle pinch gesture
      const currentDistance = getDistance(touches[0], touches[1]);
      const scale = currentDistance / touchData.initialDistance;
      
      if (scale < 0.8 && onPinchIn) {
        onPinchIn(scale);
      } else if (scale > 1.2 && onPinchOut) {
        onPinchOut(scale);
      }
    }
  }, [onDragStart, onDragMove, onPinchIn, onPinchOut, clearTimers]);

  // Touch end handler
  const handleTouchEnd = useCallback((e: React.TouchEvent) => {
    const touchData = touchDataRef.current;
    clearTimers();
    
    if (touchData.isDragging) {
      if (onDragEnd) {
        const velocity = calculateVelocity(touchData.currentPosition, touchData.lastPosition);
        onDragEnd(touchData.currentPosition, velocity);
      }
    } else if (!touchData.isMultiTouch && touchData.touchCount === 1) {
      // Handle tap gestures
      const deltaX = touchData.currentPosition.x - touchData.startPosition.x;
      const deltaY = touchData.currentPosition.y - touchData.startPosition.y;
      const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
      
      if (distance < threshold) {
        // Check for swipe gestures first
        if (Math.abs(deltaX) > Math.abs(deltaY)) {
          if (deltaX > threshold && onSwipeRight) {
            onSwipeRight();
            return;
          } else if (deltaX < -threshold && onSwipeLeft) {
            onSwipeLeft();
            return;
          }
        } else {
          if (deltaY > threshold && onSwipeDown) {
            onSwipeDown();
            return;
          } else if (deltaY < -threshold && onSwipeUp) {
            onSwipeUp();
            return;
          }
        }
        
        // Handle tap gestures
        const currentTime = Date.now();
        const timeSinceLastTap = currentTime - lastTapTime;
        
        if (timeSinceLastTap < doubleTapDelay && onDoubleTap) {
          onDoubleTap();
          setLastTapTime(0);
        } else {
          setLastTapTime(currentTime);
          if (onTap) {
            doubleTapTimer.current = setTimeout(() => {
              onTap();
            }, doubleTapDelay);
          }
        }
      }
    }
    
    // Reset touch data
    touchData.isDragging = false;
    touchData.isMultiTouch = false;
    touchData.touchCount = 0;
  }, [threshold, onSwipeUp, onSwipeDown, onSwipeLeft, onSwipeRight, onDragEnd, onTap, onDoubleTap, doubleTapDelay, lastTapTime, clearTimers]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      clearTimers();
    };
  }, [clearTimers]);

  // Mouse handlers for desktop support
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    const touchData = touchDataRef.current;
    const position = { x: e.clientX, y: e.clientY, timestamp: Date.now() };
    
    touchData.startPosition = position;
    touchData.currentPosition = position;
    touchData.lastPosition = position;
    touchData.isDragging = false;
    
    if (onLongPress) {
      longPressTimer.current = setTimeout(() => {
        if (!touchData.isDragging) {
          onLongPress();
        }
      }, longPressDelay);
    }
  }, [onLongPress, longPressDelay]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    const touchData = touchDataRef.current;
    const currentPosition = { x: e.clientX, y: e.clientY, timestamp: Date.now() };
    
    if (!touchData.isDragging) {
      const deltaX = currentPosition.x - touchData.startPosition.x;
      const deltaY = currentPosition.y - touchData.startPosition.y;
      const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
      
      if (distance > 10) {
        touchData.isDragging = true;
        clearTimers();
        
        if (onDragStart) {
          onDragStart(touchData.startPosition);
        }
      }
    }
    
    if (touchData.isDragging && onDragMove) {
      const delta = {
        x: currentPosition.x - touchData.lastPosition.x,
        y: currentPosition.y - touchData.lastPosition.y,
      };
      onDragMove(currentPosition, delta);
    }
    
    touchData.lastPosition = touchData.currentPosition;
    touchData.currentPosition = currentPosition;
  }, [onDragStart, onDragMove, clearTimers]);

  const handleMouseUp = useCallback((e: React.MouseEvent) => {
    const touchData = touchDataRef.current;
    clearTimers();
    
    if (touchData.isDragging) {
      if (onDragEnd) {
        const velocity = calculateVelocity(touchData.currentPosition, touchData.lastPosition);
        onDragEnd(touchData.currentPosition, velocity);
      }
    } else {
      if (onTap) {
        onTap();
      }
    }
    
    touchData.isDragging = false;
  }, [onDragEnd, onTap, clearTimers]);

  return {
    dragProps: {
      onTouchStart: handleTouchStart,
      onTouchMove: handleTouchMove,
      onTouchEnd: handleTouchEnd,
      onMouseDown: handleMouseDown,
      onMouseMove: handleMouseMove,
      onMouseUp: handleMouseUp,
    },
    swipeProps: {
      onTouchStart: handleTouchStart,
      onTouchMove: handleTouchMove,
      onTouchEnd: handleTouchEnd,
    },
  };
};