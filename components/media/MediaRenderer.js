"use client";

import { useState, useEffect, useRef } from "react";
import { Music, Play, Pause, RotateCcw } from "lucide-react";

export default function MediaRenderer({
  media,
  gameType,
  autoRotate = true,
  rotationInterval = 4000,
  audioClipStart,
  audioClipEnd,
  defaultIcon: DefaultIcon,
}) {
  const [currentMediaIndex, setCurrentMediaIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playTime, setPlayTime] = useState(0);
  const [clipFinished, setClipFinished] = useState(false);

  const audioRef = useRef(null);
  const videoRef = useRef(null);
  const intervalRef = useRef(null);
  const timerRef = useRef(null);

  // Auto-rotate media
  useEffect(() => {
    if (autoRotate && media.length > 1) {
      const interval = setInterval(() => {
        setCurrentMediaIndex((prev) => (prev + 1) % media.length);
      }, rotationInterval);

      return () => clearInterval(interval);
    }
  }, [media.length, autoRotate, rotationInterval]);

  // Cleanup
  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  const getClipDuration = () => {
    if (audioClipStart !== undefined && audioClipEnd !== undefined) {
      return audioClipEnd - audioClipStart;
    }
    return 10;
  };

  const playAudio = () => {
    if (!audioRef.current) return;

    const startTime = audioClipStart || 0;
    const endTime = audioClipEnd || startTime + 10;
    const clipDuration = endTime - startTime;

    if (
      !isPlaying &&
      playTime > 0 &&
      playTime < clipDuration &&
      !clipFinished
    ) {
      audioRef.current.currentTime = startTime + playTime;
    } else {
      audioRef.current.currentTime = startTime;
      setPlayTime(0);
      setClipFinished(false);
    }

    audioRef.current.play().then(() => {
      setIsPlaying(true);

      intervalRef.current = setInterval(() => {
        if (audioRef.current) {
          const currentPosition = audioRef.current.currentTime - startTime;
          setPlayTime(currentPosition);

          if (
            currentPosition >= clipDuration ||
            audioRef.current.currentTime >= endTime
          ) {
            audioRef.current.pause();
            setIsPlaying(false);
            setPlayTime(clipDuration);
            setClipFinished(true);
            if (intervalRef.current) clearInterval(intervalRef.current);
          }
        }
      }, 100);

      timerRef.current = setTimeout(() => {
        if (audioRef.current) {
          audioRef.current.pause();
          setIsPlaying(false);
          setClipFinished(true);
        }
        if (intervalRef.current) clearInterval(intervalRef.current);
      }, (clipDuration - playTime) * 1000);
    });
  };

  const stopAudio = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      setIsPlaying(false);
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (timerRef.current) clearTimeout(timerRef.current);
    }
  };

  const resetAudio = () => {
    stopAudio();
    setPlayTime(0);
    setClipFinished(false);
    if (audioRef.current) {
      audioRef.current.currentTime = audioClipStart || 0;
    }
  };

  const getYoutubeVideoId = (url) => {
    const regExp =
      /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return match && match[2].length === 11 ? match[2] : "";
  };

  if (!media || media.length === 0) {
    return (
      <div className="flex items-center justify-center h-full">
        {DefaultIcon ? (
          <DefaultIcon className="h-32 w-32 text-[var(--azul)] dark:text-[var(--rojo)]" />
        ) : (
          <div className="h-32 w-32 bg-gray-200 dark:bg-gray-700 rounded-lg" />
        )}
      </div>
    );
  }

  const currentMedia = media[currentMediaIndex];

  const renderSingleMedia = (mediaItem) => {
    switch (mediaItem.type) {
      case "image":
        return (
          <img
            src={mediaItem.url || "/placeholder.svg?height=400&width=300"}
            alt="Game media"
            width={400}
            height={500}
            className="h-full w-auto object-contain max-h-full rounded-lg shadow-lg"
          />
        );

      case "video":
        return (
          <video
            ref={videoRef}
            src={mediaItem.url}
            className="h-full w-auto max-h-full rounded-lg shadow-lg"
            controls
            autoPlay
            muted
            loop
          />
        );

      case "youtube":
        return (
          <div className="w-full aspect-video rounded-lg overflow-hidden shadow-lg">
            <iframe
              width="100%"
              height="100%"
              src={`https://www.youtube.com/embed/${getYoutubeVideoId(
                mediaItem.url
              )}`}
              title="YouTube video player"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="w-full h-full"
            />
          </div>
        );

      case "audio":
        return (
          <div className="flex flex-col items-center justify-center space-y-6">
            <div className="w-28 lg:w-32 h-28 lg:h-32 rounded-2xl bg-[var(--azul)] dark:bg-[var(--rojo)] flex items-center justify-center shadow-2xl">
              <Music size={64} className="text-[var(--blanco)]" />
            </div>

            <div className="text-center space-y-3">
              <div className="w-40 h-2 bg-[var(--gris)] rounded-full mb-2">
                <div
                  className="h-full bg-[var(--azul)] dark:bg-[var(--rojo)] rounded-full transition-all duration-100"
                  style={{
                    width: `${(playTime / getClipDuration()) * 100}%`,
                  }}
                />
              </div>
              <p className="text-sm text-[var(--gris-oscuro)] dark:text-[var(--gris)]">
                {Math.max(0, getClipDuration() - Math.floor(playTime))}s
                restantes
              </p>

              <button
                onClick={
                  clipFinished ? resetAudio : isPlaying ? stopAudio : playAudio
                }
                className="flex items-center justify-center px-4 py-2 rounded-xl font-bold text-sm transition-all duration-200 hover:shadow-lg bg-[var(--azul)] dark:bg-[var(--rojo)] text-[var(--blanco)] hover:opacity-90 mx-auto"
              >
                {isPlaying ? (
                  <>
                    <Pause className="h-4 w-4 mr-2" /> Pausar
                  </>
                ) : clipFinished ? (
                  <>
                    <RotateCcw className="h-4 w-4 mr-2" /> Volver a reproducir
                  </>
                ) : playTime > 0 ? (
                  <>
                    <Play className="h-4 w-4 mr-2" /> Continuar
                  </>
                ) : (
                  <>
                    <Play className="h-4 w-4 mr-2" /> Reproducir
                  </>
                )}
              </button>
            </div>

            <audio ref={audioRef} src={mediaItem.url} preload="auto" />
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="relative h-full w-full flex items-center justify-center">
      {renderSingleMedia(currentMedia)}

      {media.length > 1 && (
        <div className="absolute bottom-6 left-0 right-0 flex justify-center gap-2">
          {media.map((_, index) => (
            <div
              key={index}
              className={`w-2 h-2 rounded-full ${
                index === currentMediaIndex
                  ? "bg-[var(--azul)] dark:bg-[var(--rojo)]"
                  : "bg-gray-300 dark:bg-gray-600"
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
