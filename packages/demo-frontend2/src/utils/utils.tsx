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

function cyrb128(str: string) {
  let h1 = 1779033703, h2 = 3144134277,
    h3 = 1013904242, h4 = 2773480762;
  for (let i = 0, k; i < str.length; i++) {
    k = str.charCodeAt(i);
    h1 = h2 ^ Math.imul(h1 ^ k, 597399067);
    h2 = h3 ^ Math.imul(h2 ^ k, 2869860233);
    h3 = h4 ^ Math.imul(h3 ^ k, 951274213);
    h4 = h1 ^ Math.imul(h4 ^ k, 2716044179);
  }
  h1 = Math.imul(h3 ^ (h1 >>> 18), 597399067);
  h2 = Math.imul(h4 ^ (h2 >>> 22), 2869860233);
  h3 = Math.imul(h1 ^ (h3 >>> 17), 951274213);
  h4 = Math.imul(h2 ^ (h4 >>> 19), 2716044179);
  h1 ^= (h2 ^ h3 ^ h4), h2 ^= h1, h3 ^= h1, h4 ^= h1;
  return [h1>>>0, h2>>>0, h3>>>0, h4>>>0];
}

export function generateRandomVIN() {
  const chars = "ABCDEFGHJKLMNPRSTUVWXYZ0123456789";
  let vin = "ZFF"; // Example WMI for Ferrari

  // Generate VDS (Vehicle Descriptor Section)
  for (let i = 0; i < 6; i++) {
    vin += chars.charAt(Math.floor(Math.random() * chars.length));
  }

  // Generate VIS (Vehicle Identifier Section)
  for (let i = 0; i < 8; i++) {
    vin += chars.charAt(Math.floor(Math.random() * chars.length));
  }

  return vin;
}

export function generateRandomLicensePlate(seed: string) {
  const first = "ABCDEFGHJKLMNPRSTUVWXYZ";
  const second = "0123456789"
  let plate = "";

  var rand = cyrb128(seed);

  // Generate VDS (Vehicle Descriptor Section)
  for (let i = 0; i < 3; i++) {
    plate += first.charAt(rand[i] % first.length);
  }

  // Generate VIS (Vehicle Identifier Section)
  for (let i = 0; i < 3; i++) {
    plate += second.charAt(rand[i] % second.length);
  }

  return plate;
}
