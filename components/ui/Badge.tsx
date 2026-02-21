'use client'
import { AcronymCategory } from '@/types'

const categoryColors: Record<AcronymCategory | string, string> = {
  protocol: 'bg-blue-900/40 text-blue-300 border-blue-700/40',
  tool: 'bg-orange-900/40 text-orange-300 border-orange-700/40',
  attack: 'bg-red-900/40 text-red-300 border-red-700/40',
  crypto: 'bg-purple-900/40 text-purple-300 border-purple-700/40',
  access: 'bg-green-900/40 text-green-300 border-green-700/40',
  business: 'bg-yellow-900/40 text-yellow-300 border-yellow-700/40',
  hardware: 'bg-gray-700/40 text-gray-300 border-gray-600/40',
  standard: 'bg-cyan-900/40 text-cyan-300 border-cyan-700/40',
  role: 'bg-pink-900/40 text-pink-300 border-pink-700/40',
}

const domainLabels: Record<number, string> = {
  1: 'D1 General',
  2: 'D2 Threats',
  3: 'D3 Architecture',
  4: 'D4 Operations',
  5: 'D5 Program',
}

interface BadgeProps {
  type: 'domain' | 'category'
  value: number | AcronymCategory
}

export function Badge({ type, value }: BadgeProps) {
  if (type === 'domain') {
    const label = domainLabels[value as number] ?? `D${value}`
    return (
      <span className="px-2 py-0.5 rounded-full text-xs border border-[#e8e6dc20] bg-[#1c1c1a] text-[#b0aea5]">
        {label}
      </span>
    )
  }
  const cat = value as AcronymCategory
  const colorClass = categoryColors[cat] ?? 'bg-gray-700/40 text-gray-300 border-gray-600/40'
  return (
    <span className={`px-2 py-0.5 rounded-full text-xs border capitalize ${colorClass}`}>
      {cat}
    </span>
  )
}
