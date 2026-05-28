import { useEffect, useRef, useCallback, useState } from 'react'

/**
 * Returns a debounced version of the callback.
 * Delays invoking fn until after `delay` ms since the last call.
 */
export function useDebounce<T extends (...args: any[]) => any>(
  fn: T,
  delay: number
): (...args: Parameters<T>) => void {
  const timerRef = useRef<ReturnType<typeof setTimeout>>()
  const fnRef    = useRef(fn)

  useEffect(() => { fnRef.current = fn }, [fn])
  useEffect(() => () => clearTimeout(timerRef.current), [])

  return useCallback((...args: Parameters<T>) => {
    clearTimeout(timerRef.current)
    timerRef.current = setTimeout(() => fnRef.current(...args), delay)
  }, [delay])
}

/**
 * Returns a debounced value that updates after `delay` ms of no changes.
 */
export function useDebouncedValue<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value)

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delay)
    return () => clearTimeout(timer)
  }, [value, delay])

  return debouncedValue
}
