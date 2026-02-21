'use client'
import { Question } from '@/types'
import { MultipleChoice } from './question-types/MultipleChoice'
import { SwipeTrueFalse } from './question-types/SwipeTrueFalse'
import { MatchPairs } from './question-types/MatchPairs'
import { FillBlank } from './question-types/FillBlank'
import { Scenario } from './question-types/Scenario'

interface QuestionRendererProps {
  question: Question
  onAnswer: (correct: boolean, selected: string) => void
  answered?: boolean
  selectedAnswer?: string
}

export function QuestionRenderer({ question, onAnswer, answered, selectedAnswer }: QuestionRendererProps) {
  switch (question.type) {
    case 1:
    case 2:
      return (
        <MultipleChoice
          question={question}
          onAnswer={onAnswer}
          answered={answered}
          selectedAnswer={selectedAnswer}
        />
      )
    case 3:
      return <SwipeTrueFalse question={question} onAnswer={onAnswer} />
    case 4:
      return <MatchPairs question={question} onAnswer={onAnswer} />
    case 5:
      return <FillBlank question={question} onAnswer={onAnswer} />
    case 6:
      return (
        <Scenario
          question={question}
          onAnswer={onAnswer}
          answered={answered}
          selectedAnswer={selectedAnswer}
        />
      )
    default:
      return null
  }
}
