/**
 * Replicate MusicGen 직접 테스트
 * 실행: node scripts/test-replicate.js
 * (프로젝트 루트에서 실행, .env.local의 REPLICATE_API_TOKEN 사용)
 */
const fs = require("fs")
const path = require("path")
try {
  const envPath = path.join(__dirname, "..", ".env.local")
  const content = fs.readFileSync(envPath, "utf8")
  content.split("\n").forEach((line) => {
    const m = line.match(/^([^#=]+)=(.*)$/)
    if (m) process.env[m[1].trim()] = m[2].trim().replace(/^["']|["']$/g, "")
  })
} catch (e) {
  console.warn(".env.local 로드 실패:", e.message)
}
const Replicate = require("replicate")

async function main() {
  const token = process.env.REPLICATE_API_TOKEN
  if (!token) {
    console.error("REPLICATE_API_TOKEN이 .env.local에 없습니다.")
    process.exit(1)
  }

  const replicate = new Replicate({ auth: token })
  const input = {
    model_version: "large",
    prompt: "chill hip-hop instrumental, 808 bass",
    duration: 8,
    output_format: "wav",
  }

  console.log("Replicate MusicGen 호출 중... (약 20-40초 소요)")
  console.log("input:", JSON.stringify(input, null, 2))

  const start = Date.now()
  const output = await replicate.run("meta/musicgen", { input })
  const elapsed = ((Date.now() - start) / 1000).toFixed(1)

  console.log("\n=== 결과 ===")
  console.log("소요시간:", elapsed, "초")
  console.log("output 타입:", typeof output)
  console.log("output:", JSON.stringify(output, null, 2))

  if (typeof output === "string" && output.startsWith("http")) {
    console.log("\n오디오 URL:", output)
    console.log("\n이 URL을 브라우저에서 열어 재생해보세요.")
    console.log("재생 시간이 8초인지 확인하세요.")
  } else if (Array.isArray(output) && output[0]) {
    const url = typeof output[0] === "string" ? output[0] : output[0]?.url
    console.log("\n오디오 URL:", url)
  }
}

main().catch((err) => {
  console.error("에러:", err)
  process.exit(1)
})
