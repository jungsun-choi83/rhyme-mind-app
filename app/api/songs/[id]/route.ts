import { NextResponse } from "next/server"
import { supabaseServer } from "@/lib/supabaseServer"
import { sanitizeAudioUrlForDb } from "@/lib/audioUrl"

type Params = {
  params: Promise<{ id: string }>
}

export async function GET(_request: Request, { params }: Params) {
  const { id } = await params

  if (!id) {
    return NextResponse.json({ error: "id가 필요합니다." }, { status: 400 })
  }

  try {
    const { data, error } = await supabaseServer
      .from("songs")
      .select("id, title, lyrics, audio_url, vibe")
      .eq("id", id)
      .single()

    if (error || !data) {
      return NextResponse.json(
        { error: "트랙을 찾을 수 없습니다." },
        { status: 404 },
      )
    }

    const rawAudioUrl = data.audio_url ?? null
    const audioUrl = sanitizeAudioUrlForDb(rawAudioUrl) ?? null

    return NextResponse.json({
      id: data.id,
      title: data.title ?? "나만의 스터디 트랙",
      lyrics: data.lyrics ?? "",
      audioUrl,
      vibe: data.vibe ?? null,
    })
  } catch (err) {
    console.error("GET /api/songs/[id] error", err)
    return NextResponse.json(
      { error: "트랙을 불러오는 중 오류가 발생했습니다." },
      { status: 500 },
    )
  }
}
