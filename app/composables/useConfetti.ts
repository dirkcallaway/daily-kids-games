import confetti from 'canvas-confetti'

export function useConfetti() {
  function launchFireworks() {
    const duration = 3000
    const end = Date.now() + duration
    const rand = (min: number, max: number) => Math.random() * (max - min) + min

    const interval = setInterval(() => {
      const timeLeft = end - Date.now()
      if (timeLeft <= 0) return clearInterval(interval)

      const count = 50 * (timeLeft / duration)

      confetti({
        particleCount: count,
        startVelocity: 30,
        spread: 360,
        ticks: 60,
        zIndex: 9999,
        origin: { x: rand(0.1, 0.3), y: Math.random() - 0.2 },
      })
      confetti({
        particleCount: count,
        startVelocity: 30,
        spread: 360,
        ticks: 60,
        zIndex: 9999,
        origin: { x: rand(0.7, 0.9), y: Math.random() - 0.2 },
      })
    }, 250)
  }

  return { launchFireworks }
}
