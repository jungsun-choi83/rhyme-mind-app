"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Play, Share2, Disc3, Plus, Clock } from "lucide-react"
import { BottomNav } from "@/components/rhymemind/bottom-nav"
import { cn } from "@/lib/utils"

interface Track {
  id: string
  title: string
  vibe: string | null
  createdAt: string
}

function MiniWaveform({ isPlaying }: { isPlaying: boolean }) {
  return (
    <div className="flex items-center gap-0.5 h-8">
      {[...Array(12)].map((_, i) => (
        <div
          key={i}
          className={cn(
            "w-1 rounded-full transition-all duration-300",
            isPlaying ? "bg-primary animate-waveform" : "bg-muted-foreground/50"
          )}
          style={{
            height: isPlaying ? undefined : `${Math.random() * 16 + 8}px`,
            animationDelay: `${i * 0.08}s`,
          }}
        />
      ))}
    </div>
  )
}

function TrackCard({ track, onPlay }: { track: Track; onPlay: () => void }) {
  const [isHovered, setIsHovered] = useState(false)

  const vibeColors: Record<string, string> = {
    Hype: "bg-red-500/20 text-red-400",
    Chill: "bg-blue-500/20 text-blue-400",
    Smooth: "bg-purple-500/20 text-purple-400",
    Hard: "bg-orange-500/20 text-orange-400",
  }

  return (
    <div
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={cn(
        "relative bg-card border border-border rounded-xl p-4 transition-all duration-200",
        "hover:border-primary/50 hover:scale-[1.02] active:scale-[0.98]",
        "cursor-pointer group"
      )}
    >
      {/* Play Overlay */}
      <div className={cn(
        "absolute inset-0 bg-background/80 rounded-xl flex items-center justify-center transition-opacity duration-200",
        isHovered ? "opacity-100" : "opacity-0 pointer-events-none"
      )}>
        <button
          onClick={onPlay}
          className="w-14 h-14 rounded-full bg-primary flex items-center justify-center transition-transform hover:scale-110 active:scale-95"
        >
          <Play className="w-6 h-6 text-primary-foreground ml-1" fill="currentColor" />
        </button>
      </div>

      {/* Waveform */}
      <div className="mb-3">
        <MiniWaveform isPlaying={false} />
      </div>

      {/* Title */}
      <h3 className="font-bold text-foreground text-sm truncate mb-2">{track.title}</h3>

      {/* Meta */}
      <div className="flex items-center justify-between">
        <span className={cn("text-[10px] font-medium px-2 py-0.5 rounded-full", vibeColors[track.vibe])}>
          {track.vibe}
        </span>
        <div className="flex items-center gap-1 text-muted-foreground">
          <Clock className="w-3 h-3" />
          <span className="text-[10px]">{track.createdAt}</span>
        </div>
      </div>

      {/* Share Button */}
      <button 
        className="absolute top-3 right-3 p-2 rounded-full bg-secondary/50 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-secondary active:scale-95"
        onClick={(e) => {
          e.stopPropagation()
          // Handle share
        }}
      >
        <Share2 className="w-4 h-4 text-muted-foreground" />
      </button>
    </div>
  )
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-20 px-5 text-center">
      <div className="w-20 h-20 rounded-full bg-secondary flex items-center justify-center mb-6">
        <Disc3 className="w-10 h-10 text-muted-foreground" />
      </div>
      <h2 className="text-xl font-bold text-foreground mb-2">Your studio is empty</h2>
      <p className="text-muted-foreground text-sm mb-6">Drop your first beat!</p>
      <Link
        href="/"
        className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-full font-bold text-sm transition-all hover:bg-primary/90 active:scale-95"
      >
        <Plus className="w-4 h-4" />
        Create Track
      </Link>
    </div>
  )
}

export default function LibraryPage() {
  const [myTracks, setMyTracks] = useState<Track[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    let isMounted = true

    const load = async () => {
      try {
        const userId = window.localStorage.getItem("rhymemind-user-id")
        if (!userId) {
          setMyTracks([])
          return
        }
        const res = await fetch(`/api/songs/mine?userId=${encodeURIComponent(userId)}`)
        if (!res.ok) {
          console.error("Failed to fetch my songs")
          return
        }
        const data = (await res.json()) as {
          songs: { id: string; title: string; vibe: string | null; inserted_at: string }[]
        }
        if (!isMounted) return
        const mapped: Track[] = data.songs.map((s) => ({
          id: s.id,
          title: s.title,
          vibe: s.vibe,
          createdAt: new Date(s.inserted_at).toLocaleDateString("ko-KR"),
        }))
        setMyTracks(mapped)
      } finally {
        if (isMounted) setIsLoading(false)
      }
    }

    load()

    return () => {
      isMounted = false
    }
  }, [])

  const hasNoTracks = !isLoading && myTracks.length === 0

  return (
    <main className="min-h-screen bg-background pb-24">
      {/* Header */}
      <div className="px-5 pt-8 pb-6">
        {/* User Profile Mini-card */}
        <div className="flex items-center gap-4 p-4 bg-card rounded-xl border border-border">
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-amber-500 flex items-center justify-center">
            <span className="text-lg font-black text-primary-foreground">R</span>
          </div>
          <div className="flex-1">
            <h2 className="font-bold text-foreground">@rhymemaster</h2>
            <p className="text-sm text-muted-foreground">
              <span className="text-primary font-semibold">{myTracks.length}</span> tracks created
            </p>
          </div>
        </div>
      </div>

      {/* Section Header */}
      <div className="px-5 mb-4 flex items-center justify-between">
        <h2 className="text-lg font-bold text-foreground">My Tracks</h2>
        <button className="text-xs text-muted-foreground hover:text-foreground transition-colors">
          Sort by recent
        </button>
      </div>

      {/* Track Grid or Empty State */}
      {isLoading ? (
        <p className="px-5 text-xs text-muted-foreground">내 트랙을 불러오는 중...</p>
      ) : hasNoTracks ? (
        <EmptyState />
      ) : (
        <div className="px-5 grid grid-cols-2 gap-3">
          {myTracks.map((track) => (
            <TrackCard
              key={track.id}
              track={track}
              onPlay={() => {
                // Navigate to player or play inline
              }}
            />
          ))}
        </div>
      )}

      <BottomNav />
    </main>
  )
}
