import Anthropic from "@anthropic-ai/sdk"
import Replicate from "replicate"

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
})

const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN,
})

export async function generateLyrics({
  content,
  vibe,
  artists,
}: {
  content: string
  vibe: string
  artists: string[]
}) {
  console.error("[ai] generateLyrics ENTERED")
  const fallbackLyrics = () => {
    const firstLine = content.split("\n").map((l) => l.trim()).filter(Boolean)[0] ?? "공부할 내용을 비트 위에 실어"
    const vibeText = vibe || "Hype"
    const artistText = artists.length ? artists.join(", ") : "내가 좋아하는 래퍼들"

    return [
      "[Intro]",
      `${vibeText} 바이브로 오늘도 mic check,`,
      `필기한 노트 위에 합격을 right back,`,
      "",
      "[Verse 1]",
      `${firstLine} 이걸 비트 위에 실어`,
      "단어 줄줄 외우지 말고 리듬 타며 밀어",
      "앞글자 hook 으로 암기 포인트를 심어",
      "틀릴까 불안했던 test 는 이제 뒤로 밀어",
      "",
      "[Hook]",
      "외워 외워 라임 타고 외워",
      "종이에만 있던 개념 머릿속에 새겨",
      "시험장에 들어가도 흐름 그대로",
      "RhymeMind 켜 두면 걱정은 fade out",
      "",
      "[Verse 2]",
      `flow 는 ${artistText} 느낌 살짝 더해`,
      "틀리면 다시 loop, 실수까지도 노래",
      "밤새워 벼락치기 말고 조금씩만 쌓여",
      "하나씩 완성되는 verse 가 점수를 가져",
      "",
      "[Outro]",
      "지금 외운 라인은 내일도 남아",
      "비트 위에 쓴 꿈은 점수로 담아",
      "플레이를 누를 때마다 집중은 올라",
      "RhymeMind 와 함께면 공부도 놀다 가",
    ].join("\n")
  }

  if (!process.env.ANTHROPIC_API_KEY) {
    // 무료 테스트용: 키가 없으면 바로 더미 가사 반환
    return fallbackLyrics()
  }

  try {
    const systemPrompt =
      "You are RhymeMind, a Korean study-rap ghostwriter. You turn study notes into catchy Korean hip-hop lyrics with strong rhyme schemes and swag, but you must keep the core facts accurate."

    const userPrompt = `
학습 내용:
${content}

바이브: ${vibe}
참고 아티스트: ${artists.length ? artists.join(", ") : "지정 없음"}

요구사항:
- 한국어 힙합 가사로 작성
- 스웨그와 라임을 살리되, 시험에 필요한 핵심 개념은 꼭 포함
- [Intro], [Verse 1], [Hook], [Verse 2], [Outro] 섹션으로 나누어 출력
`.trim()

    const response = await anthropic.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 800,
      temperature: 0.9,
      system: systemPrompt,
      messages: [
        {
          role: "user",
          content: userPrompt,
        },
      ],
    })

    const text =
      response.content
        .filter((c) => c.type === "text")
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        .map((c: any) => c.text)
        .join("\n") ?? ""

    const trimmed = text.trim()
    return trimmed.length > 0 ? trimmed : fallbackLyrics()
  } catch (error) {
    console.error("[ai] generateLyrics CATCH - returning fallback")
    const err = error as { message?: string; status?: number }
    const msg = typeof err?.message === "string" ? err.message : String(error)
    const isCreditError = msg.includes("credit balance is too low") || msg.includes("credit")
    if (isCreditError) {
      console.warn("[lyrics] Anthropic credits exhausted, using fallback. Add credits at console.anthropic.com")
    } else {
      console.error("Anthropic generateLyrics failed, falling back to local lyrics", error)
    }
    return fallbackLyrics()
  }
}

// meta/musicgen - 동기 생성 (8초, 60초 제한 내 완료)
const MUSICGEN_MODEL = "meta/musicgen"

function tryGetUrlFromValue(v: unknown): string | null {
  if (!v) return null
  if (typeof v === "string" && v.startsWith("http")) return v
  if (typeof v === "function") {
    const u = (v as () => string | URL)()
    return typeof u === "string" ? u : (u as URL)?.href ?? null
  }
  if (v && typeof v === "object" && "href" in v) {
    const href = (v as { href?: string }).href
    if (typeof href === "string" && href.startsWith("http")) return href
  }
  return null
}

export function extractAudioUrl(output: unknown): string | null {
  if (!output) return null

  // string
  if (typeof output === "string" && output.startsWith("http")) return output

  // array (string[] or object[])
  if (Array.isArray(output) && output.length > 0) {
    for (const item of output) {
      const u = extractAudioUrl(item)
      if (u) return u
    }
    return null
  }

  // object (url, audio, file)
  if (output && typeof output === "object") {
    const obj = output as Record<string, unknown>
    for (const key of ["url", "audio", "file"]) {
      const v = obj[key]
      const u = tryGetUrlFromValue(v)
      if (u) return u
    }
  }

  return null
}

/** 동기로 음악 생성 (8초, 빠르게 완료) */
export async function generateMusicFromLyrics({
  lyrics,
  vibe,
  artists,
}: {
  lyrics: string
  vibe: string
  artists: string[]
}) {
  if (!process.env.REPLICATE_API_TOKEN) {
    throw new Error("REPLICATE_API_TOKEN is not set")
  }

  const artistStyle = artists.length > 0 ? ` in the style of ${artists.join(", ")}` : ""
  const vibeMap: Record<string, string> = {
    hype: "energetic, hype, high energy",
    chill: "chill, relaxed, lo-fi",
    smooth: "smooth, mellow, R&B",
    hard: "hard, aggressive, trap",
  }
  const vibeDesc = vibeMap[vibe.toLowerCase()] ?? vibe
  const prompt = `${vibeDesc} hip-hop instrumental with rap vocals${artistStyle}, 808 bass`.trim()

  const input = {
    model_version: "large",
    prompt,
    duration: 8,
    output_format: "wav",
  }

  console.error("[music] replicate.run", MUSICGEN_MODEL, "duration: 8")

  const output = await replicate.run(MUSICGEN_MODEL, { input })
  const prediction = { output }
  console.error("=== REPLICATE FULL ===", JSON.stringify(prediction, null, 2))
  console.error("[music] prediction.output:", JSON.stringify(output, null, 2))

  const rawAudioUrl = extractAudioUrl(output)
  console.error("[music] extracted rawAudioUrl:", rawAudioUrl)

  if (!rawAudioUrl || !rawAudioUrl.startsWith("http")) {
    console.error("[music] failed to extract audio URL. output:", JSON.stringify(output, null, 2))
    return null
  }

  const sampleBlocklist = ["sample-3", "sample-3s", "samplelib", "download.samplelib", "preview/mp3/sample"]
  if (sampleBlocklist.some((s) => rawAudioUrl.toLowerCase().includes(s))) {
    console.error("[music] Replicate returned sample/fallback URL, returning null:", rawAudioUrl)
    return null
  }

  return rawAudioUrl
}

