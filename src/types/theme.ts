export type Theme = 'light' | 'dark' | 'system'
export type ThemeLabel = Capitalize<Theme>

export type ThemeOption = {
  value: Theme
  label: ThemeLabel
}
