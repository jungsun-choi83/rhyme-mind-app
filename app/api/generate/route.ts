import { NextResponse } from "next/server"
import { supabaseServer } from "@/lib/supabaseServer"
import { generateLyrics } from "@/lib/ai"

type GenerateRequestBody = {
  content: string
  vibe: string
  artists?: string[]
  userId?: string
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as GenerateRequestBody
    const content = body.content?.trim()
    const vibe = body.vibe?.trim()
    const artists = Array.isArray(body.artists) ? body.artists : []

    console.error("[STEP] request parsed")

    if (!content || !vibe) {
      return NextResponse.json(
        { error: "content와 vibe는 필수입니다." },
        { status: 400 },
      )
    }

    let userId = body.userId
    let creditsRemaining: number | null = null

    // 1) 프로필 없으면 익명 프로필 생성
    if (!userId) {
      const pseudoEmail = `guest-${Date.now()}@rhymemind.local`
      const { data, error } = await supabaseServer
        .from("profiles")
        .insert({ email: pseudoEmail, credits: 10 })
        .select("id, credits")
        .single()

      if (error || !data) {
        console.error("Failed to create guest profile", error)
        return NextResponse.json(
          { error: "프로필 생성 중 오류가 발생했습니다." },
          { status: 500 },
        )
      }
      userId = (data as { id?: string }).id
      creditsRemaining = (data as { credits?: number }).credits ?? null
    }

    // 2) 크레딧 확인 및 1 차감
    if (userId) {
      const { data: profile, error: profileError } = await supabaseServer
        .from("profiles")
        .select("id, credits")
        .eq("id", userId)
        .single()

      if (profileError || !profile) {
        return NextResponse.json(
          { error: "프로필을 찾을 수 없습니다." },
          { status: 404 },
        )
      }

      if (profile.credits <= 0) {
        return NextResponse.json(
          { error: "크레딧이 부족합니다." },
          { status: 402 },
        )
      }

      const { data: updated, error: updateError } = await supabaseServer
        .from("profiles")
        .update({ credits: profile.credits - 1 })
        .eq("id", userId)
        .select("credits")
        .single()

      if (updateError || !updated) {
        return NextResponse.json(
          { error: "크레딧 차감 중 오류가 발생했습니다." },
          { status: 500 },
        )
      }
      creditsRemaining = updated.credits
    }

    // 3) AI 가사 생성만 (음악 생성 비활성화)
    const lyrics = await generateLyrics({ content, vibe, artists })
    console.error("[STEP] lyrics generated")

    // 4) songs insert (audio_url = null)
    if (!userId || typeof userId !== "string") {
      return NextResponse.json(
        { error: "사용자 식별에 실패했습니다. 다시 시도해 주세요." },
        { status: 500 },
      )
    }

    const title = content.split("\n")[0].slice(0, 40) || "나만의 스터디 트랙"

    const { data: song, error: songError } = await supabaseServer
      .from("songs")
      .insert({
        user_id: userId,
        title,
        lyrics,
        audio_url: null,
        vibe,
        is_public: false,
        votes: 0,
      })
      .select("id, audio_url")
      .single()

    if (songError || !song) {
      console.error("Failed to insert song", songError)
      return NextResponse.json(
        { error: "생성된 트랙 저장 중 오류가 발생했습니다." },
        { status: 500 },
      )
    }

    console.error("[STEP] song inserted")
    console.error("[STEP] returning response")

    return NextResponse.json(
      {
        id: song.id,
        lyrics,
        audioUrl: null,
        profile: userId
          ? { id: userId, credits: creditsRemaining }
          : null,
      },
      { status: 200 },
    )
  } catch (error) {
    const err = error as Error
    console.error("Unhandled /api/generate error", err)
    return NextResponse.json(
      {
        error: "트랙 생성 중 예상치 못한 오류가 발생했습니다.",
        detail: err?.message ?? String(error),
      },
      { status: 500 },
    )
  }
}
