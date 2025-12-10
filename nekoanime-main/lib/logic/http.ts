import { C_URL } from "../constants"

// Constants similar to hls-loader




class ExtensionError extends Error {
  constructor(message: string) {
    super(message)
    this.name = "ExtensionError"
  }
}

const noExt = () =>
  Promise.reject(
    new ExtensionError("Vui lòng tải lại trang hoặc kiểm tra extension NekoHelper.")
  )

function atou(b64: string) {
    return decodeURIComponent(escape(atob(b64)));
}

async function fetchWithExt(url: string, options: any): Promise<any> {
    if (typeof window === "undefined" || !window.NekoHelper) {
        return noExt();
    }

    const baseUrl = C_URL || "https://animevietsub.show";
    if (!C_URL) {
        console.warn("C_URL is undefined! Using fallback:", baseUrl);
    }

    const fullUrl = (url.startsWith("http://") || url.startsWith("https://")) ? url : baseUrl + url;
    
    console.log("[http] Fetching:", { url, fullUrl, baseUrl });

    // Add default headers if needed, but extension DNR handles Referer/Origin
    const finalOptions = { ...options };

    const res = await window.NekoHelper.fetch(fullUrl, finalOptions);

    if (!res.success) {
        throw new Error(res.error || "Extension Fetch Failed");
    }

    // Decode Data
    // Expect data is Base64 string from background
    let rawData = "";
    if (res.data) {
        // "data:application/octet-stream;base64,..." or just base64?
        // Background `blobToBase64` returns Data URL: "data:<mime>;base64,<data>"
        const parts = res.data.split(',');
        const b64 = parts.length > 1 ? parts[1] : res.data;
        
        if (options.responseType === 'arraybuffer') {
             const binaryString = atob(b64);
             const len = binaryString.length;
             const bytes = new Uint8Array(len);
             for (let i = 0; i < len; i++) {
                bytes[i] = binaryString.charCodeAt(i);
             }
             rawData = bytes.buffer as any;
        } else {
             // Text decode
             rawData = atou(b64);
        }
    }

    return {
        data: rawData,
        status: res.status,
        headers: res.headers
    };
}

export async function httpGet(
  url: string,
  headers?: Record<string, string>
) {
  const response = await fetchWithExt(
      url,
      {
          method: 'GET',
          headers
      }
  );

  if (response.status !== 200 && response.status !== 201) {
      console.error("HTTP Get Error", response)
      throw response
  }

  return response;
}

export async function httpGetBinary(
  url: string,
  headers?: Record<string, string>
) {
  const response = await fetchWithExt(url, {
      method: "GET",
      headers,
      responseType: 'arraybuffer'
  })

  if (response.status !== 200 && response.status !== 201) {
      console.error("HTTP Get Binary Error", response)
      throw response
  }

  return response.data as ArrayBuffer
}

export async function httpPost(
  url: string,
  data: Record<string, any>,
  headers?: Record<string, string>
) {
  console.log("Posting to", url)
  
  const body = (headers?.["Content-Type"] === "application/x-www-form-urlencoded" && typeof data === "object") 
      ? new URLSearchParams(data).toString() 
      : JSON.stringify(data); // Default to JSON if not form? Or just data? fetch handles string body.

  const response = await fetchWithExt(url, {
      method: 'POST',
      headers,
      data: body
  })

  if (response.status !== 200 && response.status !== 201) {
      console.error("HTTP Post Error", response)
      throw response
  }

  return response;
}

export const get = httpGet
export const post = httpPost
