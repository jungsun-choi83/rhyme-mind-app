"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { PenTool, Trophy, Disc3, Zap } from "lucide-react"
import { cn } from "@/lib/utils"

const navItems = [
  { href: "/", icon: PenTool, label: "Create" },
  { href: "/community", icon: Trophy, label: "Chart" },
  { href: "/library", icon: Disc3, label: "Library" },
  { href: "/store", icon: Zap, label: "Store" },
]

export function BottomNav() {
  const pathname = usePathname()

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-[#0a0a0a]/95 backdrop-blur-xl border-t border-border/50">
      <div className="max-w-lg mx-auto flex items-center justify-around">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href
          
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "relative flex flex-col items-center gap-1 px-6 py-3 transition-all duration-200 active:scale-95",
                isActive 
                  ? "text-primary" 
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {isActive && (
                <span className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-0.5 bg-primary rounded-full shadow-[0_0_8px_var(--primary)]" />
              )}
              <Icon className={cn(
                "w-5 h-5 transition-all",
                isActive && "drop-shadow-[0_0_6px_var(--primary)]"
              )} />
              <span className={cn(
                "text-[10px] font-medium tracking-wide",
                isActive && "text-shadow-sm"
              )}>{item.label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
