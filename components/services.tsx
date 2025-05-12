"use client"

import type React from "react"
import { useRef, useState, useEffect, Suspense } from "react"
import { useRouter, usePathname, useSearchParams } from "next/navigation"
import { CardData } from "@/lib/card-data"
import { Card } from "@/components/services/card"
import { Header } from "@/components/core/header"
import { ChevronLeft, ChevronRight, X } from "lucide-react"
import { AnimatePresence, motion } from "motion/react"
import Image from "next/image"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useOnClickOutside } from "usehooks-ts"

// This component handles URL synchronization
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

export default function Services() {
  const router = useRouter()
  const pathname = usePathname()
  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const modalRef = useRef<HTMLDivElement>(null)
  const [canScrollLeft, setCanScrollLeft] = useState(false)
  const [canScrollRight, setCanScrollRight] = useState(true)
  const [selectedCard, setSelectedCard] = useState<(typeof CardData)[0] | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  // Track if we're in the process of opening or closing
  const [isClosing, setIsClosing] = useState(false)

  // Reference to store the original body overflow style
  const originalBodyStyle = useRef({
    overflow: "",
    paddingRight: "",
  })

  // Function to lock body scroll
  const lockBodyScroll = () => {
    // Store original values
    originalBodyStyle.current = {
      overflow: document.body.style.overflow,
      paddingRight: document.body.style.paddingRight,
    }

    // Calculate scrollbar width to prevent layout shift
    const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth

    // Apply styles to lock scroll
    document.body.style.overflow = "hidden"
    document.body.style.paddingRight = `${scrollbarWidth}px`
  }

  // Function to unlock body scroll
  const unlockBodyScroll = () => {
    // Restore original styles
    document.body.style.overflow = originalBodyStyle.current.overflow
    document.body.style.paddingRight = originalBodyStyle.current.paddingRight
  }

  // Handle opening a card
  const openDialog = (card: (typeof CardData)[0]) => {
    if (isClosing) return

    // Set the selected card first
    setSelectedCard(card)

    // Lock scroll before animation starts
    lockBodyScroll()

    // Update URL and open dialog
    router.replace(`${pathname}?modal=${card.title.toLowerCase()}`, {
      scroll: false,
    })

    // Set dialog to open
    setIsDialogOpen(true)
  }

  // Handle closing the dialog
  const closeDialog = () => {
    if (isClosing) return

    // Set closing state to prevent multiple clicks
    setIsClosing(true)

    // Update URL immediately
    router.replace(pathname, { scroll: false })

    // Start closing animation
    setIsDialogOpen(false)

    // After animation completes, clean up
    setTimeout(() => {
      unlockBodyScroll()
      setSelectedCard(null)
      setIsClosing(false)
    }, 200) // Match this with animation duration
  }

  // Handle click outside
  useOnClickOutside(
    modalRef as React.RefObject<HTMLElement>,
    () => {
      if (isDialogOpen && !isClosing) {
        closeDialog()
      }
    },
    "mousedown",
  )

  // Handle escape key
  useEffect(() => {
    const handleEscKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isDialogOpen && !isClosing) {
        closeDialog()
      }
    }

    window.addEventListener("keydown", handleEscKey)
    return () => window.removeEventListener("keydown", handleEscKey)
  }, [isDialogOpen, isClosing])

  // Handle URL changes
  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search)
    const modal = searchParams.get("modal")

    if (modal && !isDialogOpen && !isClosing) {
      const card = CardData.find((card) => card.title.toLowerCase() === modal)
      if (card) {
        setSelectedCard(card)
        lockBodyScroll()
        setIsDialogOpen(true)
      }
    }
  }, [isDialogOpen, isClosing])

  // Handle scroll position checking
  useEffect(() => {
    const checkScrollPosition = () => {
      if (scrollContainerRef.current) {
        const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current
        setCanScrollLeft(scrollLeft > 0)
        setCanScrollRight(scrollLeft + clientWidth < scrollWidth - 1)
      }
    }

    checkScrollPosition()

    const scrollContainer = scrollContainerRef.current
    if (scrollContainer) {
      scrollContainer.addEventListener("scroll", checkScrollPosition)
    }

    return () => {
      if (scrollContainer) {
        scrollContainer.removeEventListener("scroll", checkScrollPosition)
      }
    }
  }, [])

  // Scroll handlers
  const handleScrollLeft = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({
        left: -325,
        behavior: "smooth",
      })
    }
  }

  const handleScrollRight = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({
        left: 325,
        behavior: "smooth",
      })
    }
  }

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
        >
          {CardData.map((card, index) => (
            <div key={index} className="snap-center shrink-0">
              <Card card={card} index={index} openDialog={openDialog} />
            </div>
          ))}
        </div>
        <div className="flex justify-center gap-4 mt-4">
          <button
            onClick={handleScrollLeft}
            className={`w-10 h-10 rounded-full cursor-pointer border border-gray-300 flex items-center justify-center ${
              canScrollLeft ? "bg-[#fff] hover:bg-[#eee]" : "bg-transparent cursor-default"
            }`}
            aria-label="Previous card"
            disabled={!canScrollLeft}
          >
            <ChevronLeft className={`w-6 h-6 ${!canScrollLeft ? "text-gray-500" : ""}`} style={{ strokeWidth: 2 }} />
          </button>
          <button
            onClick={handleScrollRight}
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

      {/* Modal Dialog */}
      <AnimatePresence mode="wait" initial={false}>
        {isDialogOpen && selectedCard && (
          <div className="fixed inset-0 z-50 overflow-hidden">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-[#fcfcfc]"
              onClick={closeDialog}
              transition={{ duration: 0.2 }}
            />

            {/* Modal Container */}
            <div className="absolute inset-x-0 bottom-0 flex justify-center">
              <motion.div
                layoutId={`card-${selectedCard.title}`}
                ref={modalRef}
                className="relative bg-white rounded-t-3xl max-w-3xl w-full md:mx-4 mx-0 h-[95vh] z-10 shadow-xl"
                onClick={(e) => e.stopPropagation()}
                transition={{
                  type: "spring",
                  stiffness: 300,
                  damping: 30,
                  layout: { duration: 0.2 },
                }}
                style={{
                  willChange: "transform",
                  transform: "translateZ(0)",
                }}
              >
                {/* Close button with direct DOM manipulation for instant feedback */}
                <button
                  onClick={(e) => {
                    // Provide immediate visual feedback
                    const target = e.currentTarget
                    target.style.transform = "scale(0.95)"

                    // Reset after a short delay
                    setTimeout(() => {
                      target.style.transform = ""
                    }, 100)

                    closeDialog()
                  }}
                  className="absolute top-4 right-4 z-50 bg-white rounded-full p-2 hover:bg-white/90 transition-colors"
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
                    >
                      <Image
                        src={selectedCard.image || "/placeholder.svg"}
                        alt={selectedCard.title}
                        fill
                        priority
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
        )}
      </AnimatePresence>
    </section>
  )
}
