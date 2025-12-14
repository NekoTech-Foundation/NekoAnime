

interface LoaderContext {
    url: string;
    responseType?: string;
    frag?: { url: string; [key: string]: unknown }; // Hls.js Fragment
}

interface LoaderConfig {
    retryDelay: number;
    // Add other known config properties if needed
}

interface LoaderStats {
    trequest: number;
    retry: number;
    tfirst: number;
    tload: number;
    loaded: number;
    total: number;
    chunkCount: number;
    bwEstimate: number;
    loading: { start: number; first: number; end: number };
    buffering: { start: number; first: number; end: number };
    parsing: { start: number; end: number };
    aborted: boolean;
}

interface LoaderCallbacks {
    onSuccess: (response: { url: string; data: ArrayBuffer | string }, stats: LoaderStats, context: LoaderContext) => void;
    onError: (error: Error | { code: number; text: string } | any, context?: any, networkDetails?: any) => void;
    onTimeout: (stats: LoaderStats, context: LoaderContext, networkDetails: unknown) => void;
    onProgress: (stats: LoaderStats, context: LoaderContext, data: ArrayBuffer | string, networkDetails: unknown) => void;
}





export class HlsExtensionLoader {
    context: LoaderContext | null;
    config: LoaderConfig | null;
    stats: LoaderStats;
    callbacks: LoaderCallbacks | null;
    retryTimeout: ReturnType<typeof setTimeout> | null; // Timer ID
    retryDelay: number;

    constructor(config: any) {
        console.log("%c[HlsExtensionLoader] CONSTRUCTOR CALLED", "background: purple; color: white; font-size: 14px;");
        this.context = null;
        this.config = config;
        this.callbacks = null;
        // Initialize default stats to prevent undefined access
        this.stats = {
             trequest: performance.now(),
             retry: 0,
             tfirst: 0,
             tload: 0,
             loaded: 0,
             total: 0,
             chunkCount: 0,
             bwEstimate: 0,
             loading: { start: performance.now(), first: 0, end: 0 },
             buffering: { start: 0, first: 0, end: 0 },
             parsing: { start: 0, end: 0 },
             aborted: false
        };
        this.retryDelay = 0;
        this.retryTimeout = null;
    }

    load(context: LoaderContext, config: LoaderConfig, callbacks: LoaderCallbacks) {
        this.context = context;
        this.config = config;
        this.callbacks = callbacks;
        this.stats = {
             trequest: performance.now(),
             retry: 0,
             tfirst: 0,
             tload: 0,
             loaded: 0,
             total: 0,
             chunkCount: 0,
             bwEstimate: 0,
             loading: { start: performance.now(), first: 0, end: 0 },
             buffering: { start: 0, first: 0, end: 0 },
             parsing: { start: 0, end: 0 },
             aborted: false
        };
        this.retryDelay = config.retryDelay;

        this._loadInternal(this.stats);
    }

