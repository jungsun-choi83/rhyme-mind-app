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
    console.error("Anthropic generateLyrics failed, falling back to local lyrics", error)
    return fallbackLyrics()
  }
}

export async function generateMusicFromLyrics({
  lyrics,
  vibe,
}: {
  lyrics: string
  vibe: string
}) {
  const fallbackUrl =
    "https://samplelib.com/lib/preview/mp3/sample-3s.mp3"

  if (!process.env.REPLICATE_API_TOKEN || !process.env.REPLICATE_MODEL_ID) {
    return fallbackUrl
  }

  const model = process.env.REPLICATE_MODEL_ID

  const prompt = `
Generate a short ${vibe} hip-hop instrumental with Korean rap vocals that fit these lyrics.
Lyrics:
${lyrics}
`.trim()

  try {
    const output = (await replicate.run(model, {
      input: {
        prompt,
      },
    })) as unknown

    // Many music models on Replicate return an array of URLs.
    let audioUrl: string | null = null
    if (Array.isArray(output) && output.length > 0 && typeof output[0] === "string") {
      audioUrl = output[0]
    } else if (typeof output === "string") {
      audioUrl = output
    }

    if (!audioUrl) {
      console.error("No audio URL found in Replicate response, using fallback")
      return fallbackUrl
    }

    return audioUrl
  } catch (error) {
    console.error("Replicate generateMusicFromLyrics failed, using fallback audio", error)
    return fallbackUrl
  }
}

