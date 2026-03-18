import { NextResponse } from "next/server"
import { supabaseServer } from "@/lib/supabaseServer"
import { generateLyrics, generateMusicFromLyrics } from "@/lib/ai"
import { sanitizeAudioUrlForDb } from "@/lib/audioUrl"

type GenerateRequestBody = {
  content: string
  vibe: string
  artists?: string[]
  userId?: string
}

export async function POST(request: Request) {
  console.error("=== GENERATE ROUTE ENTERED ===")
  try {
    const body = (await request.json()) as GenerateRequestBody

    const content = body.content?.trim()
    const vibe = body.vibe?.trim()
    const artists = Array.isArray(body.artists) ? body.artists : []
    const generationType = (body as { generationType?: string }).generationType ?? "full"

    console.error("[generate] generationType:", generationType)
    console.error("[generate] content length:", content?.length ?? 0)
    console.error("[generate] artists:", artists)

    if (!content || !vibe) {
      console.error("=== EARLY RETURN: no content or vibe ===")
      return NextResponse.json(
        { error: "content와 vibe는 필수입니다." },
        { status: 400 },
      )
    }

    let userId = body.userId
    let creditsRemaining: number | null = null

    // 1) 프로필 없으면 익명 프로필 생성 (초기 크레딧 부여)
    if (!userId) {
      const pseudoEmail = `guest-${Date.now()}@rhymemind.local`

      const { data, error } = await supabaseServer
        .from("profiles")
        .insert({
          email: pseudoEmail,
          credits: 10,
        })
        .select("id, credits")
        .single()

      if (error || !data) {
        console.error("Failed to create guest profile", error)
        console.error("=== EARLY RETURN: guest profile creation failed ===")
        return NextResponse.json(
          { error: "프로필 생성 중 오류가 발생했습니다." },
          { status: 500 },
        )
      }

      const createdId = (data as { id?: string }).id
      if (!createdId || typeof createdId !== "string") {
        console.error("Guest profile insert did not return id", data)
        console.error("=== EARLY RETURN: guest profile no id ===")
        return NextResponse.json(
          { error: "프로필 생성 응답을 처리할 수 없습니다. 잠시 후 다시 시도해 주세요." },
          { status: 500 },
        )
      }
      userId = createdId
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
        console.error("Profile not found", profileError)
        console.error("=== EARLY RETURN: profile not found ===")
        return NextResponse.json(
          { error: "프로필을 찾을 수 없습니다." },
          { status: 404 },
        )
      }

      if (profile.credits <= 0) {
        console.error("=== EARLY RETURN: insufficient credits ===")
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
        console.error("Failed to decrement credits", updateError)
        console.error("=== EARLY RETURN: credit decrement failed ===")
        return NextResponse.json(
          { error: "크레딧 차감 중 오류가 발생했습니다." },
          { status: 500 },
        )
      }

      creditsRemaining = updated.credits
    }

    // 3) AI 가사 생성 (Claude)
    console.error("=== BEFORE LYRICS ===")
    const lyrics = await generateLyrics({
      content,
      vibe,
      artists,
    })
    console.error("=== AFTER LYRICS ===")

    // 4) Replicate 음악 생성 (8초, 동기)
    console.error("=== BEFORE MUSIC ===")
    const rawAudioUrl = await generateMusicFromLyrics({
      lyrics,
      vibe,
      artists,
    })
    console.error("=== AFTER MUSIC ===", rawAudioUrl)

    const audioUrl = sanitizeAudioUrlForDb(rawAudioUrl)
    console.error("[SAVE PATH] route=/api/generate")
    console.error("[SAVE CHECK] raw audioUrl:", rawAudioUrl)
    console.error("[SAVE CHECK] sanitized audioUrl:", audioUrl)

    // 5) Supabase songs 테이블에 저장 - raw 절대 사용 금지, 강제 차단
    if (!userId || typeof userId !== "string") {
      console.error("userId is missing before song insert", { userId })
      return NextResponse.json(
        { error: "사용자 식별에 실패했습니다. 다시 시도해 주세요." },
        { status: 500 },
      )
    }

    const title = content.split("\n")[0].slice(0, 40) || "나만의 스터디 트랙"

    const insertPayload = {
      user_id: userId,
      title,
      lyrics,
      audio_url: audioUrl && !/samplelib|sample-3s/i.test(audioUrl) ? audioUrl : null,
      vibe,
      is_public: false,
      votes: 0,
    }
    console.error("[SAVE] songs insert payload audio_url:", insertPayload.audio_url)

    const { data: song, error: songError } = await supabaseServer
      .from("songs")
      .insert(insertPayload)
      .select("id, audio_url")
      .single()

    if (songError || !song) {
      console.error("Failed to insert song", songError)
      return NextResponse.json(
        { error: "생성된 트랙 저장 중 오류가 발생했습니다." },
        { status: 500 },
      )
    }

    const insertedSongId = (song as { id?: string }).id
    console.error("[SONG ID]", insertedSongId)

    const { data: insertedRow } = await supabaseServer
      .from("songs")
      .select("id, audio_url")
      .eq("id", insertedSongId)
      .single()
    console.error("[POST-INSERT ROW]", insertedRow)

    const storedAudioUrl = (song as { audio_url?: string | null }).audio_url ?? audioUrl ?? null
    console.error("=== SUCCESS ===", song.id)
    return NextResponse.json(
      {
        id: song.id,
        lyrics,
        audioUrl: storedAudioUrl,
        profile: userId
          ? {
              id: userId,
              credits: creditsRemaining,
            }
          : null,
      },
      { status: 200 },
    )
  } catch (error) {
    const err = error as Error
    console.error("Unhandled /api/generate error", err)
    console.error("=== EARLY RETURN: catch block ===")
    return NextResponse.json(
      {
        error: "트랙 생성 중 예상치 못한 오류가 발생했습니다.",
        detail: err?.message ?? String(error),
      },
      { status: 500 },
    )
  }
}

