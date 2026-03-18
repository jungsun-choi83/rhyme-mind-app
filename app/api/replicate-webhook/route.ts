import { NextResponse } from "next/server"
import { supabaseServer } from "@/lib/supabaseServer"
import { extractAudioUrl } from "@/lib/ai"
import { sanitizeAudioUrlForDb } from "@/lib/audioUrl"

/** Replicate URL 검증용 (일부 서비스가 GET으로 확인) */
export async function GET() {
  return NextResponse.json({ ok: true }, { status: 200 })
}

/** Replicate가 음악 생성 완료 시 호출하는 웹훅 - 임시 비활성화 */
export async function POST(request: Request) {
  console.error("[WEBHOOK DISABLED TEMPORARILY]")
  return NextResponse.json({ received: true }, { status: 200 })

  /* eslint-disable-next-line no-unreachable */
  try {
    const url = new URL(request.url)
    const songId = url.searchParams.get("songId")
    if (!songId) {
      console.error("[webhook] missing songId in URL:", request.url)
      return NextResponse.json({ error: "songId required" }, { status: 400 })
    }

    const body = (await request.json()) as {
      id?: string
      status?: string
      output?: unknown
      error?: string
    }

    console.error("[webhook] received:", { songId, predictionId: body.id, status: body.status })

    if (body.status !== "succeeded") {
      console.error("[webhook] prediction not succeeded:", body.status, body.error)
      return NextResponse.json({ received: true }, { status: 200 })
    }

    console.error("[webhook] body.output:", JSON.stringify(body.output, null, 2))

    const rawAudioUrl = extractAudioUrl(body.output)
    console.error("[webhook] extracted rawAudioUrl:", rawAudioUrl)

    if (!rawAudioUrl || !rawAudioUrl.startsWith("http")) {
      console.error("[webhook] failed to extract audio URL. body.output:", JSON.stringify(body.output, null, 2))
      return NextResponse.json({ received: true }, { status: 200 })
    }

    const audioUrl = sanitizeAudioUrlForDb(rawAudioUrl) ?? null
    console.error("[SAVE PATH] route=/api/replicate-webhook")
    console.error("[SAVE CHECK] raw audioUrl:", rawAudioUrl)
    console.error("[SAVE CHECK] sanitized audioUrl:", audioUrl)

    if (!audioUrl) {
      const { data: currentRow } = await supabaseServer
        .from("songs")
        .select("id, audio_url")
        .eq("id", songId)
        .single()
      console.error("[BLOCK SAVE] sample URL blocked, skipping update. raw:", rawAudioUrl, "current row:", currentRow)
      return NextResponse.json({ received: true }, { status: 200 })
    }

    const updatePayload = { audio_url: audioUrl }
    console.error("[SAVE] songs update payload audio_url:", updatePayload.audio_url)

    const { error } = await supabaseServer
      .from("songs")
      .update(updatePayload)
      .eq("id", songId)

    if (error) {
      console.error("[webhook] DB update failed:", error)
      return NextResponse.json({ error: "DB update failed" }, { status: 500 })
    }

    const { data: postWebhookRow } = await supabaseServer
      .from("songs")
      .select("id, audio_url")
      .eq("id", songId)
      .single()
    console.error("[POST-WEBHOOK ROW]", JSON.stringify(postWebhookRow, null, 2))

    console.error("[webhook] SUCCESS song updated:", songId)
    return NextResponse.json({ received: true }, { status: 200 })
  } catch (err) {
    console.error("[webhook] error:", err)
    return NextResponse.json({ error: "Webhook error" }, { status: 500 })
  }
}
