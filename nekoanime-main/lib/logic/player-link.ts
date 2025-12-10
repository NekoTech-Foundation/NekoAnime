
import { httpPost } from "@/lib/logic/http"
import { init, decryptM3u8 } from "@/lib/logic/dha/index"

// Basic type definitions
export type QualityCode = number;

export interface PlayerLinkReturn {
  link: {
    file: string
    label: string
    type: string
    preload?: string
    qualityCode?: number
  }[]
  playTech: "api" | "trailer"
}

const addProtocolUrl = (file: string) =>
  file.startsWith("http") ? file : `https:${file}`

function getQualityByLabel(label: string) {
    if (!label) return 0
    if (label.includes("1080")) return 1080
    if (label.includes("720")) return 720
    if (label.includes("480")) return 480
    if (label.includes("360")) return 360
    return 0
}

export async function getPlayerLink(config: {
  id: string
  play: string
  hash: string
}): Promise<PlayerLinkReturn> {
  const { id, play, hash: link } = config

  const response = await httpPost("/ajax/player?v=2019a", {
      id,
      play,
      link,
      backuplinks: "1"
  }, {
      "Content-Type": "application/x-www-form-urlencoded"
  })

  // Debug raw response
  console.log("[PlayerLink] Response Data:", response.data)

  let configData: PlayerLinkReturn;
  try {
      configData = JSON.parse(response.data)
  } catch(e: unknown) {
      throw new Error(`Failed to parse player config: ${e instanceof Error ? e.message : 'Unknown'}`)
  }

  if (!configData.link) {
      throw new Error("Server not found or invalid link")
  }

  await Promise.all(
    configData.link.map(async (item) => {
        if (item.file.includes("://")) {
            item.file = addProtocolUrl(item.file)
        } else {
            // Decrypt Logic
            await init()
             // item.file is encrypted string
             const decrypted = await decryptM3u8(item.file)
             console.log("[PlayerLink] Decrypted (first 100 chars):", decrypted.substring(0, 100))

             // Check content for debug
             const lines = decrypted.split('\n')
             const entries = lines.filter((l: string) => !l.startsWith('#') && l.trim().length > 0)
             console.log("[PlayerLink] Manifest Entries (First 5):", entries.slice(0, 5))

             // Disable Proxy Rewrite - Let HlsExtensionLoader handle the original URLs
             /*
             const origin = typeof window !== 'undefined' ? window.location.origin : ''
             const proxiedLines = lines.map((line: string) => {
                 if (line.startsWith("http")) {
                     return `${origin}/api/proxy?url=${encodeURIComponent(line)}`
                 }
                 return line
             })
             const proxiedManifest = proxiedLines.join('\n')
             */

             // Create Blob URL from ORIGINAL decrypted content
             const blob = new Blob([decrypted], { type: "application/vnd.apple.mpegurl" })
             item.file = URL.createObjectURL(blob)

             item.label = "HD"
             item.preload = "auto"
             item.type = "hls"
        }

        // Label normalization
        if (item.label === "HD" && item.preload) item.label = "FHD|HD"
        if (!item.label) item.label = "HD"

        item.qualityCode = getQualityByLabel(item.label)
        if (!item.type) item.type = "mp4"
    })
  )

  return configData
}
