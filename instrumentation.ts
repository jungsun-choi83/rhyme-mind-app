/**
 * Next.js instrumentation - runs once when server starts.
 * Suppresses DEP0169 (url.parse deprecation) from Anthropic SDK / node-fetch.
 */
export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    const orig = process.emitWarning
    process.emitWarning = function (
      message: string | Error,
      typeOrOpts?: string | { type?: string; code?: string },
      code?: string
    ) {
      const c = code ?? (typeof typeOrOpts === "object" ? typeOrOpts?.code : undefined)
      const msg = typeof message === "string" ? message : (message as Error)?.message ?? ""
      if (c === "DEP0169" || (typeof msg === "string" && msg.includes("url.parse"))) {
        return
      }
      return orig.call(process, message, typeOrOpts as string, code)
    }
  }
}
