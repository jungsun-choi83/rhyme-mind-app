"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Header } from "@/components/rhymemind/header"
import { VibeSelector } from "@/components/rhymemind/vibe-selector"
import { ArtistChips } from "@/components/rhymemind/artist-chips"
import { ContentInput } from "@/components/rhymemind/content-input"
import { BottomNav } from "@/components/rhymemind/bottom-nav"
import { Sparkles } from "lucide-react"

export default function HomePage() {
  const router = useRouter()
  const [content, setContent] = useState("")
  const [selectedVibe, setSelectedVibe] = useState<string | null>(null)
  const [selectedArtists, setSelectedArtists] = useState<string[]>([])
  const [language, setLanguage] = useState<"ko" | "en">("ko")
  const [noteFiles, setNoteFiles] = useState<FileList | null>(null)

  const handleArtistToggle = (id: string) => {
    setSelectedArtists(prev =>
      prev.includes(id) ? prev.filter((a) => a !== id) : [...prev, id],
    )
  }

  const handleGenerate = () => {
    if (!content.trim() || !selectedVibe) return
    
    // Store data in sessionStorage for the generation page
    sessionStorage.setItem("rhymemind-content", content)
    sessionStorage.setItem("rhymemind-vibe", selectedVibe)
    sessionStorage.setItem("rhymemind-artists", JSON.stringify(selectedArtists))
    sessionStorage.setItem("rhymemind-language", language)
    
    router.push("/generate")
  }

  const isValid = content.trim().length > 0 && selectedVibe !== null

  return (
    <main className="min-h-screen bg-background flex flex-col pb-20">
      <Header />
      
      <div className="flex-1 px-5 py-6 space-y-8 max-w-lg mx-auto w-full">
        {/* Hero Section */}
        <div className="space-y-3 text-center pt-4">
          <h1 className="text-3xl font-black text-foreground leading-tight text-balance tracking-tight">
            MIND ON THE BEAT.
          </h1>
          <p className="text-muted-foreground text-sm">
            공부할 내용을 비트 위에 올려서 암기 트랙으로 만들어 보세요.
          </p>
        </div>

        {/* Content Input */}
        <ContentInput
          value={content}
          onChange={setContent}
          language={language}
          onLanguageChange={setLanguage}
          onFilesChange={setNoteFiles}
        />

        {/* Vibe Selector */}
        <div className="space-y-3">
          <p className="text-sm text-muted-foreground px-1">바이브 선택</p>
          <VibeSelector selected={selectedVibe} onSelect={setSelectedVibe} />
        </div>

        {/* Artist Reference Chips */}
        <ArtistChips selected={selectedArtists} onToggle={handleArtistToggle} />
      </div>

      {/* Fixed Bottom CTA */}
      <div className="sticky bottom-0 p-5 bg-gradient-to-t from-background via-background to-transparent pt-10">
        <button
          onClick={handleGenerate}
          disabled={!isValid}
          className="w-full py-4 rounded-xl font-bold text-base transition-all duration-200 flex items-center justify-center gap-2 bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <Sparkles className="w-5 h-5" />
          트랙 생성하기
        </button>
        <p className="text-center text-xs text-muted-foreground mt-3">
          1 크레딧 사용
        </p>
      </div>

      <BottomNav />
    </main>
  )
}