    async _loadInternal(stats: LoaderStats) {
        if (!this.context) return;
        const url = this.context.url;

        try {
            // 1. Handle Blob URLs natively (bypass extension)
            if (url.startsWith('blob:')) {
                console.log("[HlsLoader] Fetching Blob internally:", url);
                const response = await fetch(url);
                if (!response.ok) throw new Error(`Blob Fetch Error ${response.status}`);
                const blob = await response.blob();
                const buffer = await blob.arrayBuffer();
                
                stats.tload = performance.now();
                stats.loaded = buffer.byteLength;
                stats.total = buffer.byteLength;
                stats.loading.end = performance.now();

                let data: ArrayBuffer | string = buffer;
                 // If HLS.js expects text (playlist), decode it
                 // Check context.responseType OR if it is a manifest/level/playlist request
                if (this.context.responseType === 'text') {
                    data = new TextDecoder().decode(buffer);
                } else if (!this.context.responseType && !this.context.frag) {
                    // Fallback: If no responseType and NOT a fragment, likely a manifest
                    data = new TextDecoder().decode(buffer);
                }

                if (this.callbacks && this.context) {
                    this.callbacks.onSuccess({ url: url, data: data }, stats, this.context);
                }
                return;
            }

            // 2. Fetch via Extension or Fallback
            // Wait for NekoHelper to be valid (max 1 second)
            let attempts = 0;
            // Only wait if we haven't confirmed it's missing yet (optimization could be added here)
            while (typeof window.NekoHelper === 'undefined' && attempts < 10) {
                if (attempts === 0) console.log("[HlsLoader] Checking for Extension...");
                await new Promise(resolve => setTimeout(resolve, 100)); // 100ms wait
                attempts++;
            }

            if (typeof window.NekoHelper === 'undefined') {
                 console.log("[HlsLoader] NekoHelper Extension not found. Falling back to Proxy fetch.");
                 // Fallback to proxy fetch
                 const BACKEND_API = process.env.NEXT_PUBLIC_ANIMAPPER_API || "http://localhost:8080/api/v1";
                 const params = new URLSearchParams();
                 params.append("url", url);
                 params.append("header_Referer", "https://animevietsub.show/");
                 
                 const proxyUrl = `${BACKEND_API}/proxy?${params.toString()}`;
                 const response = await fetch(proxyUrl);
                 if (!response.ok) throw new Error(`Fetch Error ${response.status}`);
                 
                 // Handle response data
                 const buffer = await response.arrayBuffer();
                 
                 stats.tload = performance.now();
                 stats.loaded = buffer.byteLength;
                 stats.total = buffer.byteLength;
                 stats.loading.end = performance.now();

                 let data: ArrayBuffer | string = buffer;
                 
                 // Check context.responseType OR if it is a manifest/level/playlist request
                 if (this.context.responseType === 'text') {
                     data = new TextDecoder().decode(buffer);
                 } else if (!this.context.responseType && !this.context.frag) {
                     // Fallback: If no responseType and NOT a fragment, likely a manifest
                     data = new TextDecoder().decode(buffer);
                 }

                 if (this.callbacks && this.context) {
                     this.callbacks.onSuccess({ url: url, data: data }, stats, this.context);
                 }
                 return;
            }

            console.log("[HlsLoader] Fetching via NekoHelper:", url);
            
            stats.tfirst = performance.now();
            stats.loading.first = performance.now();

            const response = await window.NekoHelper.fetch(url, {
                headers: {
                     "Referer": "https://animevietsub.show/"
                }
            });

            console.log("[HlsLoader] Response received:", response ? "YES" : "NO", response?.status);

            if (!response) throw new Error("No response from extension");
            if (!response.success) {
                console.error("[HlsLoader] Extension-side Error:", response.error);
                throw new Error(response.error || "Extension fetch failed");
            }
            if (response.status >= 400) {
                 throw new Error(`HTTP Error ${response.status}`);
            }
            if (!response.data) throw new Error("No data received in response");

            // Decode Base64 Data URL back to ArrayBuffer
            // Expected: data:application/octet-stream;base64,......
            const parts = response.data.split(',');
            if (parts.length < 2) {
                 console.error("[HlsLoader] Invalid Data URI:", response.data.substring(0, 50));
                 throw new Error("Invalid Data URI received");
            }
            const base64Part = parts[1];
            const binaryString = atob(base64Part);
            const len = binaryString.length;
            const bytes = new Uint8Array(len);
            for (let i = 0; i < len; i++) {
                bytes[i] = binaryString.charCodeAt(i);
            }

            stats.tload = performance.now();
            stats.loaded = bytes.byteLength;
            stats.total = bytes.byteLength;
            stats.loading.end = performance.now();

            let data: ArrayBuffer | string = bytes.buffer;
            
            // Critical Check: Determine if text decoding is actually needed.
            // Segments (frag present) MUST remain ArrayBuffer (binary).
            // Manifests (no frag) should be text.
            const isFragment = !!this.context.frag;
            const expectsText = this.context.responseType === 'text';
            
            console.log(`[HlsLoader] Processing Response. IsFrag: ${isFragment}, ExpectsText: ${expectsText}, Url: ${url}`);

            if (expectsText || (!this.context.responseType && !isFragment)) {
                 console.log("[HlsLoader] Decoding to text");
                 data = new TextDecoder().decode(bytes);
            }

            if (this.callbacks && this.context) {
                this.callbacks.onSuccess({
                    url: response.url || url,
                    data: data
                }, stats, this.context);
            }

        } catch (error: unknown) {
            console.error("[HlsLoader] Error:", error);
            const err = error instanceof Error ? error : new Error(String(error));

            if (this.callbacks && this.context) {
                this.callbacks.onError({
                    type: 'networkError', // Hls.js ErrorType.NETWORK_ERROR
                    details: 'fragLoadError', // Hls.js ErrorDetails.FRAG_LOAD_ERROR
                    fatal: false,
                    url: url,
                    status: 404, // Default to 404 for handling generic extension errors
                    statusText: "Fetch Failed",
                    networkDetails: {
                        status: 404,
                        url: url
                    },
                    reason: err.message || "Fetch Error"
                }, this.context, null);
            }
        }
    }

    abort() {
        // No-op for now
    }

    destroy() {
        this.callbacks = null;
    }
}
