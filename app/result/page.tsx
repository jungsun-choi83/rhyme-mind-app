"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, RefreshCw, Save, Share2, Trophy } from "lucide-react"
import { AudioPlayer } from "@/components/rhymemind/audio-player"
import { LyricsSection } from "@/components/rhymemind/lyrics-section"
import { BottomNav } from "@/components/rhymemind/bottom-nav"
import { cn } from "@/lib/utils"

const vibeLabels: Record<string, string> = {
  hype: "Hype",
  chill: "Chill", 
  smooth: "Smooth",
  hard: "Hard"
}

export default function ResultPage() {
  const router = useRouter()
  const [vibe, setVibe] = useState<string | null>(null)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    const storedVibe = sessionStorage.getItem("rhymemind-vibe")
    if (storedVibe) {
      setVibe(storedVibe)
    }
  }, [])

  const actions = [
    {
      id: "regenerate",
      label: "재생성",
      icon: RefreshCw,
      onClick: () => router.push("/generate")
    },
    {
      id: "save",
      label: saved ? "저장됨" : "저장",
      icon: Save,
      onClick: () => setSaved(true),
      active: saved
    },
    {
      id: "share",
      label: "공유",
      icon: Share2,
      onClick: () => {
        if (navigator.share) {
          navigator.share({
            title: "삼국시대 암기 트랙 - RhymeMind",
            text: "RhymeMind로 만든 나만의 스터디 트랙을 들어보세요!",
            url: window.location.href
          })
        }
      }
    },
    {
      id: "submit",
      label: "출품",
      icon: Trophy,
      onClick: () => router.push("/community")
    }
  ]

  return (
    <main className="min-h-screen bg-background flex flex-col pb-20">
      {/* Header */}
      <header className="flex items-center justify-between px-5 py-4">
        <Link href="/" className="p-2 -ml-2 text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <span className="text-sm text-muted-foreground">생성 완료</span>
        <div className="w-9" />
      </header>

      <div className="flex-1 px-5 py-4 space-y-6 max-w-lg mx-auto w-full">
        {/* Track Info */}
        <div className="text-center space-y-3">
          <h1 className="text-2xl font-bold text-foreground">삼국시대 암기 트랙</h1>
          
          <div className="flex items-center justify-center gap-2">
            {vibe && (
              <span className="px-3 py-1 text-xs font-medium rounded-full bg-primary/10 text-primary border border-primary/20">
                {vibeLabels[vibe]}
              </span>
            )}
            <span className="px-3 py-1 text-xs font-medium rounded-full bg-secondary text-muted-foreground">
              2:36
            </span>
            <span className="px-3 py-1 text-xs font-medium rounded-full bg-secondary text-muted-foreground">
              90 BPM
            </span>
          </div>
        </div>

        {/* Audio Player */}
        <AudioPlayer className="py-4" />

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-3">
          {actions.map((action) => {
            const Icon = action.icon
            return (
              <button
                key={action.id}
                onClick={action.onClick}
                className={cn(
                  "flex items-center justify-center gap-2 py-3 px-4 rounded-xl border transition-all duration-200",
                  action.active
                    ? "bg-primary/10 border-primary text-primary"
                    : "bg-card border-border text-foreground hover:border-muted-foreground"
                )}
              >
                <Icon className="w-4 h-4" />
                <span className="text-sm font-medium">{action.label}</span>
              </button>
            )
          })}
        </div>

        {/* Lyrics Section */}
        <LyricsSection />
      </div>

      {/* Bottom CTA */}
      <div className="sticky bottom-0 p-5 bg-gradient-to-t from-background via-background to-transparent pt-10">
        <Link
          href="/"
          className="w-full py-4 rounded-xl font-bold text-base transition-all duration-200 flex items-center justify-center gap-2 bg-secondary text-foreground hover:bg-secondary/80"
        >
          새 트랙 만들기
        </Link>
      </div>

      <BottomNav />
    </main>
  )
}
