'use client'
import { ButtonHTMLAttributes, ReactNode } from 'react'

interface HapticButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  haptic?: 'correct' | 'wrong' | 'none'
  children: ReactNode
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger'
}

export function HapticButton({
  haptic = 'none',
  children,
  variant = 'primary',
  onClick,
  className = '',
  ...props
}: HapticButtonProps) {
  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (typeof window !== 'undefined' && navigator.vibrate) {
      if (haptic === 'correct') navigator.vibrate(50)
      else if (haptic === 'wrong') navigator.vibrate([100, 50, 100])
    }
    onClick?.(e)
  }

  const variantClasses = {
    primary: 'bg-[#d97757] hover:bg-[#c86846] text-white font-semibold',
    secondary: 'bg-[#6a9bcc] hover:bg-[#5a8bbc] text-white font-semibold',
    ghost: 'bg-[#1c1c1a] hover:bg-[#2a2a28] text-[#b0aea5] border border-[#e8e6dc20]',
    danger: 'bg-[#c0392b] hover:bg-[#a93226] text-white font-semibold',
  }

  return (
    <button
      {...props}
      onClick={handleClick}
      className={`rounded-xl px-4 py-3 transition-all active:scale-95 ${variantClasses[variant]} ${className}`}
    >
      {children}
    </button>
  )
}
