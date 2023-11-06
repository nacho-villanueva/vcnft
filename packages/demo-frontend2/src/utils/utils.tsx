import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import {Network} from "ethers";

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

export function getEthScanLink (address: string, network: Network)  {
    return `https://${network.name === "homestead" ? "" : network.name + "."}etherscan.io/tx/${address}`
}

export function getCoinbaseLink ()  {
    // @ts-ignore
    let userAgent = navigator.userAgent || navigator.vendor || window.opera;

    if (/android/i.test(userAgent)) {
        return "https://play.google.com/store/apps/details?id=org.toshi&hl=en&gl=US";
    }

    // iOS detection from: http://stackoverflow.com/a/9039885/177710
    // @ts-ignore
    if (/iPad|iPhone|iPod/.test(userAgent) && !window.MSStream) {
        return "https://apps.apple.com/us/app/coinbase-wallet-nfts-crypto/id1278383455";
    }

    return "https://www.coinbase.com/wallet";

}
