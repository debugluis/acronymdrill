'use client'
import { useState, useRef } from 'react'
import { PBQOrderQuestion } from '@/types/exam'
import { GripVertical } from 'lucide-react'

interface PBQOrderProps {
  question: PBQOrderQuestion
  onAnswer: (answer: string[]) => void
}

export function PBQOrder({ question, onAnswer }: PBQOrderProps) {
  const [items, setItems] = useState(() =>
    shuffleArray(question.items.map((i) => ({ ...i })))
  )
  const [submitted, setSubmitted] = useState(false)
  const dragItem = useRef<number | null>(null)
  const dragOverItem = useRef<number | null>(null)

  const handleDragStart = (index: number) => {
    dragItem.current = index
  }

  const handleDragEnter = (index: number) => {
    dragOverItem.current = index
  }

  const handleDragEnd = () => {
    if (dragItem.current === null || dragOverItem.current === null) return
    const newItems = [...items]
    const dragged = newItems.splice(dragItem.current, 1)[0]
    newItems.splice(dragOverItem.current, 0, dragged)
    setItems(newItems)
    dragItem.current = null
    dragOverItem.current = null
  }

  // Touch drag support
  const touchStart = useRef<{ index: number; y: number } | null>(null)

  const handleTouchStart = (index: number, e: React.TouchEvent) => {
    touchStart.current = { index, y: e.touches[0].clientY }
    dragItem.current = index
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    if (touchStart.current === null) return
    const touch = e.touches[0]
    const elements = document.querySelectorAll('[data-order-item]')
    for (let i = 0; i < elements.length; i++) {
      const rect = elements[i].getBoundingClientRect()
      if (touch.clientY >= rect.top && touch.clientY <= rect.bottom) {
        dragOverItem.current = i
        break
      }
    }
  }

  const handleTouchEnd = () => {
    handleDragEnd()
    touchStart.current = null
  }

  const handleSubmit = () => {
    if (submitted) return
    setSubmitted(true)
    onAnswer(items.map((i) => i.id))
  }

  // Move item up/down for accessibility
  const moveItem = (index: number, direction: 'up' | 'down') => {
    if (submitted) return
    const newIdx = direction === 'up' ? index - 1 : index + 1
    if (newIdx < 0 || newIdx >= items.length) return
    const newItems = [...items]
    ;[newItems[index], newItems[newIdx]] = [newItems[newIdx], newItems[index]]
    setItems(newItems)
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
        <p className="text-[#faf9f5] text-base leading-relaxed">{question.stem}</p>
        <p className="text-[#b0aea5] text-xs">Drag to reorder, or use arrows. Submit when ready.</p>
        <div className="space-y-2">
          {items.map((item, index) => (
            <div
              key={item.id}
              data-order-item
              draggable={!submitted}
              onDragStart={() => handleDragStart(index)}
              onDragEnter={() => handleDragEnter(index)}
              onDragEnd={handleDragEnd}
              onDragOver={(e) => e.preventDefault()}
              onTouchStart={(e) => handleTouchStart(index, e)}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl border transition-all select-none ${
                submitted
                  ? 'bg-[#1c1c1a] border-[#e8e6dc20]'
                  : 'bg-[#1c1c1a] border-[#e8e6dc20] cursor-grab active:cursor-grabbing active:bg-[#2a2a28]'
              }`}
            >
              <GripVertical className="w-4 h-4 text-[#b0aea5] flex-shrink-0" />
              <span className="text-[#d97757] font-bold text-sm w-6">{index + 1}</span>
              <span className="text-[#faf9f5] flex-1 text-sm">{item.text}</span>
              {!submitted && (
                <div className="flex flex-col gap-0.5">
                  <button
                    onClick={() => moveItem(index, 'up')}
                    className="text-[#b0aea5] hover:text-[#faf9f5] text-xs px-1"
                    disabled={index === 0}
                  >
                    ▲
                  </button>
                  <button
                    onClick={() => moveItem(index, 'down')}
                    className="text-[#b0aea5] hover:text-[#faf9f5] text-xs px-1"
                    disabled={index === items.length - 1}
                  >
                    ▼
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
      {!submitted && (
        <div className="px-4 py-3 border-t border-[#e8e6dc20]">
          <button
            onClick={handleSubmit}
            className="w-full py-3 bg-[#d97757] hover:bg-[#c86846] text-white rounded-xl font-semibold transition-colors active:scale-95"
          >
            Submit Order
          </button>
        </div>
      )}
    </div>
  )
}

function shuffleArray<T>(arr: T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}
