"use client"

import { cn } from "@/lib/utils"

interface WaveformAnimationProps {
  bars?: number
  className?: string
}

export function WaveformAnimation({ bars = 8, className }: WaveformAnimationProps) {
  return (
    <div className={cn("flex items-center justify-center gap-1", className)}>
      {Array.from({ length: bars }).map((_, i) => (
        <div
          key={i}
          className="w-1.5 bg-primary rounded-full animate-waveform"
          style={{
            height: "40px",
            animationDelay: `${i * 0.1}s`,
          }}
        />
      ))}
    </div>
  )
}
