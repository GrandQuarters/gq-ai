import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatTime(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date
  return d.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' })
}

export function formatDate(date: Date | string | undefined): string {
  if (!date) return ''
  
  const d = typeof date === 'string' ? new Date(date) : date
  const now = new Date()

  // Normalize both to midnight for day-diff calculation
  const todayMidnight = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const dMidnight = new Date(d.getFullYear(), d.getMonth(), d.getDate())
  const diffDays = Math.round((todayMidnight.getTime() - dMidnight.getTime()) / (1000 * 60 * 60 * 24))

  if (diffDays === 0) {
    return d.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' })
  } else if (diffDays === 1) {
    return 'Gestern'
  } else if (diffDays < 7) {
    return `vor ${diffDays} Tagen`
  } else if (diffDays < 14) {
    return 'vor 1 Woche'
  } else if (diffDays < 21) {
    return 'vor 2 Wochen'
  } else if (diffDays < 28) {
    return 'vor 3 Wochen'
  } else {
    return d.toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: '2-digit' })
  }
}

export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text
  return text.slice(0, maxLength) + '...'
}