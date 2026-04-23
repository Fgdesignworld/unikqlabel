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
      const stored = localStorage.getItem('unikq-theme')
      if (stored === 'light' || stored === 'dark') return stored as Theme
    } catch {}
    return 'dark'
  })

  useEffect(() => {
    const html = document.documentElement
    html.setAttribute('data-theme', theme)

    // Imperatively set CSS variables so inline `style` props using var() also flip
    const vars = theme === 'light'
      ? {
          '--background':    '#faf7f2',
          '--foreground':    '#1a1714',
          '--surface-page':  '#faf7f2',
          '--surface-card':  '#ffffff',
          '--surface-alt':   '#f5f1ea',
          '--text-primary':  '#1a1714',
          '--text-muted':    'rgba(26,23,20,0.65)',
          '--text-dim':      'rgba(26,23,20,0.55)',
          '--text-subtle':   'rgba(26,23,20,0.50)',
          '--text-faint':    'rgba(26,23,20,0.45)',
          '--text-ghost':    'rgba(26,23,20,0.35)',
          '--text-trace':    'rgba(26,23,20,0.30)',
        }
      : {
          '--background':    '#0D0D0D',
          '--foreground':    '#F5F0E8',
          '--surface-page':  '#0D0D0D',
          '--surface-card':  '#111111',
          '--surface-alt':   '#1a1a1a',
          '--text-primary':  '#F5F0E8',
          '--text-muted':    'rgba(245,240,232,0.65)',
          '--text-dim':      'rgba(245,240,232,0.55)',
          '--text-subtle':   'rgba(245,240,232,0.50)',
          '--text-faint':    'rgba(245,240,232,0.45)',
          '--text-ghost':    'rgba(245,240,232,0.35)',
          '--text-trace':    'rgba(245,240,232,0.30)',
        }

    Object.entries(vars).forEach(([k, v]) => html.style.setProperty(k, v))

    try { localStorage.setItem('unikq-theme', theme) } catch {}
  }, [theme])

  const toggleTheme = () => setTheme(t => t === 'dark' ? 'light' : 'dark')

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, isDark: theme === 'dark' }}>
      {children}
    </ThemeContext.Provider>
  )
}

export const useTheme = () => useContext(ThemeContext)
