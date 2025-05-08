"use client"

import { motion } from "motion/react"
import Image from "next/image"
import { Plus } from "lucide-react"
import type { CardData } from "@/lib/card-data"

interface CardProps {
  card: (typeof CardData)[0]
  index: number
  openDialog: (card: (typeof CardData)[0]) => void
}

export function Card({ card, index, openDialog }: CardProps) {
  const truncateDescription = (text: string, maxLength = 70) => {
    if (text.length <= maxLength) return text
    return text.substring(0, maxLength) + "..."
  }

  return (
    <motion.div
      layoutId={`card-${card.title}`}
      key={index}
      className="w-[320px] h-[400px] group flex-none cursor-pointer bg-white rounded-[2rem] p-3 shadow-sm border border-neutral-400 snap-start"
      onClick={() => openDialog(card)}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
    >
      <div className="relative h-full w-full rounded-[1.5rem] overflow-hidden">
        <div className="absolute inset-0 group-hover:bg-black/35 z-10 transition-colors"></div>

        <motion.div layoutId={`image-container-${card.title}`} className="absolute inset-0 w-full h-full">
          <Image
            src={card.image || "/placeholder.svg"}
            alt={card.title}
            fill
            sizes="325px"
            className="object-cover"
            priority={index < 2}
          />
        </motion.div>

        <div className="absolute inset-0 z-20 p-8 flex flex-col justify-between">
          <motion.h3 layoutId={`title-${card.title}`} className="text-white text-[32px]/[1.1] font-semibold">
            {card.title}
          </motion.h3>

          <div className="flex items-end justify-between">
            <motion.p layoutId={`description-${card.title}`} className="text-white text-[14px]/[1.2] max-w-[70%]">
              {truncateDescription(card.description)}
            </motion.p>

            <div className="w-12 h-12 rounded-full border group-hover:bg-black/40 border-white bg-transparent flex items-center justify-center transition-colors">
              <Plus className="text-white w-6 h-6" />
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  )
}
