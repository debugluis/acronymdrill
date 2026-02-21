export function hapticCorrect() {
  if (typeof window !== 'undefined' && navigator.vibrate) {
    navigator.vibrate(50)
  }
}

export function hapticWrong() {
  if (typeof window !== 'undefined' && navigator.vibrate) {
    navigator.vibrate([100, 50, 100])
  }
}
