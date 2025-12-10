"use client"

import { useEffect, useRef, useState } from "react"
import Hls from "hls.js"
import { HlsExtensionLoader } from "./hls-loader"
import { Loader2 } from "lucide-react"

interface HlsPlayerProps {
    src: string
    poster?: string
    onError?: (error: unknown) => void
    autoPlay?: boolean
    onProgress?: (state: { playedSeconds: number, played: number, loaded: number, loadedSeconds: number }) => void
}

export default function HlsPlayer({ src, poster, onError, autoPlay = false, onProgress }: HlsPlayerProps) {
    const videoRef = useRef<HTMLVideoElement>(null)
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        let hls: Hls | null = null;
        let mounted = true;

        if (videoRef.current) {
            if (Hls.isSupported()) {
                console.log("[HlsPlayer] Hls is supported. Initializing...")
                hls = new Hls({
                    debug: true,
                    fLoader: HlsExtensionLoader as any,
                    pLoader: HlsExtensionLoader as any,
                    xhrSetup: (xhr) => {
                        xhr.withCredentials = false;
                    }
                });

                hls.loadSource(src);
                hls.attachMedia(videoRef.current);

                hls.on(Hls.Events.MANIFEST_PARSED, () => {
                    if (!mounted) return;
                    console.log("[HlsPlayer] Manifest Parsed");
                    setIsLoading(false);
                    if (autoPlay) {
                        videoRef.current?.play().catch(e => console.error("Autoplay failed", e));
                    }
                });

                hls.on(Hls.Events.ERROR, (event, data) => {
                    console.error("[HlsPlayer] Error:", data);
                    if (data.fatal) {
                        switch (data.type) {
                            case Hls.ErrorTypes.NETWORK_ERROR:
                                console.log("[HlsPlayer] Fatal Network Error. Trying to recover...");
                                hls?.startLoad();
                                break;
                            case Hls.ErrorTypes.MEDIA_ERROR:
                                console.log("[HlsPlayer] Fatal Media Error. Trying to recover...");
                                hls?.recoverMediaError();
                                break;
                            default:
                                console.log("[HlsPlayer] Fatal Error. Destroying...");
                                hls?.destroy();
                                if (onError) onError(data);
                                break;
                        }
                    }
                });

            } else if (videoRef.current.canPlayType('application/vnd.apple.mpegurl')) {
                // Native HLS support (Safari)
                console.log("[HlsPlayer] Native HLS support detected");
                videoRef.current.src = src;
                videoRef.current.addEventListener('loadedmetadata', () => {
                    if (!mounted) return;
                    setIsLoading(false);
                    if (autoPlay) videoRef.current?.play();
                });
                videoRef.current.addEventListener('error', (e) => {
                    console.error("[HlsPlayer] Native Error:", e);
                    if (onError) onError(e);
                });
            } else {
                console.error("[HlsPlayer] HLS not supported");
                if (onError) onError(new Error("HLS not supported"));
            }
        }

        return () => {
            mounted = false;
            if (hls) {
                hls.destroy();
            }
        };
    }, [src, autoPlay, onError]);

    // Simple custom controls or default controls
    // Using default controls for robustness first
    return (
        <div className="w-full h-full relative group bg-black">
            {isLoading && (
                 <div className="absolute inset-0 flex items-center justify-center z-10 bg-black/50">
                     <Loader2 className="w-8 h-8 text-white animate-spin" />
                 </div>
            )}
            <video
                ref={videoRef}
                className="w-full h-full object-contain"
                poster={poster}
                controls
                playsInline
                crossOrigin="anonymous"
                onTimeUpdate={() => {
                    if (videoRef.current && onProgress) {
                        const duration = videoRef.current.duration || 0
                        const currentTime = videoRef.current.currentTime
                        const buffered = videoRef.current.buffered
                        let loaded = 0
                        if (buffered.length > 0) {
                             loaded = buffered.end(buffered.length - 1)
                        }
                        
                        onProgress({
                            playedSeconds: currentTime,
                            played: duration > 0 ? currentTime / duration : 0,
                            loadedSeconds: loaded,
                            loaded: duration > 0 ? loaded / duration : 0
                        })
                    }
                }}
            />
        </div>
    )
}
