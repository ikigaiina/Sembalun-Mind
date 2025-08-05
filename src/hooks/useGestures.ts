import { useRef, useEffect, useState, useCallback } from 'react';

interface GestureState {
  isPressed: boolean;
  isLongPressed: boolean;
  startPosition: { x: number; y: number } | null;
  currentPosition: { x: number; y: number } | null;
  deltaX: number;
  deltaY: number;
  distance: number;
  direction: 'up' | 'down' | 'left' | 'right' | null;
  velocity: { x: number; y: number };
  isSwipe: boolean;
  isPinching: boolean;
  scale: number;
}

interface GestureHandlers {
  onTap?: (position: { x: number; y: number }) => void;
  onLongPress?: (position: { x: number; y: number }) => void;
  onSwipe?: (direction: 'up' | 'down' | 'left' | 'right', velocity: { x: number; y: number }) => void;
  onPinch?: (scale: number, center: { x: number; y: number }) => void;
  onDrag?: (delta: { x: number; y: number }, position: { x: number; y: number }) => void;
  onDragStart?: (position: { x: number; y: number }) => void;
  onDragEnd?: (position: { x: number; y: number }, velocity: { x: number; y: number }) => void;
}

const LONG_PRESS_DURATION = 500;
const SWIPE_THRESHOLD = 50;
const SWIPE_VELOCITY_THRESHOLD = 0.5;

