import { NextResponse } from "next/server"
import { supabaseServer } from "@/lib/supabaseServer"

type Params = {
  params: {
    id: string
  }
}

export async function POST(_request: Request, { params }: Params) {
  const id = params.id

  if (!id) {
    return NextResponse.json({ error: "id가 필요합니다." }, { status: 400 })
  }

  try {
    const { data, error } = await supabaseServer
      .from("songs")
      .update({ is_public: true })
      .eq("id", id)
      .select("id")
      .single()

    if (error || !data) {
      console.error("Failed to publish song", error)
      return NextResponse.json(
        { error: "트랙을 공개하는 중 오류가 발생했습니다." },
        { status: 500 },
      )
    }

    return NextResponse.json({ id: data.id }, { status: 200 })
  } catch (error) {
    console.error("Unhandled /api/songs/[id]/publish error", error)
    return NextResponse.json(
      { error: "트랙을 공개하는 중 예상치 못한 오류가 발생했습니다." },
      { status: 500 },
    )
  }
}

