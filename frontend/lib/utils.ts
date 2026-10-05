import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import { CATEGORIES } from "./constants"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount)
}

export function formatDate(dateString: string): string {
  const date = new Date(dateString)
  return new Intl.DateTimeFormat('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date)
}

export function getCategoryColor(category: string): string {
  const cat = CATEGORIES.find(c => c.name === category)
  return cat ? cat.color : "#94A3B8"
}

export function getCategoryIcon(category: string): string {
  const cat = CATEGORIES.find(c => c.name === category)
  return cat ? cat.icon : "Circle"
}

export function getScoreColor(score: number): string {
  if (score >= 80) return "text-emerald-500 bg-emerald-500/20"
  if (score >= 60) return "text-amber-500 bg-amber-500/20"
  return "text-red-500 bg-red-500/20"
}

export function truncateText(text: string, maxLen: number): string {
  if (!text) return ""
  if (text.length <= maxLen) return text
  return text.slice(0, maxLen) + '...'
}
