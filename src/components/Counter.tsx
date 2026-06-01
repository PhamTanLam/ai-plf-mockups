import { useEffect, useRef, useState } from 'react'

interface CounterProps {
  target: number
  currency?: boolean
  /** ms */
  duration?: number
  className?: string
}

/** Animated count-up, ported from the mockup's animateCounters(). */
export function Counter({ target, currency = false, duration = 1200, className }: CounterProps) {
  const [value, setValue] = useState(0)
  const rafRef = useRef<number | undefined>(undefined)

  useEffect(() => {
    let start: number | null = null
    function step(now: number) {
      if (start === null) start = now
      const progress = Math.min((now - start) / duration, 1)
      const eased = progress * (2 - progress) // easeOutQuad
      setValue(Math.floor(eased * target))
      if (progress < 1) rafRef.current = requestAnimationFrame(step)
      else setValue(target)
    }
    rafRef.current = requestAnimationFrame(step)
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
    }
  }, [target, duration])

  const text = currency ? `¥${value.toLocaleString()}` : value.toLocaleString()
  return <span className={className}>{text}</span>
}
