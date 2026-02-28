'use client'
import { useState } from 'react'
import { PBQDragQuestion } from '@/types/exam'

interface PBQDragProps {
  question: PBQDragQuestion
  onAnswer: (answer: Record<string, string>) => void
}

export function PBQDrag({ question, onAnswer }: PBQDragProps) {
  const [assignments, setAssignments] = useState<Record<string, string>>({})
  const [submitted, setSubmitted] = useState(false)
  const [draggedItem, setDraggedItem] = useState<string | null>(null)

  const unassigned = question.items.filter((item) => !assignments[item.id])
  const allAssigned = Object.keys(assignments).length === question.items.length

  const handleDragStart = (itemId: string) => {
    setDraggedItem(itemId)
  }

  const handleDrop = (zoneId: string) => {
    if (!draggedItem || submitted) return
    setAssignments((prev) => ({ ...prev, [draggedItem]: zoneId }))
    setDraggedItem(null)
  }

  const handleTapAssign = (itemId: string, zoneId: string) => {
    if (submitted) return
    setAssignments((prev) => ({ ...prev, [itemId]: zoneId }))
  }

  const removeAssignment = (itemId: string) => {
    if (submitted) return
    setAssignments((prev) => {
      const next = { ...prev }
      delete next[itemId]
      return next
    })
  }

  const handleSubmit = () => {
    if (submitted || !allAssigned) return
    setSubmitted(true)
    onAnswer(assignments)
  }

  // For tap-based assignment on mobile
  const [selectedItem, setSelectedItem] = useState<string | null>(null)

  const handleItemTap = (itemId: string) => {
    if (submitted) return
    if (selectedItem === itemId) {
      setSelectedItem(null)
    } else {
      setSelectedItem(itemId)
    }
  }

  const handleZoneTap = (zoneId: string) => {
    if (submitted || !selectedItem) return
    setAssignments((prev) => ({ ...prev, [selectedItem]: zoneId }))
    setSelectedItem(null)
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
        <p className="text-[#faf9f5] text-base leading-relaxed">{question.stem}</p>
        <p className="text-[#b0aea5] text-xs">Tap an item, then tap a zone to place it. Tap a placed item to remove it.</p>

        {/* Item pool */}
        {unassigned.length > 0 && (
          <div className="space-y-1.5">
            <p className="text-xs text-[#b0aea5] font-semibold uppercase tracking-wider">Items</p>
            <div className="flex flex-wrap gap-2">
              {unassigned.map((item) => (
                <button
                  key={item.id}
                  draggable={!submitted}
                  onDragStart={() => handleDragStart(item.id)}
                  onClick={() => handleItemTap(item.id)}
                  className={`px-3 py-2 rounded-lg border text-sm transition-all ${
                    selectedItem === item.id
                      ? 'bg-[#d97757]/20 border-[#d97757] text-[#d97757]'
                      : 'bg-[#1c1c1a] border-[#e8e6dc20] text-[#faf9f5] active:scale-95'
                  }`}
                >
                  {item.text}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Drop zones */}
        <div className="space-y-3">
          {question.zones.map((zone) => {
            const zoneItems = question.items.filter(
              (item) => assignments[item.id] === zone.id
            )
            return (
              <div
                key={zone.id}
                onDragOver={(e) => e.preventDefault()}
                onDrop={() => handleDrop(zone.id)}
                onClick={() => handleZoneTap(zone.id)}
                className={`rounded-xl border-2 border-dashed p-3 min-h-[60px] transition-all ${
                  selectedItem
                    ? 'border-[#d97757]/50 bg-[#d97757]/5'
                    : 'border-[#e8e6dc20] bg-[#1c1c1a]'
                }`}
              >
                <p className="text-xs font-semibold text-[#d97757] mb-2 uppercase tracking-wider">
                  {zone.label}
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {zoneItems.map((item) => (
                    <button
                      key={item.id}
                      onClick={(e) => {
                        e.stopPropagation()
                        removeAssignment(item.id)
                      }}
                      className="px-2.5 py-1.5 bg-[#d97757]/15 border border-[#d97757]/40 text-[#faf9f5] rounded-lg text-sm active:scale-95 transition-all"
                    >
                      {item.text}
                    </button>
                  ))}
                  {zoneItems.length === 0 && (
                    <span className="text-[#b0aea5]/50 text-xs italic">Drop items here</span>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {!submitted && (
        <div className="px-4 py-3 border-t border-[#e8e6dc20]">
          <button
            onClick={handleSubmit}
            disabled={!allAssigned}
            className={`w-full py-3 rounded-xl font-semibold transition-all active:scale-95 ${
              allAssigned
                ? 'bg-[#d97757] hover:bg-[#c86846] text-white'
                : 'bg-[#e8e6dc20] text-[#b0aea5] cursor-not-allowed'
            }`}
          >
            Submit
          </button>
        </div>
      )}
    </div>
  )
}
