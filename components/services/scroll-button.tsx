"use client"

import { ChevronLeft, ChevronRight } from "lucide-react"
import type React from "react"

interface ScrollButtonProps {
  scrollContainerRef: React.RefObject<HTMLDivElement | null>
  canScrollLeft: boolean
  canScrollRight: boolean
}

export function ScrollButton({ scrollContainerRef, canScrollLeft, canScrollRight }: ScrollButtonProps) {
  const scrollLeft = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: -325, behavior: "smooth" })
    }
  }

  const scrollRight = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: 325, behavior: "smooth" })
    }
  }

  return (
    <div className="flex justify-center gap-4 mt-4">
      <button
        onClick={scrollLeft}
        className={`w-10 h-10 rounded-full cursor-pointer border border-gray-300 flex items-center justify-center ${
          canScrollLeft ? "bg-[#fff] hover:bg-[#eee]" : "bg-transparent cursor-default"
        }`}
        aria-label="Previous card"
        disabled={!canScrollLeft}
      >
        <ChevronLeft className={`w-6 h-6 ${!canScrollLeft ? "text-gray-500" : ""}`} style={{ strokeWidth: 2 }} />
      </button>
      <button
        onClick={scrollRight}
        className={`w-10 h-10 rounded-full cursor-pointer border border-gray-300 flex items-center justify-center ${
          canScrollRight ? "bg-[#fff] hover:bg-[#eee]" : "bg-transparent cursor-default"
        }`}
        aria-label="Next card"
        disabled={!canScrollRight}
      >
        <ChevronRight className={`w-6 h-6 ${!canScrollRight ? "text-gray-500" : ""}`} style={{ strokeWidth: 2 }} />
      </button>
    </div>
  )
}
