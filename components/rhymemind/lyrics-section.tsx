"use client"

import { useState, useEffect } from "react"
import { ChevronDown, ChevronUp } from "lucide-react"
import { cn } from "@/lib/utils"

const fallbackLyrics = `[Verse 1]
삼국시대 고구려 백제 신라
역사 속으로 라임 타고 날아
고구려는 북쪽 강한 기상
백제는 문화 꽃피운 왕상

[Hook]
기억해 기억해 이 비트 위에서
외우기 힘든 것도 쉽게 느껴져
삼국의 역사가 머릿속에 새겨져
RhymeMind 타고 지식이 춤춰져

[Verse 2]
신라는 삼국 통일의 주인공
김유신 장군 전설의 영웅
골품제도 신분 나누던 제도
화랑도는 청년 엘리트 도

[Outro]
이제 시험 걱정 없어 no more
비트 위에 올라탄 역사 encore`

type LyricsSectionProps = {
  lyrics?: string
  defaultExpanded?: boolean
}

export function LyricsSection({ lyrics, defaultExpanded }: LyricsSectionProps) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded ?? false)
  useEffect(() => {
    if (lyrics?.trim()) setIsExpanded(true)
  }, [lyrics])
  const text = lyrics && lyrics.trim().length > 0 ? lyrics : fallbackLyrics

  return (
    <div className="bg-card border border-border rounded-xl overflow-hidden">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between p-4 hover:bg-secondary/50 transition-colors"
      >
        <span className="font-medium text-foreground">가사 보기</span>
        {isExpanded ? (
          <ChevronUp className="w-5 h-5 text-muted-foreground" />
        ) : (
          <ChevronDown className="w-5 h-5 text-muted-foreground" />
        )}
      </button>

      <div
        className={cn(
          "overflow-hidden transition-all duration-300",
          isExpanded ? "max-h-[500px]" : "max-h-0",
        )}
      >
        <div className="px-4 pb-4 overflow-y-auto max-h-[400px]">
          <pre className="text-sm text-muted-foreground whitespace-pre-wrap font-sans leading-relaxed">
            {text}
          </pre>
        </div>
      </div>
    </div>
  )
}
