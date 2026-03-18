"use client"

import { useEffect, useState } from "react"
import { Zap, Check, CreditCard, Sparkles } from "lucide-react"
import { BottomNav } from "@/components/rhymemind/bottom-nav"
import { cn } from "@/lib/utils"
import { loadTossPaymentsScript } from "@/lib/toss"

const creditPacks = [
  {
    id: "starter",
    name: "STARTER",
    credits: 10,
    price: 4.99,
    tag: null,
    style: "border-border hover:border-muted-foreground",
  },
  {
    id: "pro",
    name: "PRO",
    credits: 50,
    price: 18.99,
    tag: "BEST VALUE",
    style: "border-primary/50 shadow-[0_0_20px_rgba(245,208,0,0.15)] hover:shadow-[0_0_30px_rgba(245,208,0,0.25)]",
  },
  {
    id: "legend",
    name: "LEGEND",
    credits: 150,
    price: 44.99,
    tag: "PRO",
    style: "border-transparent bg-gradient-to-br from-[#1a1a1a] to-[#111] ring-1 ring-inset ring-gradient-to-r from-amber-500 via-primary to-amber-600",
  },
]

const paymentMethods = [
  { id: "apple", name: "Apple Pay", icon: "apple" },
  { id: "google", name: "Google Pay", icon: "google" },
  { id: "card", name: "Card", icon: "card" },
]

