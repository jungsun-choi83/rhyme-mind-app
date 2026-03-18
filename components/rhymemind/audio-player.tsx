"use client"

import { useState, useRef, useEffect } from "react"
import { Play, Pause, SkipBack, SkipForward, Volume2 } from "lucide-react"
import { cn } from "@/lib/utils"

interface AudioPlayerProps {
  className?: string
  audioUrl?: string | null
}

export function AudioPlayer({ className, audioUrl }: AudioPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false)
  const [progress, setProgress] = useState(0)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)

  const audioRef = useRef<HTMLAudioElement | null>(null)

  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return

    const handleLoaded = () => {
      setDuration(audio.duration || 0)
    }

    const handleTimeUpdate = () => {
      setCurrentTime(audio.currentTime)
      if (audio.duration) {
        setProgress((audio.currentTime / audio.duration) * 100)
      }
    }

    const handleEnded = () => {
      setIsPlaying(false)
      setProgress(100)
    }

    audio.addEventListener("loadedmetadata", handleLoaded)
    audio.addEventListener("timeupdate", handleTimeUpdate)
    audio.addEventListener("ended", handleEnded)

    return () => {
      audio.removeEventListener("loadedmetadata", handleLoaded)
      audio.removeEventListener("timeupdate", handleTimeUpdate)
      audio.removeEventListener("ended", handleEnded)
    }
  }, [])

  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return

    if (isPlaying) {
      void audio.play().catch(() => {
        setIsPlaying(false)
      })
    } else {
      audio.pause()
    }
  }, [isPlaying])

  useEffect(() => {
    // reset when url changes
    setIsPlaying(false)
    setProgress(0)
    setCurrentTime(0)
  }, [audioUrl])

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  // Generate waveform bars
  const bars = Array.from({ length: 50 }).map((_, i) => {
    const height = Math.sin(i * 0.3) * 30 + Math.random() * 20 + 10
    return height
  })

  return (
    <div className={cn("space-y-6", className)}>
      {/* Waveform Visualization */}
      <div className="relative h-20 flex items-center justify-center gap-0.5">
        {bars.map((height, i) => {
          const isActive = (i / bars.length) * 100 <= progress
          return (
            <div
              key={i}
              className={cn(
                "w-1 rounded-full transition-colors duration-150",
                isActive ? "bg-primary" : "bg-secondary"
              )}
              style={{ height: `${height}%` }}
            />
          )
        })}
        
        {/* Progress indicator */}
        <div 
          className="absolute top-0 bottom-0 w-0.5 bg-foreground"
          style={{ left: `${progress}%` }}
        />
      </div>

      {/* Time */}
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span>{formatTime(currentTime)}</span>
        <span>{duration ? formatTime(duration) : "0:00"}</span>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-center gap-6">
        <button className="p-2 text-muted-foreground hover:text-foreground transition-colors" disabled>
          <SkipBack className="w-5 h-5" />
        </button>
        
        <button
          onClick={() => {
            if (!audioUrl) return
            setIsPlaying((prev) => !prev)
          }}
          className="w-14 h-14 rounded-full bg-primary text-primary-foreground flex items-center justify-center hover:bg-primary/90 transition-colors"
        >
          {isPlaying ? (
            <Pause className="w-6 h-6" />
          ) : (
            <Play className="w-6 h-6 ml-0.5" />
          )}
        </button>
        
        <button className="p-2 text-muted-foreground hover:text-foreground transition-colors" disabled>
          <SkipForward className="w-5 h-5" />
        </button>
      </div>

      {/* Volume (decorative) */}
      <div className="flex items-center justify-center gap-2">
        <Volume2 className="w-4 h-4 text-muted-foreground" />
        <div className="w-24 h-1 bg-secondary rounded-full">
          <div className="w-3/4 h-full bg-muted-foreground rounded-full" />
        </div>
      </div>

      <audio ref={audioRef} src={audioUrl ?? undefined} />
    </div>
  )
}
