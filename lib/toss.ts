export function loadTossPaymentsScript(): Promise<void> {
  if (typeof window === "undefined") return Promise.resolve()

  const existing = document.querySelector<HTMLScriptElement>(
    'script[src="https://js.tosspayments.com/v1/payment"]',
  )
  if (existing) {
    return Promise.resolve()
  }

  return new Promise((resolve, reject) => {
    const script = document.createElement("script")
    script.src = "https://js.tosspayments.com/v1/payment"
    script.async = true
    script.onload = () => resolve()
    script.onerror = () => reject(new Error("Failed to load TossPayments script"))
    document.head.appendChild(script)
  })
}

