import { useRef, useEffect, useState, useCallback } from 'react';

interface AnimationConfig {
  duration?: number;
  easing?: 'linear' | 'ease-in' | 'ease-out' | 'ease-in-out' | 'bounce' | 'elastic';
  delay?: number;
  loop?: boolean | number;
  yoyo?: boolean;
}

interface SpringConfig {
  tension?: number;
  friction?: number;
  mass?: number;
}

interface AnimationState {
  isAnimating: boolean;
  progress: number;
  value: number;
  velocity: number;
}

const easingFunctions = {
  linear: (t: number) => t,
  'ease-in': (t: number) => t * t,
  'ease-out': (t: number) => t * (2 - t),
  'ease-in-out': (t: number) => t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t,
  bounce: (t: number) => {
    if (t < 1 / 2.75) {
      return 7.5625 * t * t;
    } else if (t < 2 / 2.75) {
      return 7.5625 * (t -= 1.5 / 2.75) * t + 0.75;
    } else if (t < 2.5 / 2.75) {
      return 7.5625 * (t -= 2.25 / 2.75) * t + 0.9375;
    } else {
      return 7.5625 * (t -= 2.625 / 2.75) * t + 0.984375;
    }
  },
  elastic: (t: number) => {
    return t === 0 ? 0 : t === 1 ? 1 : -Math.pow(2, 10 * (t - 1)) * Math.sin((t - 1.1) * 5 * Math.PI);
  }
};

export const useAnimation = (
  from: number = 0,
  to: number = 1,
  config: AnimationConfig = {}
) => {
  const {
    duration = 300,
    easing = 'ease-out',
    delay = 0,
    loop = false,
    yoyo = false
  } = config;

  const [state, setState] = useState<AnimationState>({
    isAnimating: false,
    progress: 0,
    value: from,
    velocity: 0
  });

  const animationRef = useRef<number | undefined>(undefined);
  const startTimeRef = useRef<number | undefined>(undefined);
  const loopCountRef = useRef<number>(0);
  const isReverseRef = useRef<boolean>(false);

  const animate = useCallback((timestamp: number) => {
    if (!startTimeRef.current) {
      startTimeRef.current = timestamp + delay;
      if (delay > 0) {
        animationRef.current = requestAnimationFrame(animate);
        return;
      }
    }

    const elapsed = timestamp - startTimeRef.current;
    const progress = Math.min(elapsed / duration, 1);
    
    const easedProgress = easingFunctions[easing](progress);
    const currentFrom = isReverseRef.current ? to : from;
    const currentTo = isReverseRef.current ? from : to;
    const value = currentFrom + (currentTo - currentFrom) * easedProgress;
    
    const velocity = (value - state.value) / 16; // Approximate velocity

    setState({
      isAnimating: progress < 1,
      progress: isReverseRef.current ? 1 - progress : progress,
      value,
      velocity
    });

    if (progress < 1) {
      animationRef.current = requestAnimationFrame(animate);
    } else {
      // Animation completed
      if (yoyo) {
        isReverseRef.current = !isReverseRef.current;
        startTimeRef.current = undefined;
        loopCountRef.current++;
        
        const shouldContinue = loop === true || 
          (typeof loop === 'number' && loopCountRef.current < loop * 2);
        
        if (shouldContinue) {
          animationRef.current = requestAnimationFrame(animate);
        }
      } else if (loop) {
        startTimeRef.current = undefined;
        loopCountRef.current++;
        
        const shouldContinue = loop === true || 
          (typeof loop === 'number' && loopCountRef.current < loop);
        
        if (shouldContinue) {
          animationRef.current = requestAnimationFrame(animate);
        }
      }
    }
  }, [from, to, duration, easing, delay, loop, yoyo, state.value]);

  const start = useCallback(() => {
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }
    
    startTimeRef.current = undefined;
    loopCountRef.current = 0;
    isReverseRef.current = false;
    
    setState(prev => ({ ...prev, isAnimating: true }));
    animationRef.current = requestAnimationFrame(animate);
  }, [animate]);

  const stop = useCallback(() => {
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
      animationRef.current = undefined;
    }
    setState(prev => ({ ...prev, isAnimating: false }));
  }, []);

  const reset = useCallback(() => {
    stop();
    setState({
      isAnimating: false,
      progress: 0,
      value: from,
      velocity: 0
    });
  }, [stop, from]);

  useEffect(() => {
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);

  return {
    ...state,
    start,
    stop,
    reset
  };
};

