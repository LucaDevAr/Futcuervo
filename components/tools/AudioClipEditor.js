"use client";

import { useState, useRef, useEffect } from "react";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { Play, Pause, Save } from "lucide-react";
import { toast } from "sonner";

export default function AudioClipEditor({
  audioUrl,
  gameId,
  initialClipStart = 0,
  initialClipEnd = 10,
  duration = 0,
  onSave,
}) {
  const [clipStart, setClipStart] = useState(initialClipStart);
  const [clipEnd, setClipEnd] = useState(initialClipEnd);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [audioDuration, setAudioDuration] = useState(duration);
  const [loading, setLoading] = useState(false);

  const audioRef = useRef < HTMLAudioElement > null;
  const animationRef = useRef();

  // Constante para la duración fija del clip
  const CLIP_DURATION = 10; // 10 segundos exactamente

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleLoadedMetadata = () => {
      setAudioDuration(audio.duration);

      // Si los valores iniciales no son válidos o no mantienen la duración de 10s
      if (initialClipEnd - initialClipStart !== CLIP_DURATION) {
        // Establecer valores predeterminados que respeten la duración de 10s
        if (initialClipStart + CLIP_DURATION <= audio.duration) {
          setClipEnd(initialClipStart + CLIP_DURATION);
        } else {
          // Si no hay suficiente duración después del inicio, ajustar el inicio
          const newStart = Math.max(0, audio.duration - CLIP_DURATION);
          setClipStart(newStart);
          setClipEnd(Math.min(audio.duration, newStart + CLIP_DURATION));
        }
      }
    };

    audio.addEventListener("loadedmetadata", handleLoadedMetadata);

    return () => {
      audio.removeEventListener("loadedmetadata", handleLoadedMetadata);
      cancelAnimationFrame(animationRef.current);
    };
  }, [initialClipStart, initialClipEnd, CLIP_DURATION]);

  const updateTimeDisplay = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);

      // Si estamos reproduciendo el clip y llegamos al final, volvemos al inicio
      if (audioRef.current.currentTime >= clipEnd) {
        audioRef.current.pause();
        setIsPlaying(false);
        cancelAnimationFrame(animationRef.current);
      } else {
        animationRef.current = requestAnimationFrame(updateTimeDisplay);
      }
    }
  };

  const handlePlayPause = () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      audio.pause();
      cancelAnimationFrame(animationRef.current);
      setIsPlaying(false);
    } else {
      audio.currentTime = clipStart;
      audio.play();
      animationRef.current = requestAnimationFrame(updateTimeDisplay);
      setIsPlaying(true);
    }
  };

  const handleRangeChange = (values) => {
    const [start, end] = values;

    // Calcular la nueva duración
    const newDuration = end - start;

    // Si la duración es diferente de 10s, ajustar el punto final
    if (Math.abs(newDuration - CLIP_DURATION) > 0.1) {
      // Si se movió el punto de inicio, ajustar el punto final
      if (start !== clipStart) {
        const newEnd = start + CLIP_DURATION;
        if (newEnd <= audioDuration) {
          setClipStart(start);
          setClipEnd(newEnd);
        } else {
          // Si el nuevo final excede la duración, ajustar el inicio
          const newStart = Math.max(0, audioDuration - CLIP_DURATION);
          setClipStart(newStart);
          setClipEnd(audioDuration);
        }
      }
      // Si se movió el punto final, ajustar el punto de inicio
      else if (end !== clipEnd) {
        const newStart = end - CLIP_DURATION;
        if (newStart >= 0) {
          setClipStart(newStart);
          setClipEnd(end);
        } else {
          // Si el nuevo inicio es negativo, ajustar el final
          setClipStart(0);
          setClipEnd(CLIP_DURATION);
        }
      }
    } else {
      // Si la duración es correcta, actualizar ambos valores
      setClipStart(start);
      setClipEnd(end);
    }

    if (audioRef.current && isPlaying) {
      audioRef.current.currentTime = start;
    }
  };

  const formatTime = (time) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };

  const handleSaveClip = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/admin/song-games/${gameId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          clipStart,
          clipEnd,
        }),
      });

      if (!response.ok) {
        throw new Error("Error al guardar el clip");
      }

      toast.success("Clip guardado correctamente");
      if (onSave) onSave();
    } catch (error) {
      console.error("Error saving clip:", error);
      toast.error("Error al guardar el clip");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4 p-4 border rounded-lg">
      <h3 className="text-lg font-medium">Editor de Clip</h3>

      <div className="flex items-center justify-between">
        <span className="text-sm">
          Duración total: {formatTime(audioDuration)}
        </span>
        <span className="text-sm font-medium">
          Clip: {formatTime(clipStart)} - {formatTime(clipEnd)} (10s fijos)
        </span>
      </div>

      <div className="py-4">
        <Slider
          min={0}
          max={audioDuration || 100}
          step={0.1}
          value={[clipStart, clipEnd]}
          onValueChange={handleRangeChange}
          className="my-4"
        />

        <div className="flex justify-between text-xs text-muted-foreground">
          <span>0:00</span>
          <span>{formatTime(audioDuration)}</span>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button
            onClick={handlePlayPause}
            variant="outline"
            size="sm"
            className="w-24"
          >
            {isPlaying ? (
              <>
                <Pause className="h-4 w-4 mr-2" /> Pausa
              </>
            ) : (
              <>
                <Play className="h-4 w-4 mr-2" /> Probar
              </>
            )}
          </Button>
          <span className="text-sm">{formatTime(currentTime)}</span>
        </div>

        <Button
          onClick={handleSaveClip}
          disabled={loading}
          className="bg-[var(--azul)] hover:bg-[var(--azul-oscuro)] dark:bg-[var(--rojo)] dark:hover:bg-[var(--rojo-oscuro)]"
        >
          <Save className="h-4 w-4 mr-2" /> Guardar Clip
        </Button>
      </div>

      <div className="text-xs text-muted-foreground mt-2 bg-amber-50 dark:bg-amber-950 p-2 rounded-md border border-amber-200 dark:border-amber-800">
        <p>
          ⚠️ El clip debe tener una duración exacta de 10 segundos. Al mover un
          punto, el otro se ajustará automáticamente.
        </p>
      </div>

      <audio ref={audioRef} src={audioUrl} />
    </div>
  );
}
