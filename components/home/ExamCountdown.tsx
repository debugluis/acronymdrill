'use client'
import { useState } from 'react'
import { doc, updateDoc } from 'firebase/firestore'
import { db } from '@/lib/firebase'

interface ExamCountdownProps {
  examDate?: Date
  userId: string
  onUpdate: () => void
}

export function ExamCountdown({ examDate, userId, onUpdate }: ExamCountdownProps) {
  const [editing, setEditing] = useState(false)
  const [dateInput, setDateInput] = useState('')

  const daysLeft = examDate
    ? Math.ceil((examDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24))
    : null

  const handleSave = async () => {
    if (!dateInput) return
    const date = new Date(dateInput)
    await updateDoc(doc(db, 'users', userId), { examDate: date })
    setEditing(false)
    onUpdate()
  }

  if (editing) {
    return (
      <div className="px-4 py-3 flex gap-2">
        <input
          type="date"
          value={dateInput}
          onChange={(e) => setDateInput(e.target.value)}
          className="flex-1 bg-[#1c1c1a] border border-[#e8e6dc20] rounded-xl px-3 py-2 text-[#faf9f5] text-sm"
        />
        <button
          onClick={handleSave}
          className="bg-[#d97757] text-white rounded-xl px-4 py-2 text-sm font-semibold"
        >
          Save
        </button>
        <button
          onClick={() => setEditing(false)}
          className="text-[#b0aea5] px-3 py-2 text-sm"
        >
          Cancel
        </button>
      </div>
    )
  }

  if (daysLeft !== null && daysLeft > 0) {
    return (
      <button onClick={() => setEditing(true)} className="w-full px-4 py-3 text-center">
        <p className="text-[#d97757] font-semibold font-poppins text-lg">
          {daysLeft} day{daysLeft !== 1 ? 's' : ''} until your exam
        </p>
        <p className="text-[#b0aea5] text-xs mt-0.5">tap to change date</p>
      </button>
    )
  }

  if (daysLeft !== null && daysLeft <= 0) {
    return (
      <div className="px-4 py-3 text-center">
        <p className="text-[#788c5d] font-semibold font-poppins">Exam day is here — you've got this!</p>
      </div>
    )
  }

  return (
    <button
      onClick={() => setEditing(true)}
      className="mx-4 my-2 py-2 px-4 rounded-xl border border-[#e8e6dc20] text-[#b0aea5] text-sm hover:border-[#d97757] hover:text-[#d97757] transition-colors"
    >
      Set your exam date
    </button>
  )
}
