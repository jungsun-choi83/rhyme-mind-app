"use client"

import { useState } from "react"
import { cn } from "@/lib/utils"

const artists = [
  { id: "1", name: "BTS", style: "K-Pop" },
  { id: "2", name: "Epik High", style: "힙합" },
  { id: "3", name: "Jay Park", style: "R&B" },
  { id: "4", name: "Zico", style: "트랩" },
  { id: "5", name: "BewhY", style: "랩" },
  { id: "6", name: "Crush", style: "R&B" },
  { id: "7", name: "Dean", style: "얼터너티브" },
  { id: "8", name: "DPR Live", style: "힙합" },
]

interface ArtistChipsProps {
  selected: string[]
  onToggle: (name: string) => void
}

export function ArtistChips({ selected, onToggle }: ArtistChipsProps) {
  const [customName, setCustomName] = useState("")

  return (
    <div className="space-y-3">
      <p className="text-sm text-muted-foreground px-1">아티스트 레퍼런스</p>
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
        {artists.map((artist) => {
          const isSelected = selected.includes(artist.name)

          return (
            <button
              key={artist.id}
              onClick={() => onToggle(artist.name)}
              className={cn(
                "flex-shrink-0 px-4 py-2 rounded-full border transition-all duration-200",
                "text-sm font-medium whitespace-nowrap",
                isSelected
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-border bg-card text-foreground hover:border-muted-foreground",
              )}
            >
              {artist.name}
              <span className="text-muted-foreground ml-1.5 text-xs">{artist.style}</span>
            </button>
          )
        })}
      </div>

      <div className="flex items-center gap-2 px-1">
        <input
          type="text"
          value={customName}
          onChange={(e) => setCustomName(e.target.value)}
          placeholder="좋아하는 아티스트 이름 입력"
          className="flex-1 px-3 py-2 rounded-lg border border-border bg-card text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
        />
        <button
          type="button"
          onClick={() => {
            const name = customName.trim()
            if (!name) return
            onToggle(name)
            setCustomName("")
          }}
          className="px-3 py-2 rounded-lg bg-secondary text-xs font-semibold text-foreground hover:bg-secondary/80 transition-colors"
        >
          추가
        </button>
      </div>
    </div>
  )
}
