
import { httpGet } from "./http"

// Simple base64 to arraybuffer if needed, though most browsers support it.
// We can use a simpler implementation or just rely on the API returning what we need.
// For the scraping part (HTML), we usually just need text.
// The original fetchJava handled binary for HLS/Images.
// We might not need full implementation yet, but here is a compatible text fetcher.

export async function fetchJava(
  url: string,
  options?: {
    headers?: Headers
    signal?: AbortSignal
  }
) {
    // Convert Headers object to Record<string, string>
    const headerObj: Record<string, string> = {}
    options?.headers?.forEach((value, key) => {
        headerObj[key] = value
    })

  const res = await httpGet(url, headerObj)

  if (options?.signal?.aborted) throw new Error("ABORTED")

  return {
    async text() {
      return res.data // httpGet already returns data as string for text text requests usually
    },
    get headers() {
      return new Headers(res.headers)
    },
    url: res.url
  }
}
