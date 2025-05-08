"use client"

import { cn } from "@/lib/utils"

interface HeaderProps {
  title: string
  description?: string
  className?: string
}

export function Header({ title, description, className }: HeaderProps) {
  return (
    <div className={cn("pt-18 flex flex-col justify-center items-center w-full gap-3", className)}>
      <h1 className="text-black text-center text-[28px]/[30px] sm:text-[30px]/[32px] md:text-[34px]/[34px] lg:text-[40px]/[40px] tracking-[0.6px] font-medium max-w-3xl text-balance">
        {title}
      </h1>
      <p className="text-[#666] text-center text-[18px]/[20px] sm:text-[20px]/[22px] md:text-[22px]/[25px] lg:text-[24px]/[27px] mt-6 lg:mt-2 md:mt-3 tracking-[0.1px] max-w-3xl text-balance">
        {description}
      </p>
    </div>
  )
}
