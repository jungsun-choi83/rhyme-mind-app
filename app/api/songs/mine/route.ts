import { NextResponse } from "next/server"
import { supabaseServer } from "@/lib/supabaseServer"

export async function GET(request: Request) {
  const url = new URL(request.url)
  const userId = url.searchParams.get("userId")

  if (!userId) {
    return NextResponse.json({ songs: [] }, { status: 200 })
  }

  try {
    const { data, error } = await supabaseServer
      .from("songs")
      .select("id, title, vibe, inserted_at")
      .eq("user_id", userId)
      .order("inserted_at", { ascending: false })

    if (error) {
      console.error("Failed to fetch user songs", error)
      return NextResponse.json(
        { error: "내 트랙을 불러오는 중 오류가 발생했습니다." },
        { status: 500 },
      )
    }

    return NextResponse.json({ songs: data ?? [] }, { status: 200 })
  } catch (error) {
    console.error("Unhandled /api/songs/mine error", error)
    return NextResponse.json(
      { error: "내 트랙을 불러오는 중 예상치 못한 오류가 발생했습니다." },
      { status: 500 },
    )
  }
}

