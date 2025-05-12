"use client"

import type React from "react"

import { useRef, useState, useEffect, Suspense, useCallback, useMemo } from "react"
import { useRouter, usePathname, useSearchParams } from "next/navigation"
import { CardData } from "@/lib/card-data"
import { Card } from "@/components/services/card"
import { Header } from "@/components/core/header"
import { ChevronLeft, ChevronRight, X } from "lucide-react"
import { AnimatePresence, motion, useReducedMotion } from "motion/react"
import Image from "next/image"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useOnClickOutside } from "usehooks-ts"

// Separate component for search params handling to avoid re-renders
function SearchParamsHandler({
  setSelectedCard,
  setIsDialogOpen,
  isDialogOpen,
}: {
  setSelectedCard: React.Dispatch<React.SetStateAction<(typeof CardData)[0] | null>>
  setIsDialogOpen: React.Dispatch<React.SetStateAction<boolean>>
  isDialogOpen: boolean
}) {
  const searchParams = useSearchParams()

  useEffect(() => {
    const modal = searchParams.get("modal")
    if (modal && !isDialogOpen) {
      const card = CardData.find((card) => card.title.toLowerCase() === modal)
      if (card) {
        setSelectedCard(card)
        setIsDialogOpen(true)
      }
    }
  }, [searchParams, isDialogOpen, setSelectedCard, setIsDialogOpen])

  return null
}

// Separate modal component to reduce main component complexity
function CardModal({
  selectedCard,
  isDialogOpen,
  closeDialog,
  modalRef,
}: {
  selectedCard: (typeof CardData)[0] | null
  isDialogOpen: boolean
  closeDialog: () => void
  modalRef: React.RefObject<HTMLDivElement>
}) {
  const prefersReducedMotion = useReducedMotion()

  // Optimize animation settings based on device capability
  const animationSettings = useMemo(
    () => ({
      type: "spring",
      stiffness: prefersReducedMotion ? 500 : 400,
      damping: prefersReducedMotion ? 40 : 30,
      duration: prefersReducedMotion ? 0.15 : 0.2,
    }),
    [prefersReducedMotion],
  )

  if (!selectedCard) return null

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-[#fcfcfc]"
        onClick={closeDialog}
        transition={{ duration: 0.15 }}
      />

      <div className="absolute inset-x-0 bottom-0 flex justify-center">
        <motion.div
          layoutId={`card-${selectedCard.title}`}
          ref={modalRef}
          className="relative bg-white rounded-t-3xl max-w-3xl w-full md:mx-4 mx-0 h-[95vh] z-10 shadow-xl"
          onClick={(e) => e.stopPropagation()}
          transition={{
            ...animationSettings,
            layout: { duration: animationSettings.duration },
          }}
          style={{
            willChange: "transform, opacity",
            transform: "translateZ(0)",
            backfaceVisibility: "hidden",
            perspective: 1000,
          }}
        >
          {/* Close button */}
          <button
            onClick={closeDialog}
            className="absolute top-4 right-4 z-50 bg-white rounded-full p-2 hover:bg-white/90 transition-colors"
            aria-label="Close dialog"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Content container */}
          <ScrollArea className="h-full rounded-t-3xl">
            <div className="p-8">
              {/* Image with white mask overlay */}
              <motion.div
                layoutId={`image-container-${selectedCard.title}`}
                className="relative w-full h-[250px] mb-6 rounded-xl overflow-hidden"
                style={{ willChange: "transform" }}
              >
                <Image
                  src={selectedCard.image || "/placeholder.svg"}
                  alt={selectedCard.title}
                  fill
                  priority
                  sizes="(max-width: 768px) 100vw, 800px"
                  className="object-cover"
                />
                {/* White mask overlay */}
                <div className="absolute inset-0 bg-white/20"></div>
              </motion.div>

              {/* Text content */}
              <motion.h2
                layoutId={`title-${selectedCard.title}`}
                className="text-[38px]/[1.1] font-medium text-black mb-6"
              >
                {selectedCard.title}
              </motion.h2>

              <div className="space-y-6">
                <motion.div layoutId={`description-${selectedCard.title}`} className="hidden">
                  {selectedCard.description.substring(0, 70)}
                </motion.div>

                {selectedCard.description.split("\n\n").map((paragraph, index) => (
                  <p key={index} className="text-[18px]/[1.4] text-black">
                    {paragraph}
                  </p>
                ))}
              </div>
            </div>
          </ScrollArea>
        </motion.div>
      </div>
    </div>
  )
}