export const useGestures = (handlers: GestureHandlers = {}) => {
  const elementRef = useRef<HTMLElement | null>(null);
  const [gestureState, setGestureState] = useState<GestureState>({
    isPressed: false,
    isLongPressed: false,
    startPosition: null,
    currentPosition: null,
    deltaX: 0,
    deltaY: 0,
    distance: 0,
    direction: null,
    velocity: { x: 0, y: 0 },
    isSwipe: false,
    isPinching: false,
    scale: 1
  });

  const longPressTimer = useRef<NodeJS.Timeout>();
  const lastPosition = useRef<{ x: number; y: number } | null>(null);
  const lastTime = useRef<number>(0);
  const touches = useRef<Map<number, { x: number; y: number }>>(new Map());

  const calculateDistance = useCallback((pos1: { x: number; y: number }, pos2: { x: number; y: number }) => {
    return Math.sqrt(Math.pow(pos2.x - pos1.x, 2) + Math.pow(pos2.y - pos1.y, 2));
  }, []);

  const calculateDirection = useCallback((start: { x: number; y: number }, end: { x: number; y: number }) => {
    const deltaX = end.x - start.x;
    const deltaY = end.y - start.y;
    
    if (Math.abs(deltaX) > Math.abs(deltaY)) {
      return deltaX > 0 ? 'right' : 'left';
    } else {
      return deltaY > 0 ? 'down' : 'up';
    }
  }, []);

  const calculateVelocity = useCallback((current: { x: number; y: number }, previous: { x: number; y: number }, timeDelta: number) => {
    if (timeDelta === 0) return { x: 0, y: 0 };
    
    return {
      x: (current.x - previous.x) / timeDelta,
      y: (current.y - previous.y) / timeDelta
    };
  }, []);

  const handleStart = useCallback((position: { x: number; y: number }, touchId?: number) => {
    const now = Date.now();
    
    if (touchId !== undefined) {
      touches.current.set(touchId, position);
    }

    setGestureState(prev => ({
      ...prev,
      isPressed: true,
      startPosition: position,
      currentPosition: position,
      deltaX: 0,
      deltaY: 0,
      distance: 0,
      direction: null,
      isSwipe: false
    }));

    lastPosition.current = position;
    lastTime.current = now;

    // Start long press timer
    longPressTimer.current = setTimeout(() => {
      setGestureState(prev => ({ ...prev, isLongPressed: true }));
      handlers.onLongPress?.(position);
    }, LONG_PRESS_DURATION);

    handlers.onDragStart?.(position);
  }, [handlers]);

  const handleMove = useCallback((position: { x: number; y: number }, touchId?: number) => {
    if (!gestureState.startPosition) return;

    const now = Date.now();
    const timeDelta = now - lastTime.current;
    
    if (touchId !== undefined) {
      touches.current.set(touchId, position);
      
      // Handle pinch gesture for multi-touch
      if (touches.current.size === 2) {
        const touchArray = Array.from(touches.current.values());
        const distance = calculateDistance(touchArray[0], touchArray[1]);
        const center = {
          x: (touchArray[0].x + touchArray[1].x) / 2,
          y: (touchArray[0].y + touchArray[1].y) / 2
        };
        
        if (!gestureState.isPinching) {
          setGestureState(prev => ({ ...prev, isPinching: true, scale: 1 }));
        } else {
          const scale = distance / calculateDistance(
            Array.from(touches.current.values())[0],
            Array.from(touches.current.values())[1]
          );
          setGestureState(prev => ({ ...prev, scale }));
          handlers.onPinch?.(scale, center);
        }
        return;
      }
    }

    const deltaX = position.x - gestureState.startPosition.x;
    const deltaY = position.y - gestureState.startPosition.y;
    const distance = calculateDistance(gestureState.startPosition, position);
    const direction = calculateDirection(gestureState.startPosition, position);
    
    const velocity = lastPosition.current 
      ? calculateVelocity(position, lastPosition.current, timeDelta)
      : { x: 0, y: 0 };

    setGestureState(prev => ({
      ...prev,
      currentPosition: position,
      deltaX,
      deltaY,
      distance,
      direction,
      velocity
    }));

    // Clear long press if moved too much
    if (distance > 10 && longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      setGestureState(prev => ({ ...prev, isLongPressed: false }));
    }

    handlers.onDrag?.({ x: deltaX, y: deltaY }, position);
    
    lastPosition.current = position;
    lastTime.current = now;
  }, [gestureState, handlers, calculateDistance, calculateDirection, calculateVelocity]);

  const handleEnd = useCallback((position: { x: number; y: number }, touchId?: number) => {
    if (touchId !== undefined) {
      touches.current.delete(touchId);
    }

    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
    }

    const { startPosition, distance, direction, velocity, isLongPressed } = gestureState;
    
    if (!startPosition) return;

    // Determine if it's a swipe
    const isSwipe = distance > SWIPE_THRESHOLD && 
                   (Math.abs(velocity.x) > SWIPE_VELOCITY_THRESHOLD || 
                    Math.abs(velocity.y) > SWIPE_VELOCITY_THRESHOLD);

    if (isSwipe && direction) {
      handlers.onSwipe?.(direction, velocity);
    } else if (distance < 10 && !isLongPressed) {
      // It's a tap
      handlers.onTap?.(position);
    }

    handlers.onDragEnd?.(position, velocity);

    setGestureState(prev => ({
      ...prev,
      isPressed: false,
      isLongPressed: false,
      startPosition: null,
      currentPosition: null,
      deltaX: 0,
      deltaY: 0,
      distance: 0,
      direction: null,
      velocity: { x: 0, y: 0 },
      isSwipe,
      isPinching: false,
      scale: 1
    }));

    touches.current.clear();
  }, [gestureState, handlers]);

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    // Mouse events
    const handleMouseDown = (e: MouseEvent) => {
      e.preventDefault();
      handleStart({ x: e.clientX, y: e.clientY });
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (gestureState.isPressed) {
        handleMove({ x: e.clientX, y: e.clientY });
      }
    };

    const handleMouseUp = (e: MouseEvent) => {
      handleEnd({ x: e.clientX, y: e.clientY });
    };

    // Touch events
    const handleTouchStart = (e: TouchEvent) => {
      e.preventDefault();
      Array.from(e.touches).forEach((touch) => {
        handleStart(
          { x: touch.clientX, y: touch.clientY },
          touch.identifier
        );
      });
    };

    const handleTouchMove = (e: TouchEvent) => {
      e.preventDefault();
      Array.from(e.touches).forEach((touch) => {
        handleMove(
          { x: touch.clientX, y: touch.clientY },
          touch.identifier
        );
      });
    };

    const handleTouchEnd = (e: TouchEvent) => {
      e.preventDefault();
      Array.from(e.changedTouches).forEach((touch) => {
        handleEnd(
          { x: touch.clientX, y: touch.clientY },
          touch.identifier
        );
      });
    };

    // Add event listeners
    element.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    
    element.addEventListener('touchstart', handleTouchStart, { passive: false });
    element.addEventListener('touchmove', handleTouchMove, { passive: false });
    element.addEventListener('touchend', handleTouchEnd, { passive: false });

    return () => {
      element.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      
      element.removeEventListener('touchstart', handleTouchStart);
      element.removeEventListener('touchmove', handleTouchMove);
      element.removeEventListener('touchend', handleTouchEnd);
      
      if (longPressTimer.current) {
        clearTimeout(longPressTimer.current);
      }
    };
  }, [gestureState.isPressed, handleStart, handleMove, handleEnd]);

  return {
    ref: elementRef,
    gestureState,
    ...gestureState
  };
};