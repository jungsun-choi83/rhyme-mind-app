"use client"

import { cn } from "@/lib/utils"

interface ContentInputProps {
  value: string
  onChange: (value: string) => void
  language: "ko" | "en"
  onLanguageChange: (lang: "ko" | "en") => void
  onFilesChange?: (files: FileList | null) => void
}

export function ContentInput({ value, onChange, language, onLanguageChange, onFilesChange }: ContentInputProps) {
  const charCount = value.length
  const maxChars = 500
  
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-2">
          <label htmlFor="study-content" className="text-sm font-medium text-muted-foreground">
            암기할 내용
          </label>
          <div className="inline-flex items-center gap-1 rounded-full bg-secondary px-1 py-0.5">
            <button
              type="button"
              onClick={() => onLanguageChange("ko")}
              className={cn(
                "px-2 py-0.5 rounded-full text-[10px] font-semibold",
                language === "ko"
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground"
              )}
            >
              KR
            </button>
            <button
              type="button"
              onClick={() => onLanguageChange("en")}
              className={cn(
                "px-2 py-0.5 rounded-full text-[10px] font-semibold",
                language === "en"
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground"
              )}
            >
              EN
            </button>
          </div>
        </div>
        <span
          className={cn(
            "text-xs",
            charCount > maxChars * 0.9 ? "text-destructive" : "text-muted-foreground",
          )}
        >
          {charCount}/{maxChars}
        </span>
      </div>
      <textarea
        id="study-content"
        value={value}
        onChange={(e) => onChange(e.target.value.slice(0, maxChars))}
        placeholder={
          language === "ko"
            ? "역사적 사건, 공식, 어휘 목록 등 외우고 싶은 내용을 입력하세요..."
            : "Type the concepts, formulas, or vocab you want to remember..."
        }
        className={cn(
          "w-full h-32 p-4 rounded-xl resize-none",
          "bg-card border border-border",
          "text-foreground placeholder:text-muted-foreground",
          "focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary",
          "transition-all duration-200"
        )}
      />

      <div className="flex flex-col gap-1 px-1 pt-1">
        <label className="text-[11px] text-muted-foreground">
          또는 노트 이미지를 업로드하세요 (PNG, JPG, PDF, Word·한글 문서 – 인식 기능은 기본 버전에서 간단히 미리보기까지만 지원합니다)
        </label>
        <input
          type="file"
          accept=".png,.jpg,.jpeg,.pdf,.doc,.docx,.hwp,.hwpx"
          multiple
          onChange={(e) => onFilesChange?.(e.target.files)}
          className="text-[11px] text-muted-foreground file:text-xs file:px-2 file:py-1 file:border file:border-border file:rounded-md file:bg-card file:text-foreground"
        />
      </div>
    </div>
  )
}
