"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, RefreshCw, Save, Share2, Trophy } from "lucide-react"
import { AudioPlayer } from "@/components/rhymemind/audio-player"
import { LyricsSection } from "@/components/rhymemind/lyrics-section"
import { BottomNav } from "@/components/rhymemind/bottom-nav"
import { cn } from "@/lib/utils"

const SAMPLE_BLOCKLIST = [
  "sample-3",
  "sample-3s",
  "sample-3s.mp3",
  "samplelib",
  "download.samplelib",
  "/sample-3s.mp3",
]

function isValidAudioUrl(url: string | null | undefined): url is string {
  if (!url || typeof url !== "string" || !url.trim()) return false
  const lower = url.toLowerCase()
  if (SAMPLE_BLOCKLIST.some((s) => lower.includes(s))) return false
  if (!url.startsWith("http")) return false
  return true
}

const vibeLabels: Record<string, string> = {
  hype: "Hype",
  chill: "Chill",
  smooth: "Smooth",
  hard: "Hard",
}

export default function ResultPage() {
  const router = useRouter()
  const params = useParams<{ id: string }>()
  const songId = params?.id

  const [vibe, setVibe] = useState<string | null>(null)
  const [saved, setSaved] = useState(false)
  const [title, setTitle] = useState("나만의 스터디 트랙")
  const [audioUrl, setAudioUrl] = useState<string | null>(null)
  const [lyrics, setLyrics] = useState<string | null>(null)
  const [isPublishing, setIsPublishing] = useState(false)
  const [isGeneratingMusic, setIsGeneratingMusic] = useState(false)
  const [durationLabel, setDurationLabel] = useState<string | null>(null)

  useEffect(() => {
    if (!songId) return

    const storedVibe = sessionStorage.getItem("rhymemind-vibe")
    if (storedVibe) setVibe(storedVibe)

    const fetchSong = async () => {
      try {
        const res = await fetch(`/api/songs/${songId}`)
        if (!res.ok) return
        const data = (await res.json()) as {
          id: string
          title?: string
          lyrics?: string
          audioUrl?: string | null
          vibe?: string | null
        }

        console.error("[result] song:", data)
        console.error("[result] finalLyrics length:", data.lyrics?.length ?? 0)

        if (data.title) setTitle(data.title)
        if (data.vibe) setVibe(data.vibe)

        let finalLyrics = data.lyrics ?? ""
        if (!finalLyrics) {
          const lastId = sessionStorage.getItem("rhymemind-last-song-id")
          const lastLyrics = sessionStorage.getItem("rhymemind-last-lyrics")
          if (lastId === songId && lastLyrics) finalLyrics = lastLyrics
        }
        setLyrics(finalLyrics || null)

        let finalAudioUrl: string | null = null
        const dbAudioUrl = data.audioUrl ?? null
        if (isValidAudioUrl(dbAudioUrl)) {
          finalAudioUrl = dbAudioUrl
        } else {
          const lastId = sessionStorage.getItem("rhymemind-last-song-id")
          const lastAudioUrl = sessionStorage.getItem("rhymemind-last-audio-url")
          if (lastId === songId && isValidAudioUrl(lastAudioUrl)) {
            finalAudioUrl = lastAudioUrl
          }
          if (lastAudioUrl && !isValidAudioUrl(lastAudioUrl)) {
            sessionStorage.removeItem("rhymemind-last-audio-url")
          }
        }

        console.error("[result] finalAudioUrl:", finalAudioUrl)

        if (finalAudioUrl) {
          setAudioUrl(finalAudioUrl)
          setIsGeneratingMusic(false)
        } else if (finalLyrics) {
          setIsGeneratingMusic(true)
        }

        setDurationLabel(null)
      } catch (e) {
        console.error("[result] fetch error:", e)
      }
    }

    void fetchSong()
  }, [songId])

  useEffect(() => {
    if (!songId || !isGeneratingMusic) return

    const poll = async () => {
      try {
        const res = await fetch(`/api/songs/${songId}`)
        if (!res.ok) return
        const data = (await res.json()) as { audioUrl?: string | null }
        const url = data.audioUrl
        if (isValidAudioUrl(url)) {
          setAudioUrl(url)
          setIsGeneratingMusic(false)
        }
      } catch {
        // ignore
      }
    }

    const interval = setInterval(poll, 3000)
    poll()
    return () => clearInterval(interval)
  }, [songId, isGeneratingMusic])

  const actions = [
    {
      id: "regenerate",
      label: "재생성",
      icon: RefreshCw,
      onClick: () => router.push("/generate"),
    },
    {
      id: "save",
      label: saved ? "저장됨" : "저장",
      icon: Save,
      onClick: () => setSaved(true),
      active: saved,
    },
    {
      id: "share",
      label: "공유",
      icon: Share2,
      onClick: () => {
        if (navigator.share) {
          navigator.share({
            title,
            text: "RhymeMind로 만든 나만의 스터디 트랙을 들어보세요!",
            url: window.location.href,
          })
        }
      },
    },
    {
      id: "submit",
      label: isPublishing ? "출품 중..." : "출품",
      icon: Trophy,
      onClick: async () => {
        if (!songId || isPublishing) return
        try {
          setIsPublishing(true)
          const res = await fetch(`/api/songs/${songId}/publish`, { method: "POST" })
          if (!res.ok) {
            const data = await res.json().catch(() => null)
            alert(data?.error ?? "트랙을 출품하는 중 오류가 발생했습니다.")
            return
          }
          alert("커뮤니티 차트에 출품되었습니다!")
          router.push("/community")
        } finally {
          setIsPublishing(false)
        }
      },
    },
  ]

  return (
    <main className="min-h-screen bg-background flex flex-col pb-20">
      <header className="flex items-center justify-between px-5 py-4">
        <Link
          href="/"
          className="p-2 -ml-2 text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <span className="text-sm text-muted-foreground">생성 완료</span>
        <div className="w-9" />
      </header>

      <div className="flex-1 px-5 py-4 space-y-6 max-w-lg mx-auto w-full">
        <div className="text-center space-y-3">
          <h1 className="text-2xl font-bold text-foreground">{title}</h1>

          <div className="flex items-center justify-center gap-2">
            {vibe && (
              <span className="px-3 py-1 text-xs font-medium rounded-full bg-primary/10 text-primary border border-primary/20">
                {vibeLabels[vibe]}
              </span>
            )}
            {durationLabel && (
              <span className="px-3 py-1 text-xs font-medium rounded-full bg-secondary text-muted-foreground">
                {durationLabel}
              </span>
            )}
            <span className="px-3 py-1 text-xs font-medium rounded-full bg-secondary text-muted-foreground">
              90 BPM
            </span>
          </div>
        </div>

        {isGeneratingMusic && (
          <p className="text-sm text-muted-foreground text-center py-2">
            음악 생성 중... (약 30초 소요)
          </p>
        )}

        {isValidAudioUrl(audioUrl) ? (
          <AudioPlayer className="py-4" audioUrl={audioUrl} />
        ) : (
          <div className="py-6 text-center border border-destructive/30 rounded-xl bg-destructive/5">
            <p className="text-sm font-medium text-destructive">오디오 없음</p>
            <p className="text-xs text-muted-foreground mt-1">
              음악을 불러올 수 없습니다. 재생성을 시도해 주세요.
            </p>
          </div>
        )}

        {audioUrl && isValidAudioUrl(audioUrl) && (
          <p className="text-xs text-muted-foreground text-center">
            AI가 생성한 인스트루멘탈입니다. 가사와 함께 따라 불러보세요.
          </p>
        )}

        <div className="grid grid-cols-2 gap-3">
          {actions.map((action) => {
            const Icon = action.icon
            return (
              <button
                key={action.id}
                onClick={action.onClick}
                className={cn(
                  "flex items-center justify-center gap-2 py-3 px-4 rounded-xl border transition-all duration-200",
                  (action as { active?: boolean }).active
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

        <LyricsSection lyrics={lyrics ?? undefined} defaultExpanded={!!(lyrics?.trim())} />
      </div>

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
