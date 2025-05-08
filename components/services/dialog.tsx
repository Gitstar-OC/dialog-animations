"use client"

import type React from "react"

import { motion, AnimatePresence } from "motion/react"
import Image from "next/image"
import { X } from "lucide-react"
import type { CardData } from "@/lib/card-data"
import { useEffect, useRef } from "react"
import { ScrollArea } from "@/components/ui/scroll-area"

interface DialogProps {
  isDialogOpen: boolean
  selectedCard: (typeof CardData)[0] | null
  closeDialog: () => void
  isAnimating: boolean
  modalRef: React.RefObject<HTMLDivElement>
}

export function Dialog({ isDialogOpen, selectedCard, closeDialog, isAnimating, modalRef }: DialogProps) {
  // Store original body overflow style
  const originalOverflowRef = useRef<string>("")

  // Handle body overflow
  useEffect(() => {
    // Store original overflow style only once
    if (originalOverflowRef.current === "") {
      originalOverflowRef.current = window.getComputedStyle(document.body).overflow
    }

    if (isDialogOpen) {
      // Save scroll position and prevent scrolling
      const scrollY = window.scrollY
      document.body.style.position = "fixed"
      document.body.style.top = `-${scrollY}px`
      document.body.style.width = "100%"
      document.body.style.overflow = "hidden"
    } else {
      // Restore scrolling and position
      const scrollY = document.body.style.top
      document.body.style.position = ""
      document.body.style.top = ""
      document.body.style.width = ""
      document.body.style.overflow = originalOverflowRef.current || ""

      if (scrollY) {
        window.scrollTo(0, Number.parseInt(scrollY || "0") * -1)
      }
    }

    // Cleanup function to ensure overflow is reset
    return () => {
      const scrollY = document.body.style.top
      document.body.style.position = ""
      document.body.style.top = ""
      document.body.style.width = ""
      document.body.style.overflow = originalOverflowRef.current || ""

      if (scrollY) {
        window.scrollTo(0, Number.parseInt(scrollY || "0") * -1)
      }
    }
  }, [isDialogOpen])

  if (!selectedCard) return null

  return (
    <AnimatePresence mode="wait">
      {isDialogOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden" style={{ pointerEvents: isDialogOpen ? "auto" : "none" }}>
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
              className="relative bg-white rounded-t-3xl max-w-3xl w-full mx-4 h-[95vh] z-10 shadow-xl"
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
  )
}
