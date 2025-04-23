"use client"

import { useEffect, useState } from "react"

/**
 * Hook to detect if the current device is a mobile device based on screen width
 * @param breakpoint Width threshold to consider as mobile (default: 768px)
 */
export function useIsMobile(breakpoint = 768) {
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const checkIsMobile = () => {
      setIsMobile(window.innerWidth < breakpoint)
    }

    // Check on initial render
    checkIsMobile()

    // Add window resize listener
    window.addEventListener("resize", checkIsMobile)

    // Clean up event listener
    return () => window.removeEventListener("resize", checkIsMobile)
  }, [breakpoint])

  return isMobile
} 