export default function StorePage() {
  const [selectedPack, setSelectedPack] = useState<string | null>("pro")
  const [selectedPayment, setSelectedPayment] = useState<string>("card")
  const [isPurchasing, setIsPurchasing] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)
  const userCredits = 12

  const [isTossReady, setIsTossReady] = useState(false)

  useEffect(() => {
    loadTossPaymentsScript()
      .then(() => {
        setIsTossReady(true)
      })
      .catch(() => {
        setIsTossReady(false)
      })
  }, [])

  const handlePurchase = async () => {
    if (!selectedPack) return
    if (!isTossReady) {
      alert("결제 모듈 로딩 중입니다. 잠시 후 다시 시도해주세요.")
      return
    }

    const clientKey = process.env.NEXT_PUBLIC_TOSS_CLIENT_KEY
    if (!clientKey) {
      alert("NEXT_PUBLIC_TOSS_CLIENT_KEY가 .env.local에 설정되어 있지 않습니다.")
      return
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const TossPayments = (window as any).TossPayments
    if (!TossPayments) {
      alert("토스페이먼츠 스크립트를 불러오지 못했습니다.")
      return
    }

    const pack = creditPacks.find((p) => p.id === selectedPack)
    if (!pack) return

    setIsPurchasing(true)

    try {
      const toss = TossPayments(clientKey)

      await toss.requestPayment("카드", {
        amount: pack.price,
        orderId: `rhymemind-${Date.now()}`,
        orderName: `${pack.credits} Credits Pack`,
        successUrl: window.location.origin + "/store/success",
        failUrl: window.location.origin + "/store/fail",
      })
    } catch (error) {
      console.error(error)
      alert("결제 처리 중 오류가 발생했습니다.")
    } finally {
      setIsPurchasing(false)
    }
  }

  return (
    <main className="min-h-screen bg-background pb-24">
      {/* Header */}
      <div className="px-5 pt-8 pb-6">
        <div className="text-center space-y-2">
          <p className="text-xs font-medium text-muted-foreground tracking-widest uppercase">Your Balance</p>
          <div className="flex items-center justify-center gap-3">
            <div className="relative">
              <Zap className="w-8 h-8 text-primary fill-primary animate-pulse" />
              <div className="absolute inset-0 blur-lg bg-primary/30" />
            </div>
            <span className="text-5xl font-black text-foreground tracking-tight" style={{ fontFamily: 'var(--font-space), monospace' }}>
              {userCredits}
            </span>
            <span className="text-lg font-bold text-muted-foreground self-end mb-2">CREDITS</span>
          </div>
        </div>
      </div>

      {/* Credit Packs */}
      <div className="px-5 space-y-4">
        <h2 className="text-sm font-semibold text-muted-foreground tracking-wide">Credit Packs</h2>
        
        <div className="grid grid-cols-1 gap-3">
          {creditPacks.map((pack) => (
            <button
              key={pack.id}
              onClick={() => setSelectedPack(pack.id)}
              className={cn(
                "relative p-4 rounded-xl border-2 text-left transition-all duration-200 active:scale-[0.98]",
                pack.style,
                selectedPack === pack.id 
                  ? "border-primary bg-primary/5" 
                  : "bg-card"
              )}
            >
              {pack.tag && (
                <span className={cn(
                  "absolute -top-2 right-4 px-2 py-0.5 text-[10px] font-bold rounded-full",
                  pack.id === "pro" 
                    ? "bg-primary text-primary-foreground" 
                    : "bg-gradient-to-r from-amber-500 to-primary text-background"
                )}>
                  {pack.tag}
                </span>
              )}
              
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <h3 className="text-lg font-bold text-foreground">{pack.name}</h3>
                  <p className="text-sm text-muted-foreground">
                    <span className="text-primary font-semibold">{pack.credits}</span> Credits
                  </p>
                </div>
                
                <div className="flex items-center gap-3">
                  <span className="text-2xl font-black text-foreground" style={{ fontFamily: 'var(--font-space), monospace' }}>
                    ${pack.price}
                  </span>
                  <div className={cn(
                    "w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors",
                    selectedPack === pack.id 
                      ? "border-primary bg-primary" 
                      : "border-muted-foreground"
                  )}>
                    {selectedPack === pack.id && (
                      <Check className="w-4 h-4 text-primary-foreground" />
                    )}
                  </div>
                </div>
              </div>
              
              {pack.id === "legend" && (
                <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-amber-500/20 via-primary/20 to-amber-600/20 pointer-events-none" />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Payment Methods */}
      <div className="px-5 mt-8 space-y-4">
        <h2 className="text-sm font-semibold text-muted-foreground tracking-wide">Payment Method</h2>
        
        <div className="flex gap-3">
          {paymentMethods.map((method) => (
            <button
              key={method.id}
              onClick={() => setSelectedPayment(method.id)}
              className={cn(
                "flex-1 p-4 rounded-xl border transition-all duration-200 active:scale-95",
                selectedPayment === method.id 
                  ? "border-primary bg-primary/10" 
                  : "border-border bg-card hover:border-muted-foreground"
              )}
            >
              <div className="flex flex-col items-center gap-2">
                {method.icon === "apple" && (
                  <svg className="w-6 h-6 text-foreground" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
                  </svg>
                )}
                {method.icon === "google" && (
                  <svg className="w-6 h-6" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                )}
                {method.icon === "card" && (
                  <CreditCard className="w-6 h-6 text-foreground" />
                )}
                <span className="text-xs font-medium text-muted-foreground">{method.name}</span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Purchase Button */}
      <div className="px-5 mt-8">
        <button
          onClick={handlePurchase}
          disabled={!selectedPack || isPurchasing}
          className={cn(
            "w-full py-4 rounded-xl font-bold text-base transition-all duration-200 flex items-center justify-center gap-2 active:scale-95",
            "bg-primary text-primary-foreground hover:bg-primary/90",
            "disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100"
          )}
        >
          {isPurchasing ? (
            <>
              <div className="w-5 h-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
              Processing...
            </>
          ) : showSuccess ? (
            <>
              <Check className="w-5 h-5" />
              Purchase Complete!
            </>
          ) : (
            <>
              <Zap className="w-5 h-5" />
              REFILL NOW
            </>
          )}
        </button>
      </div>

      {/* Success Animation Overlay */}
      {showSuccess && (
        <div className="fixed inset-0 flex items-center justify-center pointer-events-none z-50">
          <div className="flex items-center gap-2 bg-primary text-primary-foreground px-6 py-3 rounded-full animate-bounce">
            <Sparkles className="w-5 h-5" />
            <span className="font-bold">+{creditPacks.find(p => p.id === selectedPack)?.credits} Credits!</span>
          </div>
        </div>
      )}

      <BottomNav />
    </main>
  )
}
