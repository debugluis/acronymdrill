export function speakPhonetic(phonetic: string) {
  if (typeof window === 'undefined' || !window.speechSynthesis) return
  window.speechSynthesis.cancel()
  const utterance = new SpeechSynthesisUtterance(phonetic)
  utterance.rate = 0.9
  utterance.pitch = 1.0
  window.speechSynthesis.speak(utterance)
}

export function autoPlayPhonetic(phonetic: string, delay = 300) {
  if (typeof window === 'undefined' || !window.speechSynthesis) return
  setTimeout(() => {
    window.speechSynthesis.cancel()
    const utterance = new SpeechSynthesisUtterance(phonetic)
    utterance.rate = 0.9
    utterance.pitch = 1.0
    window.speechSynthesis.speak(utterance)
  }, delay)
}
