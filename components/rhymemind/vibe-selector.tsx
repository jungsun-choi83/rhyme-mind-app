"use client"

import { cn } from "@/lib/utils"
import { Flame, Waves, Wind, Zap } from "lucide-react"

const vibes = [
  {
    id: "hype",
    label: "Hype",
    korean: "격렬한",
    icon: Flame,
    description: "에너지 넘치는 비트"
  },
  {
    id: "chill",
    label: "Chill",
    korean: "차분한",
    icon: Waves,
    description: "편안한 로파이"
  },
  {
    id: "smooth",
    label: "Smooth",
    korean: "부드러운",
    icon: Wind,
    description: "그루비한 R&B"
  },
  {
    id: "hard",
    label: "Hard",
    korean: "강렬한",
    icon: Zap,
    description: "트랩 베이스"
  }
]

interface VibeSelectorProps {
  selected: string | null
  onSelect: (id: string) => void
}

export function VibeSelector({ selected, onSelect }: VibeSelectorProps) {
  return (
    <div className="grid grid-cols-2 gap-3">
      {vibes.map((vibe) => {
        const Icon = vibe.icon
        const isSelected = selected === vibe.id
        
        return (
          <button
            key={vibe.id}
            onClick={() => onSelect(vibe.id)}
            className={cn(
              "relative p-4 rounded-xl border-2 transition-all duration-200 text-left",
              "hover:border-primary/50 hover:bg-secondary/50",
              isSelected 
                ? "border-primary bg-primary/10" 
                : "border-border bg-card"
            )}
          >
            <div className="flex items-start justify-between mb-2">
              <Icon className={cn(
                "w-5 h-5",
                isSelected ? "text-primary" : "text-muted-foreground"
              )} />
              {isSelected && (
                <div className="w-2 h-2 rounded-full bg-primary" />
              )}
            </div>
            <div className="space-y-0.5">
              <p className={cn(
                "font-bold text-sm",
                isSelected ? "text-primary" : "text-foreground"
              )}>
                {vibe.label}
              </p>
              <p className="text-xs text-muted-foreground">{vibe.korean}</p>
            </div>
            <p className="text-xs text-muted-foreground mt-2">{vibe.description}</p>
          </button>
        )
      })}
    </div>
  )
}
