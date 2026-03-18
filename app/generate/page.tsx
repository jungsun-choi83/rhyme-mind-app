"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { WaveformAnimation } from "@/components/rhymemind/waveform-animation"

const fallbackPreview = [
  "삼국시대 고구려 백제 신라...",
  "역사 속으로 라임 타고 날아...",
  "외우기 힘든 내용들도...",
  "비트 위에서 기억에 남아...",
]

const vibeLabels: Record<string, string> = {
  hype: "Hype",
  chill: "Chill",
  smooth: "Smooth",
  hard: "Hard",
}

export default function GeneratePage() {
  const router = useRouter()
  const [progress, setProgress] = useState(0)
  const [currentLine, setCurrentLine] = useState(0)
  const [previewLines, setPreviewLines] = useState<string[]>(fallbackPreview)
  const [vibe, setVibe] = useState<string | null>(null)
  const [language, setLanguage] = useState<"ko" | "en">("ko")

  useEffect(() => {
    const storedVibe = sessionStorage.getItem("rhymemind-vibe")
    if (storedVibe) {
      setVibe(storedVibe)
    }

    const storedLang = sessionStorage.getItem("rhymemind-language")
    if (storedLang === "ko" || storedLang === "en") {
      setLanguage(storedLang)
    }

    const content = sessionStorage.getItem("rhymemind-content")
    if (!content || !storedVibe) {
      router.replace("/")
      return
    }

    const artistsRaw = sessionStorage.getItem("rhymemind-artists")
    let artists: string[] = []
    try {
      artists = artistsRaw ? JSON.parse(artistsRaw) : []
    } catch {
      artists = []
    }

    let isCancelled = false

    const controller = new AbortController()

    const callGenerate = async () => {
      try {
        const storedUserId =
          typeof window !== "undefined"
            ? window.localStorage.getItem("rhymemind-user-id")
            : null
        const res = await fetch("/api/generate", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            content,
            vibe: storedVibe,
            artists,
            ...(storedUserId ? { userId: storedUserId } : {}),
          }),
          signal: controller.signal,
        })

        if (!res.ok) {
          if (res.status === 402) {
            alert("크레딧이 부족합니다. 스토어에서 크레딧을 충전해주세요.")
            router.replace("/store")
            return
          }

          const data = await res.json().catch(() => null)
          const message = data?.error ?? "트랙 생성 중 오류가 발생했습니다."
          const detail = data?.detail ? `\n\n[상세] ${data.detail}` : ""
          alert(message + detail)
          router.replace("/")
          return
        }

        const data = (await res.json()) as {
          id: string
          lyrics: string
          audioUrl: string
          profile?: { id: string; credits?: number }
        }

        if (isCancelled) return

        if (data.profile?.id && typeof window !== "undefined") {
          window.localStorage.setItem("rhymemind-user-id", data.profile.id)
        }

        const lyricLines = data.lyrics
          .split("\n")
          .map((l) => l.trim())
          .filter(Boolean)

        if (lyricLines.length >= 3) {
          setPreviewLines(lyricLines.slice(0, 4))
        }

        sessionStorage.setItem("rhymemind-last-song-id", data.id)
        sessionStorage.setItem("rhymemind-last-lyrics", data.lyrics)
        const blocklist = [
          "sample-3",
          "sample-3s",
          "sample-3s.mp3",
          "samplelib.com",
          "download.samplelib.com",
        ]
        const isSample =
          !data.audioUrl ||
          !data.audioUrl.startsWith("http") ||
          blocklist.some((s) => data.audioUrl.toLowerCase().includes(s))
        if (!isSample) {
          sessionStorage.setItem("rhymemind-last-audio-url", data.audioUrl)
        }

        setProgress(100)
        setTimeout(() => {
          router.replace(`/result/${data.id}`)
        }, 600)
      } catch (error) {
        if ((error as any)?.name === "AbortError") return
        console.error("Failed to call /api/generate", error)
        alert("트랙 생성 중 오류가 발생했습니다.")
        router.replace("/")
      }
    }

    callGenerate()

    return () => {
      isCancelled = true
      controller.abort()
    }
  }, [router])

  useEffect(() => {
    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 95) return prev
        return prev + 1
      })
    }, 150)

    const lyricInterval = setInterval(() => {
      setCurrentLine((prev) => (prev + 1) % previewLines.length)
    }, 2000)

    return () => {
      clearInterval(progressInterval)
      clearInterval(lyricInterval)
    }
  }, [previewLines.length])

  return (
    <main className="min-h-screen bg-background flex flex-col items-center justify-center px-5">
      <div className="w-full max-w-sm space-y-12 text-center">
        {vibe && (
          <div className="inline-flex items-center px-3 py-1 rounded-full bg-secondary border border-border">
            <span className="text-xs font-medium text-muted-foreground">
              {vibeLabels[vibe]} 스타일
            </span>
          </div>
        )}

        <div className="py-8">
          <WaveformAnimation bars={8} className="h-20" />
        </div>

        <div className="space-y-2">
          <p className="text-foreground font-medium">
            {language === "ko" ? "트랙 생성 중..." : "Dropping your study track..."}
          </p>
          <p className="text-sm text-muted-foreground">
            {language === "ko"
              ? "AI가 당신만의 스터디 트랙을 만들고 있어요"
              : "AI is turning your notes into a beat you can remember."}
          </p>
        </div>

        <div className="h-16 flex items-center justify-center">
          <p className="text-primary italic text-lg font-medium transition-opacity duration-500">
            {'"'}
            {previewLines[currentLine]}
            {'"'}
          </p>
        </div>

        <div className="space-y-2">
          <div className="h-1 bg-secondary rounded-full overflow-hidden">
            <div
              className="h-full bg-primary transition-all duration-150 ease-linear rounded-full"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="text-xs text-muted-foreground">{progress}%</p>
        </div>
      </div>
    </main>
  )
}
