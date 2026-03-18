/**
 * samplelib 및 샘플 오디오 URL 차단
 * DB 저장 직전에 반드시 호출 - sample URL이면 절대 저장 금지
 */

const SAMPLE_REGEX =
  /samplelib|download\.samplelib|sample-3s|sample-3\.mp3|preview\/mp3\/sample|\/sample-3s\.mp3/i

export function sanitizeAudioUrlForDb(audioUrl: string | null | undefined): string | null {
  if (!audioUrl || typeof audioUrl !== "string" || !audioUrl.trim()) {
    return null
  }
  const trimmed = String(audioUrl).trim()
  if (SAMPLE_REGEX.test(trimmed)) {
    console.error("[BLOCKED SAMPLE URL]", trimmed)
    return null
  }
  if (!trimmed.startsWith("http")) {
    return null
  }
  return trimmed
}
