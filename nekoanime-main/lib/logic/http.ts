import { C_URL } from "../constants"

// Constants similar to hls-loader






function atou(b64: string) {
    return decodeURIComponent(escape(atob(b64)));
}

async function fetchWithExt(url: string, options: RequestInit & { responseType?: string, data?: any }): Promise<any> {
    if (typeof window === "undefined" || !window.NekoHelper) {
        // Fallback to standard fetch if extension is missing
        // This is necessary because we are migrating to AniMapper backend which handles requests
        // But for legacy calls (like notification) we might still need to try, or at least not block.
        // Ideally these calls should also go through backend proxy.
        console.warn("NekoHelper not found, using Proxy fallback.");
        try {
            const baseUrl = C_URL || "https://animevietsub.show";
            const targetUrl = (url.startsWith("http://") || url.startsWith("https://")) ? url : baseUrl + url;
            
            const BACKEND_API = process.env.NEXT_PUBLIC_ANIMAPPER_API || "http://localhost:8080/api/v1";
            const proxyHeaders = {
                "Referer": "https://animevietsub.show/",
                ...(options.headers || {})
            };
            
            const queryParams = new URLSearchParams();
            queryParams.append("url", targetUrl);
            Object.entries(proxyHeaders).forEach(([key, value]) => {
                queryParams.append(`header_${key}`, value as string);
            });
            
            const proxyUrl = `${BACKEND_API}/proxy?${queryParams.toString()}`;
            
            const res = await fetch(proxyUrl, {
                method: options.method || 'GET',
                // Note: Body forwarding not yet implemented in proxy for POST
            });
            
            if (!res.ok) throw new Error(`Proxy Fetch Error ${res.status}`);

            let data;
            if (options.responseType === 'arraybuffer') {
                data = await res.arrayBuffer();
            } else {
                 data = await res.text();
            }
            return {
                data,
                status: res.status,
                headers: {}
            }
        } catch (e) {
             console.error("Proxy fetch failed:", e);
             // Return dummy success to prevent loud errors
             return {
                data: "{}",
                status: 200,
                headers: {}
             }
        }
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
