"use client"

import { useRef, useState, useEffect } from "react"
import { useRouter, usePathname, useSearchParams } from "next/navigation"
import { CardData } from "@/lib/card-data"
import { Card } from "@/components/services/card"
import { Header } from "@/components/core/header"
import { ChevronLeft, ChevronRight, X } from "lucide-react"
import { AnimatePresence, motion } from "motion/react"
import Image from "next/image"
import { ScrollArea } from "@/components/ui/scroll-area"
import {useOnClickOutside} from "usehooks-ts"

export default function Services() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const modalRef = useRef<HTMLDivElement>(null)
  const [canScrollLeft, setCanScrollLeft] = useState(false)
  const [canScrollRight, setCanScrollRight] = useState(true)
  const [selectedCard, setSelectedCard] = useState<(typeof CardData)[0] | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isAnimating, setIsAnimating] = useState(false)
  const [isOverflowAuto, setIsOverflowAuto] = useState(true)
  const scrollPositionRef = useRef(0);
  
  useEffect(() => {
    if (typeof document !== 'undefined') {
      if (!isOverflowAuto) {
        // Save scroll position before locking
        scrollPositionRef.current = window.scrollY;
        
        // Add a class to the body instead of directly modifying styles
        document.body.classList.add('modal-open');
        
        // Prevent scrolling with fixed positioning that maintains the scroll position visually
        document.body.style.position = 'fixed';
        document.body.style.top = `-${scrollPositionRef.current}px`;
        document.body.style.width = '100%';
      } else {
        // Restore scrolling
        document.body.classList.remove('modal-open');
        document.body.style.position = '';
        document.body.style.top = '';
        document.body.style.width = '';
        
        // Restore scroll position
        window.scrollTo(0, scrollPositionRef.current);
      }
    }
    
    return () => {
      // Cleanup on unmount
      if (typeof document !== 'undefined') {
        document.body.classList.remove('modal-open');
        document.body.style.position = '';
        document.body.style.top = '';
        document.body.style.width = '';
        window.scrollTo(0, scrollPositionRef.current);
      }
    }
  }, [isOverflowAuto]);


  useOnClickOutside(modalRef, () => {
    if (isDialogOpen && !isAnimating) {   
        closeDialog()
    }
  }, "mousedown")

  useEffect(() => {
    const modal = searchParams.get("modal")
    if (modal && !isDialogOpen) {
      const card = CardData.find((card) => card.title.toLowerCase() === modal)
      if (card) {
        setSelectedCard(card)
        setIsDialogOpen(true)
      }
    }
  }, [searchParams, isDialogOpen])

  const openDialog = (card: (typeof CardData)[0]) => {
    if (isAnimating) return

    setIsAnimating(true)
    setSelectedCard(card)
    setIsDialogOpen(true)
    setIsOverflowAuto(false)
    router.replace(`${pathname}?modal=${card.title.toLowerCase()}`, {
      scroll: false,
    })

    setTimeout(() => {
      setIsAnimating(false)
    }, 500)
  }

  const closeDialog = () => {
    if (isAnimating) return

    setIsAnimating(true)
    setIsDialogOpen(false)
    router.replace(pathname, { scroll: false })
    setIsOverflowAuto(true)
    setTimeout(() => {
      setIsAnimating(false)
      setSelectedCard(null)
    }, 500)
  }

  useEffect(() => {
    const handleEscKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isDialogOpen && !isAnimating) {
        closeDialog()
      }
    }

    window.addEventListener("keydown", handleEscKey)
    return () => window.removeEventListener("keydown", handleEscKey)
  }, [isDialogOpen, isAnimating])

  const checkScrollPosition = () => {
    if (scrollContainerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current

      setCanScrollLeft(scrollLeft > 0)
      setCanScrollRight(scrollLeft + clientWidth < scrollWidth - 1)
    }
  }

  useEffect(() => {
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

  return (
    <div
      className="min-h-[200vh] pt-20"
      style={{
        background:
          "linear-gradient(180deg, rgba(226, 238, 255, 0.35) 0%, #F8FBFF 46.63%, rgba(226, 238, 255, 0.35) 100%)",
      }}
    >
      <Header
        title="Your Brand, Amplified"
        className="gap-3"
        description="Innovative multi-channel advertising solutions built for the cannabis industry."
      />

      <div className="py-12">
        <div
          ref={scrollContainerRef}
          className="flex overflow-auto scroll-smooth gap-4 pb-8 pr-8 pl-8 md:pr-20 md:pl-20 hide-scrollbar"
          style={{
            scrollbarWidth: "none",
            msOverflowStyle: "none",
          }}
        >
          {CardData.map((card, index) => (
            <Card key={index} card={card} index={index} openDialog={openDialog} />
          ))}
        </div>
        <div className="flex justify-center gap-4 mt-4">
          <button
            onClick={() => {
              if (scrollContainerRef.current) {
                scrollContainerRef.current.scrollBy({ left: -325, behavior: "smooth" })
              }
            }}
            className={`w-10 h-10 rounded-full cursor-pointer border border-gray-300 flex items-center justify-center ${
              canScrollLeft ? "bg-[#fff] hover:bg-[#eee]" : "bg-transparent cursor-default"
            }`}
            aria-label="Previous card"
            disabled={!canScrollLeft}
          >
            <ChevronLeft className={`w-6 h-6 ${!canScrollLeft ? "text-gray-500" : ""}`} style={{ strokeWidth: 2 }} />
          </button>
          <button
            onClick={() => {
              if (scrollContainerRef.current) {
                scrollContainerRef.current.scrollBy({ left: 325, behavior: "smooth" })
              }
            }}
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

      {/* Dialog */}
      <AnimatePresence>
        {isDialogOpen && selectedCard && (
          <div className="fixed inset-0 z-50 overflow-hidden">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-[#fcfcfc]"
              onClick={closeDialog}
              transition={{ duration: 0.3 }}
            />

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
                }}
              >
                {/* Close button */}
                <button
                  onClick={closeDialog}
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
    </div>
  )
}
