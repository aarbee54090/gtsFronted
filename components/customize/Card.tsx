import type { ReactNode } from "react"

interface CardProps {
  children: ReactNode
  className?: string
}

export function Card({ children, className = "" }: CardProps) {
  return (
    <div
      className={`glass-bevel rounded-[var(--radius-lg)] border border-[var(--glass-border)] bg-[var(--glass-bg)] p-6 backdrop-blur-[16px] ${className}`}
    >
      {children}
    </div>
  )
}
