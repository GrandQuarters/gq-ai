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
  const today = new Date()
  const yesterday = new Date(today)
  yesterday.setDate(yesterday.getDate() - 1)
  
  if (d.toDateString() === today.toDateString()) {
    return formatTime(d)
  } else if (d.toDateString() === yesterday.toDateString()) {
    return 'Gestern'
  } else {
    return d.toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit' })
  }
}

export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text
  return text.slice(0, maxLength) + '...'
}