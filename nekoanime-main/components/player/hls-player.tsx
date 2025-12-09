"use client"

import { useEffect, useRef, useState } from "react"
import Hls from "hls.js"
import { HlsExtensionLoader } from "./hls-loader"
import { Loader2, Play, Pause, Volume2, VolumeX, Maximize, Settings } from "lucide-react"

interface HlsPlayerProps {
    src: string
    poster?: string
    onError?: (error: any) => void
    autoPlay?: boolean
}

export default function HlsPlayer({ src, poster, onError, autoPlay = false }: HlsPlayerProps) {
    const videoRef = useRef<HTMLVideoElement>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [isPlaying, setIsPlaying] = useState(false)
    const [hlsInstance, setHlsInstance] = useState<Hls | null>(null)

    useEffect(() => {
        let hls: Hls | null = null;

        if (videoRef.current) {
            if (Hls.isSupported()) {
                console.log("[HlsPlayer] Hls is supported. Initializing...")
                hls = new Hls({
                    debug: true,
                    fLoader: HlsExtensionLoader,
                    pLoader: HlsExtensionLoader,
                    xhrSetup: (xhr, url) => {
                        xhr.withCredentials = false;
                    }
                });

                hls.loadSource(src);
                hls.attachMedia(videoRef.current);

                hls.on(Hls.Events.MANIFEST_PARSED, () => {
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

                setHlsInstance(hls);

            } else if (videoRef.current.canPlayType('application/vnd.apple.mpegurl')) {
                // Native HLS support (Safari)
                console.log("[HlsPlayer] Native HLS support detected");
                videoRef.current.src = src;
                videoRef.current.addEventListener('loadedmetadata', () => {
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
            />
        </div>
    )
}