export default function Services() {
  const router = useRouter()
  const pathname = usePathname()
  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const modalRef = useRef<HTMLDivElement>(null)
  const [canScrollLeft, setCanScrollLeft] = useState(false)
  const [canScrollRight, setCanScrollRight] = useState(true)
  const [selectedCard, setSelectedCard] = useState<(typeof CardData)[0] | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isAnimating, setIsAnimating] = useState(false)
  const [isOverflowAuto, setIsOverflowAuto] = useState(true)
  const prefersReducedMotion = useReducedMotion()

  // Memoize scroll handlers to prevent unnecessary re-renders
  const scrollLeft = useCallback(() => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({
        left: -325,
        behavior: prefersReducedMotion ? "auto" : "smooth",
      })
    }
  }, [prefersReducedMotion])

  const scrollRight = useCallback(() => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({
        left: 325,
        behavior: prefersReducedMotion ? "auto" : "smooth",
      })
    }
  }, [prefersReducedMotion])

  // Optimized close dialog function with immediate response
  const closeDialog = useCallback(() => {
    if (isAnimating) return

    // Immediately start closing
    setIsDialogOpen(false)
    router.replace(pathname, { scroll: false })

    // Use requestAnimationFrame for smoother animation timing
    requestAnimationFrame(() => {
      setIsAnimating(true)

      // Reset states after animation completes
      const timer = setTimeout(
        () => {
          setIsOverflowAuto(true)
          setIsAnimating(false)
          setSelectedCard(null)
        },
        prefersReducedMotion ? 100 : 180,
      ) // Shorter duration for reduced motion preference

      return () => clearTimeout(timer)
    })
  }, [isAnimating, pathname, router, prefersReducedMotion])

  // Optimized body overflow handling
  useEffect(() => {
    if (typeof document !== "undefined") {
      // Store original overflow and position
      const originalOverflow = document.body.style.overflow
      const originalPosition = document.body.style.position
      const originalWidth = document.body.style.width
      const originalTop = document.body.style.top

      if (!isOverflowAuto) {
        // Save current scroll position
        const scrollY = window.scrollY
        document.body.style.overflow = "hidden"
        document.body.style.position = "fixed"
        document.body.style.width = "100%"
        document.body.style.top = `-${scrollY}px`
      } else {
        // Restore scroll position if we have it
        const scrollY = document.body.style.top
        document.body.style.overflow = originalOverflow
        document.body.style.position = originalPosition
        document.body.style.width = originalWidth
        document.body.style.top = originalTop

        if (scrollY) {
          window.scrollTo(0, Number.parseInt(scrollY || "0", 10) * -1)
        }
      }
    }

    return () => {
      if (typeof document !== "undefined") {
        document.body.style.overflow = ""
        document.body.style.position = ""
        document.body.style.width = ""
        document.body.style.top = ""
      }
    }
  }, [isOverflowAuto])

  // Click outside handler
  useOnClickOutside(
    modalRef as React.RefObject<HTMLElement>,
    () => {
      if (isDialogOpen && !isAnimating) {
        closeDialog()
      }
    },
    "mousedown",
  )

  // Keyboard handler
  useEffect(() => {
    const handleEscKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isDialogOpen && !isAnimating) {
        closeDialog()
      }
    }

    window.addEventListener("keydown", handleEscKey)
    return () => window.removeEventListener("keydown", handleEscKey)
  }, [isDialogOpen, isAnimating, closeDialog])

  // URL handling
  useEffect(() => {
    const handleURLChange = () => {
      const searchParams = new URLSearchParams(window.location.search)
      const modal = searchParams.get("modal")

      if (modal && !isDialogOpen) {
        const card = CardData.find((card) => card.title.toLowerCase() === modal)
        if (card) {
          setSelectedCard(card)
          setIsDialogOpen(true)
          setIsOverflowAuto(false)
        }
      } else if (!modal && isDialogOpen) {
        closeDialog()
      }
    }

    handleURLChange()
    window.addEventListener("popstate", handleURLChange)

    return () => {
      window.removeEventListener("popstate", handleURLChange)
    }
  }, [isDialogOpen, closeDialog])

  // Open dialog with optimized performance
  const openDialog = useCallback(
    (card: (typeof CardData)[0]) => {
      if (isAnimating) return

      // Use requestAnimationFrame for smoother animation timing
      requestAnimationFrame(() => {
        setIsAnimating(true)
        setSelectedCard(card)
        setIsDialogOpen(true)
        setIsOverflowAuto(false)

        router.replace(`${pathname}?modal=${card.title.toLowerCase()}`, {
          scroll: false,
        })

        const timer = setTimeout(
          () => {
            setIsAnimating(false)
          },
          prefersReducedMotion ? 200 : 300,
        )

        return () => clearTimeout(timer)
      })
    },
    [isAnimating, pathname, router, prefersReducedMotion],
  )

  // Optimized scroll position checking with IntersectionObserver
  useEffect(() => {
    const checkScrollPosition = () => {
      if (scrollContainerRef.current) {
        const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current
        setCanScrollLeft(scrollLeft > 5) // Small threshold to avoid flickering
        setCanScrollRight(scrollLeft + clientWidth < scrollWidth - 5)
      }
    }

    // Initial check
    checkScrollPosition()

    // Throttled scroll handler
    let scrollTimeout: NodeJS.Timeout
    const handleScroll = () => {
      if (scrollTimeout) clearTimeout(scrollTimeout)
      scrollTimeout = setTimeout(checkScrollPosition, 100)
    }

    const scrollContainer = scrollContainerRef.current
    if (scrollContainer) {
      scrollContainer.addEventListener("scroll", handleScroll, { passive: true })

      // Also check on resize
      window.addEventListener("resize", checkScrollPosition, { passive: true })
    }

    return () => {
      if (scrollContainer) {
        scrollContainer.removeEventListener("scroll", handleScroll)
      }
      window.removeEventListener("resize", checkScrollPosition)
      if (scrollTimeout) clearTimeout(scrollTimeout)
    }
  }, [])

  // Touch gesture support for mobile
  useEffect(() => {
    if (!modalRef.current || !isDialogOpen) return

    let startY = 0
    let currentY = 0
    const threshold = 100 // Minimum distance to trigger close

    const handleTouchStart = (e: TouchEvent) => {
      startY = e.touches[0].clientY
    }

    const handleTouchMove = (e: TouchEvent) => {
      currentY = e.touches[0].clientY
      const distance = currentY - startY

      // Only allow downward swipes
      if (distance > 0) {
        e.preventDefault()

        // Apply transform to follow finger
        if (modalRef.current) {
          modalRef.current.style.transform = `translateY(${Math.min(distance, 200)}px)`
          modalRef.current.style.transition = "none"
        }
      }
    }

    const handleTouchEnd = () => {
      if (modalRef.current) {
        modalRef.current.style.transition = "transform 0.2s ease-out"
        modalRef.current.style.transform = ""
      }

      const distance = currentY - startY
      if (distance > threshold) {
        closeDialog()
      }
    }

    const modal = modalRef.current
    modal.addEventListener("touchstart", handleTouchStart, { passive: true })
    modal.addEventListener("touchmove", handleTouchMove, { passive: false })
    modal.addEventListener("touchend", handleTouchEnd, { passive: true })

    return () => {
      modal.removeEventListener("touchstart", handleTouchStart)
      modal.removeEventListener("touchmove", handleTouchMove)
      modal.removeEventListener("touchend", handleTouchEnd)
    }
  }, [isDialogOpen, closeDialog])

  return (
    <section
      className="min-h-screen pt-10"
      style={{
        background:
          "linear-gradient(180deg, rgba(226, 238, 255, 0.35) 0%, #F8FBFF 46.63%, rgba(226, 238, 255, 0.35) 100%)",
      }}
    >
      <Suspense fallback={null}>
        <SearchParamsHandler
          setSelectedCard={setSelectedCard}
          setIsDialogOpen={setIsDialogOpen}
          isDialogOpen={isDialogOpen}
        />
      </Suspense>
      <Header
        title="Your Brand, Amplified"
        className="gap-3"
        description="Innovative multi-channel advertising solutions built for the cannabis industry."
      />

      <div className="py-12">
        <div
          ref={scrollContainerRef}
          className="flex overflow-auto scroll-smooth pl-16 pr-16 gap-4 pb-8 snap-x md:snap-none snap-mandatory"
          style={{
            scrollbarWidth: "none",
            msOverflowStyle: "none",
            WebkitOverflowScrolling: "touch",
          }}
          aria-label="Services carousel"
        >
          {CardData.map((card, index) => (
            <div key={index} className="snap-center shrink-0">
              <Card card={card} index={index} openDialog={openDialog} />
            </div>
          ))}
        </div>
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
      </div>

      {/* Dialog - Using AnimatePresence with optimized settings */}
      <AnimatePresence mode="wait" initial={false}>
        {isDialogOpen && selectedCard && (
          <CardModal
            selectedCard={selectedCard}
            isDialogOpen={isDialogOpen}
            closeDialog={closeDialog}
            modalRef={modalRef}
          />
        )}
      </AnimatePresence>
    </section>
  )
}
