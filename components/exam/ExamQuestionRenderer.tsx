'use client'
import { ExamQuestion } from '@/types/exam'
import { MCQ } from './question-types/MCQ'
import { MSQ } from './question-types/MSQ'
import { PBQOrder } from './question-types/PBQOrder'
import { PBQDrag } from './question-types/PBQDrag'

interface ExamQuestionRendererProps {
  question: ExamQuestion
  onAnswer: (answer: string | string[] | Record<string, string>) => void
}

export function ExamQuestionRenderer({ question, onAnswer }: ExamQuestionRendererProps) {
  switch (question.type) {
    case 'mcq':
      return <MCQ key={question.id} question={question} onAnswer={onAnswer} />
    case 'msq':
      return <MSQ key={question.id} question={question} onAnswer={onAnswer} />
    case 'pbq_order':
      return <PBQOrder key={question.id} question={question} onAnswer={onAnswer} />
    case 'pbq_drag':
      return <PBQDrag key={question.id} question={question} onAnswer={onAnswer} />
  }
}
