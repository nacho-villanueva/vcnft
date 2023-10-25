import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs))
}

export function truncateDid(did?: string, start: number = 15, end: number = 4) {
    if (!did) return ""
    return did.slice(0, start) + " ... " + did.slice(-end)
}

export function truncateAddress(address?: string) {
  if (!address) return ""
    return address.slice(0, 6) + " ... " + address.slice(-4)
}
