"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"

export default function ResultPage() {
  const router = useRouter()

  useEffect(() => {
    router.replace("/")
  }, [router])

  return (
    <main className="min-h-screen bg-background flex items-center justify-center">
      <p className="text-muted-foreground">이동 중...</p>
    </main>
  )
}
