
import { animapperClient } from "@/lib/animapper-client"

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

export async function getPlayerLink(config: {
  id: string
  play: string
  hash: string
}): Promise<PlayerLinkReturn> {
  const { id } = config

  try {
      const source = await animapperClient.getStreamSource(id)
      
      return {
          playTech: "api",
          link: [{
              file: source.url,
              label: "HD",
              type: source.type === "HLS" ? "hls" : "mp4",
              preload: "auto",
              qualityCode: 720
          }]
      }
  } catch (e) {
      console.error("Player Link Error", e)
      throw new Error("Failed to get stream source")
  }
}
