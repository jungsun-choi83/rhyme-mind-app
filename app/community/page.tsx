"use client"

import { useEffect, useState } from "react"
import { Crown, Heart, Gift } from "lucide-react"
import { BottomNav } from "@/components/rhymemind/bottom-nav"
import { cn } from "@/lib/utils"

const filters = [
  { id: "all", label: "전체" },
  { id: "hype", label: "Hype" },
  { id: "chill", label: "Chill" },
  { id: "smooth", label: "Smooth" },
  { id: "hard", label: "Hard" },
]

type CommunitySong = {
  id: string
  title: string
  vibe: string | null
  votes: number | null
}

function MiniWaveform() {
  const bars = [30, 50, 70, 40, 60, 45, 55, 35]
  return (
    <div className="flex items-center gap-0.5 h-4">
      {bars.map((height, i) => (
        <div
          key={i}
          className="w-0.5 bg-muted-foreground rounded-full"
          style={{ height: `${height}%` }}
        />
      ))}
    </div>
  )
}

export default function CommunityPage() {
  const [activeFilter, setActiveFilter] = useState("all")
  const [votedTracks, setVotedTracks] = useState<string[]>([])
  const [tracks, setTracks] = useState<CommunitySong[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    let isMounted = true

    const load = async () => {
      try {
        const res = await fetch("/api/songs/public")
        if (!res.ok) {
          console.error("Failed to fetch public songs")
          return
        }
        const data = (await res.json()) as { songs: CommunitySong[] }
        if (!isMounted) return
        setTracks(
          data.songs.map((s, index) => ({
            ...s,
            votes: s.votes ?? 0,
          })),
        )
      } finally {
        if (isMounted) setIsLoading(false)
      }
    }

    load()

    return () => {
      isMounted = false
    }
  }, [])

  const handleVote = (trackId: string) => {
    setVotedTracks((prev) =>
      prev.includes(trackId) ? prev.filter((id) => id !== trackId) : [...prev, trackId],
    )
  }

  const filteredTracks =
    activeFilter === "all"
      ? tracks
      : tracks.filter((t) => (t.vibe ?? "").toLowerCase() === activeFilter)

  return (
    <main className="min-h-screen bg-background flex flex-col pb-20">
      {/* Header */}
      <header className="px-5 pt-8 pb-4">
        <h1 className="text-2xl font-bold text-foreground">커뮤니티 차트</h1>
        <p className="text-sm text-muted-foreground mt-1">이번 주 인기 스터디 트랙</p>
      </header>

      <div className="flex-1 px-5 py-4 space-y-4 max-w-lg mx-auto w-full">
        {/* Filter Chips */}
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
          {filters.map((filter) => (
            <button
              key={filter.id}
              onClick={() => setActiveFilter(filter.id)}
              className={cn(
                "flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-all duration-200",
                activeFilter === filter.id
                  ? "bg-primary text-primary-foreground"
                  : "bg-secondary text-muted-foreground hover:text-foreground"
              )}
            >
              {filter.label}
            </button>
          ))}
        </div>

        {/* Track List */}
        <div className="space-y-2">
          {isLoading && (
            <p className="text-xs text-muted-foreground">차트를 불러오는 중...</p>
          )}

          {!isLoading && filteredTracks.length === 0 && (
            <p className="text-xs text-muted-foreground">
              아직 출품된 트랙이 없습니다. 첫 번째 트랙을 출품해보세요!
            </p>
          )}

          {!isLoading &&
            filteredTracks.map((track, index) => {
              const isFirst = index === 0
              const isVoted = votedTracks.includes(track.id)

              return (
                <div
                  key={track.id}
                  className={cn(
                    "flex items-center gap-3 p-3 rounded-xl border transition-all duration-200",
                    isFirst
                      ? "border-primary/50 bg-primary/5"
                      : "border-border bg-card hover:border-muted-foreground",
                  )}
                >
                  {/* Rank */}
                  <div
                    className={cn(
                      "w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm",
                      isFirst
                        ? "bg-primary text-primary-foreground"
                        : "bg-secondary text-muted-foreground",
                    )}
                  >
                    {isFirst ? <Crown className="w-4 h-4" /> : index + 1}
                  </div>

                  {/* Track Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p
                        className={cn(
                          "font-medium truncate",
                          isFirst ? "text-primary" : "text-foreground",
                        )}
                      >
                        {track.title}
                      </p>
                      {track.vibe && (
                        <span className="flex-shrink-0 px-2 py-0.5 text-xs rounded bg-secondary text-muted-foreground">
                          {track.vibe}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Mini Waveform */}
                  <MiniWaveform />

                  {/* Vote Button (로컬 UI만) */}
                  <button
                    onClick={() => handleVote(track.id)}
                    className={cn(
                      "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200",
                      isVoted
                        ? "bg-primary/10 text-primary"
                        : "bg-secondary text-muted-foreground hover:text-foreground",
                    )}
                  >
                    <Heart className={cn("w-4 h-4", isVoted && "fill-primary")} />
                    <span>{(track.votes ?? 0) + (isVoted ? 1 : 0)}</span>
                  </button>
                </div>
              )
            })}
        </div>
      </div>

      {/* Prize Banner */}
      <div className="sticky bottom-0 p-5 bg-gradient-to-t from-background via-background to-transparent pt-10">
        <div className="bg-gradient-to-r from-primary/20 to-primary/10 border border-primary/30 rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
              <Gift className="w-5 h-5 text-primary" />
            </div>
            <div className="flex-1">
              <p className="font-bold text-foreground">이번 달 1위 상품</p>
              <p className="text-sm text-muted-foreground">무선 헤드폰 + 3개월 프리미엄</p>
            </div>
            <span className="px-3 py-1 text-xs font-bold rounded-full bg-primary text-primary-foreground">
              D-12
            </span>
          </div>
        </div>
      </div>

      <BottomNav />
    </main>
  )
}
