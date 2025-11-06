'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { performanceUtils } from '@/lib/performance-utils';

// Hook for measuring component render performance
export function useRenderPerformance(componentName: string) {
  const renderCountRef = useRef(0);
  const mountTimeRef = useRef<number>(0);

  useEffect(() => {
    mountTimeRef.current = performance.now();
    performanceUtils.measurement.mark(`${componentName}-mount`);

    return () => {
      const unmountTime = performance.now();
      const lifeTime = unmountTime - mountTimeRef.current;
      console.log(`🔄 ${componentName} lifetime: ${lifeTime.toFixed(2)}ms, renders: ${renderCountRef.current}`);
    };
  }, [componentName]);

  useEffect(() => {
    renderCountRef.current += 1;
    if (renderCountRef.current > 1) {
      performanceUtils.measurement.mark(`${componentName}-render-${renderCountRef.current}`);
    }
  });

  return {
    renderCount: renderCountRef.current,
    markInteraction: useCallback((name: string) => {
      performanceUtils.measurement.mark(`${componentName}-${name}`);
    }, [componentName])
  };
}

// Hook for debounced values
export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

// Hook for API caching
export function useApiCache<T>(
  key: string,
  fetcher: () => Promise<T>,
  ttl = 300000
) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchData = useCallback(async (force = false) => {
    if (!force) {
      const cached = performanceUtils.api.getCachedResponse(key);
      if (cached) {
        setData(cached);
        return cached;
      }
    }

    setLoading(true);
    setError(null);

    try {
      const result = await fetcher();
      performanceUtils.api.cacheResponse(key, result, ttl);
      setData(result);
      return result;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Unknown error');
      setError(error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, [key, fetcher, ttl]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return {
    data,
    loading,
    error,
    refetch: () => fetchData(true),
    clearCache: () => performanceUtils.api.cache.delete(key)
  };
}

// Hook for intersection observer (lazy loading)
export function useIntersectionObserver(
  options?: IntersectionObserverInit
) {
  const [isIntersecting, setIsIntersecting] = useState(false);
  const [hasIntersected, setHasIntersected] = useState(false);
  const targetRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const element = targetRef.current;
    if (!element) return;

    const observer = performanceUtils.dom.createIntersectionObserver(
      (entries) => {
        const entry = entries[0];
        setIsIntersecting(entry.isIntersecting);
        if (entry.isIntersecting && !hasIntersected) {
          setHasIntersected(true);
        }
      },
      options
    );

    if (observer) {
      observer.observe(element);
      return () => observer.disconnect();
    }
  }, [hasIntersected, options]);

  return {
    targetRef,
    isIntersecting,
    hasIntersected
  };
}

// Hook for performance measurement
export function usePerformanceMeasure() {
  const measureRef = useRef(new Map<string, number>());

  const start = useCallback((name: string) => {
    measureRef.current.set(name, performance.now());
    performanceUtils.measurement.mark(`${name}-start`);
  }, []);

  const end = useCallback((name: string) => {
    const startTime = measureRef.current.get(name);
    if (startTime) {
      const duration = performance.now() - startTime;
      console.log(`⏱️ ${name}: ${duration.toFixed(2)}ms`);
      performanceUtils.measurement.mark(`${name}-end`);
      performanceUtils.measurement.measure(name, `${name}-start`, `${name}-end`);
      measureRef.current.delete(name);
      return duration;
    }
    return 0;
  }, []);

  return { start, end };
}