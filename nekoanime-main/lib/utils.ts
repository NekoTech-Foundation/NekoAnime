
import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getProxiedImageUrl(url: string | undefined): string {
    if (!url) return "";
    if (url.startsWith("blob:") || url.startsWith("data:")) return url;
    
    // Check if it's already an absolute URL. If relative, Next/Image handles it usually, but these are external.
    if (!url.startsWith("http")) return url;

    // Use backend proxy
    const BACKEND_API = process.env.NEXT_PUBLIC_ANIMAPPER_API || "http://localhost:8080/api/v1";
    // We only need simple proxy for images, usually standard GET is fine if headers are forwarded?
    // Actually, for images we need to pass Referer.
    // Our /proxy endpoint takes url and headers params.
    
    const headers = {
        "Referer": "https://animevietsub.show/"
    };
    
    // Construct the proxy URL
    // Use URLSearchParams for easier construction
    const params = new URLSearchParams();
    params.append("url", url);
    Object.entries(headers).forEach(([key, value]) => {
        params.append(`header_${key}`, value);
    });

    return `${BACKEND_API}/proxy?${params.toString()}`;
}
