"use client"

import Link from "next/link"
import { Zap } from "lucide-react"

export function Header() {
  return (
    <header className="flex items-center justify-between px-5 py-4">
      <Link href="/" className="flex items-center gap-3">
        <div className="w-9 h-9 bg-primary rounded-lg flex items-center justify-center">
          <span className="text-primary-foreground font-bold text-sm font-mono">RM</span>
        </div>
        <div className="flex flex-col leading-tight">
          <span className="font-bold text-lg text-foreground">RhymeMind</span>
          <span className="text-[10px] font-semibold tracking-[0.2em] uppercase text-muted-foreground">
            DON&apos;T STUDY. DROP A TRACK.
          </span>
        </div>
      </Link>

      <div className="flex items-center gap-2 bg-secondary px-3 py-1.5 rounded-full">
        <Zap className="w-4 h-4 text-primary fill-primary" />
        <span className="text-sm font-medium text-foreground">12 크레딧</span>
      </div>
    </header>
  )
}
