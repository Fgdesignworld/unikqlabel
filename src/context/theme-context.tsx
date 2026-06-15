import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'

export type Theme = 'dark' | 'light'

interface ThemeContextType {
  theme: Theme
  toggleTheme: () => void
  isDark: boolean
}

const ThemeContext = createContext<ThemeContextType>({
  theme: 'dark',
  toggleTheme: () => {},
  isDark: true,
})

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<Theme>(() => {
    try {
      const stored = localStorage.getItem('koffeekup-theme')
      if (stored === 'light' || stored === 'dark') return stored as Theme
    } catch {}
    return 'light'
  })

  useEffect(() => {
    const html = document.documentElement
    html.setAttribute('data-theme', theme)

    // Imperatively set CSS variables so inline `style` props using var() also flip
    const vars = theme === 'light'
      ? {
          '--background':    '#F8F3EA',
          '--foreground':    '#2A2A2A',
          '--surface-page':  '#F8F3EA',
          '--surface-card':  '#F5EBDD',
          '--surface-alt':   '#FFF9F2',
          '--text-primary':  '#2A2A2A',
          '--text-muted':    '#6F6A63',
          '--text-dim':      'rgba(42, 42, 42, 0.70)',
          '--text-subtle':   'rgba(42, 42, 42, 0.60)',
          '--text-faint':    'rgba(42, 42, 42, 0.50)',
          '--text-ghost':    'rgba(42, 42, 42, 0.40)',
          '--text-trace':    'rgba(42, 42, 42, 0.30)',
          '--drop-shadow':   'rgba(26, 23, 20, 0.15)',
          '--card-shadow':   '0 20px 40px -15px rgba(26, 23, 20, 0.08)',
        }
      : {
          '--background':    '#151515',
          '--foreground':    '#F8F3EA',
          '--surface-page':  '#151515',
          '--surface-card':  '#1E1E1E',
          '--surface-alt':   '#252525',
          '--text-primary':  '#F8F3EA',
          '--text-muted':    'rgba(248, 243, 234, 0.70)',
          '--text-dim':      'rgba(248, 243, 234, 0.60)',
          '--text-subtle':   'rgba(248, 243, 234, 0.50)',
          '--text-faint':    'rgba(248, 243, 234, 0.45)',
          '--text-ghost':    'rgba(248, 243, 234, 0.35)',
          '--text-trace':    'rgba(248, 243, 234, 0.30)',
          '--drop-shadow':   'rgba(0, 0, 0, 0.65)',
          '--card-shadow':   '0 30px 60px -15px rgba(0, 0, 0, 0.5)',
        }

    Object.entries(vars).forEach(([k, v]) => html.style.setProperty(k, v))

    try { localStorage.setItem('koffeekup-theme', theme) } catch {}
  }, [theme])

  const toggleTheme = () => setTheme(t => t === 'dark' ? 'light' : 'dark')

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, isDark: theme === 'dark' }}>
      {children}
    </ThemeContext.Provider>
  )
}

export const useTheme = () => useContext(ThemeContext)
