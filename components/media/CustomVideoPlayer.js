"use client";

import { useEffect, useRef, useState } from "react";
import { Loader2, Play, Pause, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function CustomVideoPlayer({
  videoId, // ID del video en Mongo
  startTime = 0,
  endTime,
  onEnded,
  autoplay = false,
  className = "",
  showControls = true,
  allowReplay = true,
}) {
  const videoRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(autoplay);
  const [hasEnded, setHasEnded] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [videoUrl, setVideoUrl] = useState(null);
  const [fetchError, setFetchError] = useState(false);
  const intervalRef = useRef(null);

  // 🔄 Obtener videoUrl desde el ID
  useEffect(() => {
    const fetchVideoUrl = async () => {
      setIsLoading(true);
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_BASE_URL}/api/videos/${videoId}`
        );

        if (!res.ok) throw new Error("Error al obtener el video");

        const data = await res.json();
        const url = data?.video?.videoUrl || data?.videoUrl;

        if (!url) throw new Error("URL no encontrada");

        setVideoUrl(url);
        setFetchError(false);
      } catch (err) {
        console.error(err);
        setFetchError(true);
      } finally {
        setIsLoading(false);
      }
    };

    fetchVideoUrl();
  }, [videoId]);

  // 🎬 Control de reproducción y corte en endTime
  useEffect(() => {
    const video = videoRef.current;
    if (!video || !videoUrl) return;

    const handleLoaded = () => {
      video.currentTime = startTime;
      if (autoplay) {
        video.play();
        setIsPlaying(true);
      }
    };

    const handleEnded = () => {
      setHasEnded(true);
      setIsPlaying(false);
      if (onEnded) onEnded();
    };

    const checkTime = () => {
      if (endTime && video.currentTime >= endTime) {
        video.pause();
        handleEnded();
      }
    };

    video.addEventListener("loadeddata", handleLoaded);
    video.addEventListener("ended", handleEnded);

    if (endTime) {
      intervalRef.current = setInterval(checkTime, 100);
    }

    return () => {
      video.removeEventListener("loadeddata", handleLoaded);
      video.removeEventListener("ended", handleEnded);
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [videoUrl, startTime, endTime, autoplay, onEnded]);

  const playVideo = () => {
    videoRef.current?.play();
    setIsPlaying(true);
  };

  const pauseVideo = () => {
    videoRef.current?.pause();
    setIsPlaying(false);
  };

  const replayVideo = () => {
    if (videoRef.current) {
      videoRef.current.currentTime = startTime;
      videoRef.current.play();
      setIsPlaying(true);
      setHasEnded(false);
    }
  };

  return (
    <div className={`relative ${className}`}>
      {fetchError ? (
        <div className="flex items-center justify-center h-full text-white text-sm p-4 rounded-md">
          Error al cargar el video
        </div>
      ) : (
        <>
          {videoUrl && (
            <video
              ref={videoRef}
              src={videoUrl}
              className="w-full h-full object-cover rounded-md"
              playsInline
              controls={false}
            />
          )}

          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-opacity-50 z-10">
              <Loader2 className="w-8 h-8 animate-spin text-white" />
            </div>
          )}

          {showControls && videoUrl && (
            <div className="absolute -bottom-12 left-0 right-0 flex justify-center z-10">
              <Button
                onClick={isPlaying ? pauseVideo : playVideo}
                variant="secondary"
                size="sm"
                className="bg-[var(--azul)] dark:bg-[var(--rojo)] bg-opacity-70 text-white hover:bg-opacity-90"
              >
                {isPlaying ? (
                  <>
                    <Pause className="h-4 w-4 mr-1" /> Pausar
                  </>
                ) : (
                  <>
                    <Play className="h-4 w-4 mr-1" /> Reproducir
                  </>
                )}
              </Button>
            </div>
          )}

          {hasEnded && allowReplay && (
            <div className="absolute -bottom-12 left-0 right-0 flex justify-center z-10">
              <Button
                onClick={replayVideo}
                className="flex items-center gap-2 px-4 py-2 bg-[var(--azul)] dark:bg-[var(--rojo)] text-white rounded-md hover:opacity-90"
              >
                <RotateCcw className="h-4 w-4" />
                Volver a ver
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
