import { NextResponse } from "next/server"
import { supabaseServer } from "@/lib/supabaseServer"

export async function GET() {
  try {
    const { data, error } = await supabaseServer
      .from("songs")
      .select("id, title, vibe, votes")
      .eq("is_public", true)
      .order("votes", { ascending: false })
      .limit(50)

    if (error) {
      console.error("Failed to fetch public songs", error)
      return NextResponse.json(
        { error: "공개 트랙을 불러오는 중 오류가 발생했습니다." },
        { status: 500 },
      )
    }

    return NextResponse.json({ songs: data ?? [] }, { status: 200 })
  } catch (error) {
    console.error("Unhandled /api/songs/public error", error)
    return NextResponse.json(
      { error: "공개 트랙을 불러오는 중 예상치 못한 오류가 발생했습니다." },
      { status: 500 },
    )
  }
}

