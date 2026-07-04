import { Sun, Moon, Monitor } from 'lucide-react'
import { useTheme } from './useTheme'
import type { ThemeMode } from '@/types'

interface ThemeToggleProps {
  variant?: 'icon' | 'full'
}

const iconMap: Record<ThemeMode, typeof Sun> = {
  light: Sun,
  dark: Moon,
  auto: Monitor,
}

const labelMap: Record<ThemeMode, string> = {
  light: 'Light',
  dark: 'Dark',
  auto: 'System',
}

const nextMode: Record<ThemeMode, ThemeMode> = {
  light: 'dark',
  dark: 'auto',
  auto: 'light',
}

export function ThemeToggle({ variant = 'icon' }: ThemeToggleProps) {
  const { mode, theme, setMode } = useTheme()
  const Icon = iconMap[mode]

  const cycle = () => setMode(nextMode[mode])

  if (variant === 'full') {
    return (
      <div className="flex items-center gap-2">
        {(['light', 'dark', 'auto'] as ThemeMode[]).map(m => {
          const MIcon = iconMap[m]
          const isActive = mode === m
          return (
            <button
              key={m}
              onClick={() => setMode(m)}
              aria-label={`${labelMap[m]} mode`}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                isActive
                  ? 'bg-[var(--color-primary)] text-white shadow-md shadow-[var(--color-primary)]/20'
                  : 'bg-[var(--color-bg-tertiary)] text-[var(--color-text-secondary)] hover:text-[var(--color-text)] hover:bg-[var(--color-bg-secondary)] border border-[var(--color-border)]'
              }`}
            >
              <MIcon className="w-4 h-4" />
              <span>{labelMap[m]}</span>
            </button>
          )
        })}
      </div>
    )
  }

  return (
    <button
      onClick={cycle}
      aria-label={`Current mode: ${labelMap[mode]}. Click to switch to ${labelMap[nextMode[mode]]}`}
      className="w-10 h-10 rounded-full flex items-center justify-center transition-all duration-200 border border-[var(--color-border)] bg-[var(--color-bg-secondary)] text-[var(--color-text-secondary)] hover:text-[var(--color-text)] hover:border-[var(--color-border-hover)] hover:bg-[var(--color-bg-tertiary)] shadow-sm hover:shadow-md active:scale-95"
    >
      <Icon className={`w-5 h-5 transition-transform duration-200 ${mode === 'auto' ? 'animate-pulse' : ''}`} />
    </button>
  )
}
