
import { type GetOption, Http } from "client-ext-animevsub-helper"
import { C_URL } from "../constants"

class ExtensionError extends Error {
  constructor(message: string) {
    super(message)
    this.name = "ExtensionError"
  }
}

const noExt = () =>
  Promise.reject(
    new ExtensionError("Extension AnimeVsub Helper chưa được cài đặt hoặc kích hoạt.")
  )

export async function httpGet(
  url: string | GetOption,
  headers?: Record<string, string>
) {
  if (!Http || !Http.get) return noExt()

  const response = await Http.get(
    typeof url === "object"
      ? url
      : {
          url: url.includes("://") ? url : C_URL + url + "#animevsub-vsub",
          headers
        }
  )

  if (response.status !== 200 && response.status !== 201) {
      console.error("HTTP Get Error", response)
      throw response
  }

  return response as Omit<typeof response, "data"> & { data: string }
}

export async function httpGetBinary(
  url: string,
  headers?: Record<string, string>
) {
  if (!Http || !Http.get) return noExt()

  const response = await Http.get({
      url: url.includes("://") ? url : C_URL + url + "#animevsub-vsub",
      headers,
      responseType: 'arraybuffer'
  })

  if (response.status !== 200 && response.status !== 201) {
      console.error("HTTP Get Binary Error", response)
      throw response
  }

  // Expecting data to be ArrayBuffer
  return response.data as ArrayBuffer
}

export async function httpPost(
  url: string,
  data: Record<string, any>,
  headers?: Record<string, string>
) {
  if (!Http || !Http.post) return noExt()

  console.log("Posting to", url)

  const response = await Http.post({
    url: url.includes("://") ? url : C_URL + url + "#animevsub-vsub",
    headers,
    data
  })

  if (response.status !== 200 && response.status !== 201) {
      console.error("HTTP Post Error", response)
      throw response
  }

  return response as Omit<typeof response, "data"> & { data: string }
}

export const get = httpGet
export const post = httpPost
