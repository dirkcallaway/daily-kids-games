import { ref } from 'vue'

const STORAGE_KEY = 'dark-mode'
const isDark = ref(false)

function applyDark(val: boolean) {
  document.documentElement.classList.toggle('dark', val)
  isDark.value = val
}

function toggle() {
  const next = !isDark.value
  localStorage.setItem(STORAGE_KEY, String(next))
  applyDark(next)
}

function init() {
  const stored = localStorage.getItem(STORAGE_KEY)
  if (stored !== null) {
    applyDark(stored === 'true')
  } else {
    applyDark(window.matchMedia('(prefers-color-scheme: dark)').matches)
  }
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', e => {
    if (localStorage.getItem(STORAGE_KEY) === null) applyDark(e.matches)
  })
}

export function useDarkMode() {
  return { isDark, toggle, init }
}