export const useSpring = (
  from: number = 0,
  to: number = 1,
  config: SpringConfig = {}
) => {
  const {
    tension = 120,
    friction = 14,
    mass = 1
  } = config;

  const [state, setState] = useState<AnimationState>({
    isAnimating: false,
    progress: 0,
    value: from,
    velocity: 0
  });

  const animationRef = useRef<number | undefined>(undefined);
  const targetRef = useRef<number>(to);
  const velocityRef = useRef<number>(0);
  const valueRef = useRef<number>(from);

  const animate = useCallback(() => {
    const target = targetRef.current;
    const current = valueRef.current;
    const velocity = velocityRef.current;

    const spring = -tension * (current - target);
    const damper = -friction * velocity;
    const acceleration = (spring + damper) / mass;

    const newVelocity = velocity + acceleration * 0.016; // 60fps
    const newValue = current + newVelocity * 0.016;

    velocityRef.current = newVelocity;
    valueRef.current = newValue;

    const isAtRest = Math.abs(newVelocity) < 0.01 && Math.abs(newValue - target) < 0.01;
    const progress = Math.abs(target - from) > 0 ? 
      Math.min(Math.abs(newValue - from) / Math.abs(target - from), 1) : 1;

    setState({
      isAnimating: !isAtRest,
      progress,
      value: newValue,
      velocity: newVelocity
    });

    if (!isAtRest) {
      animationRef.current = requestAnimationFrame(animate);
    } else {
      setState(prev => ({ ...prev, value: target, isAnimating: false }));
    }
  }, [tension, friction, mass, from]);

  const start = useCallback((newTarget?: number) => {
    if (newTarget !== undefined) {
      targetRef.current = newTarget;
    }
    
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }
    
    setState(prev => ({ ...prev, isAnimating: true }));
    animationRef.current = requestAnimationFrame(animate);
  }, [animate]);

  const stop = useCallback(() => {
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
      animationRef.current = undefined;
    }
    setState(prev => ({ ...prev, isAnimating: false }));
  }, []);

  const setTarget = useCallback((newTarget: number) => {
    targetRef.current = newTarget;
    if (!state.isAnimating) {
      start();
    }
  }, [state.isAnimating, start]);

  useEffect(() => {
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);

  return {
    ...state,
    start,
    stop,
    setTarget
  };
};

export const usePulse = (intensity: number = 1, speed: number = 1) => {
  const animation = useAnimation(1 - intensity, 1 + intensity, {
    duration: 1000 / speed,
    easing: 'ease-in-out',
    loop: true,
    yoyo: true
  });

  return animation;
};

export const useWiggle = (intensity: number = 10, speed: number = 1) => {
  const animation = useAnimation(-intensity, intensity, {
    duration: 100 / speed,
    easing: 'ease-in-out',
    loop: 6,
    yoyo: true
  });

  return animation;
};

export const useSequence = (animations: Array<() => void>, interval: number = 100) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);

  const start = useCallback(() => {
    setIsPlaying(true);
    setCurrentIndex(0);
    
    const playNext = (index: number) => {
      if (index >= animations.length) {
        setIsPlaying(false);
        return;
      }
      
      animations[index]();
      setCurrentIndex(index);
      
      timeoutRef.current = setTimeout(() => {
        playNext(index + 1);
      }, interval);
    };
    
    playNext(0);
  }, [animations, interval]);

  const stop = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    setIsPlaying(false);
  }, []);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return {
    currentIndex,
    isPlaying,
    start,
    stop
  };
};