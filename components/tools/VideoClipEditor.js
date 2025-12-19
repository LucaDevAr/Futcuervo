"use client";

import { useState } from "react";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { Play, Pause, Save } from "lucide-react";
import { toast } from "sonner";
import CustomVideoPlayer from "@/components/media/CustomVideoPlayer";

export default function VideoClipEditor({
  videoId,
  gameId,
  initialClipStart = 0,
  initialClipEnd = 10,
  initialAnswerStart = 0,
  initialAnswerEnd = 20,
  onSave,
}) {
  const [clipStart, setClipStart] = useState(initialClipStart);
  const [clipEnd, setClipEnd] = useState(initialClipEnd);
  const [answerStart, setAnswerStart] = useState(initialAnswerStart ?? 0);
  const [answerEnd, setAnswerEnd] = useState(initialAnswerEnd ?? 20);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playMode, setPlayMode] = useState("clip");
  const [loading, setLoading] = useState(false);

  const handleClipRangeChange = (values) => {
    const [start, end] = values;
    setClipStart(start);
    setClipEnd(end);
  };

  const handleAnswerRangeChange = (values) => {
    const [start, end] = values;
    setAnswerStart(start);
    setAnswerEnd(end);
  };

  const formatTime = (time) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };

  const handlePlayPause = (mode) => {
    setPlayMode(mode);
    setIsPlaying(!isPlaying);
  };

  const handleVideoEnded = () => setIsPlaying(false);

  const handleSaveClip = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BASE_URL}/api/admin/video-games/${gameId}`,
        {
          method: "PATCH",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            clipStart,
            clipEnd,
            answerStart,
            answerEnd,
          }),
        }
      );

      if (!response.ok) throw new Error("Error al guardar el clip");

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
    <div className="space-y-4 p-4 border rounded-lg bg-white dark:bg-neutral-900 dark:border-neutral-800 transition-colors">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
        Editor de Clip de Video
      </h3>

      <div className="aspect-video w-full bg-black rounded-lg overflow-hidden">
        {isPlaying ? (
          <CustomVideoPlayer
            videoId={videoId}
            startTime={playMode === "clip" ? clipStart : answerStart}
            endTime={playMode === "clip" ? clipEnd : answerEnd}
            autoplay={true}
            onEnded={handleVideoEnded}
            className="w-full h-full"
            showControls={true}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gray-900 text-white">
            <p>Presiona Play para previsualizar</p>
          </div>
        )}
      </div>

      <div className="space-y-6">
        {/* 🎬 CLIP (pregunta) */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-blue-600 dark:text-[var(--primary)]">
              Clip (Pregunta)
            </span>
            <span className="text-sm text-gray-700 dark:text-gray-300">
              {formatTime(clipStart)} - {formatTime(clipEnd)} (
              {(clipEnd - clipStart).toFixed(1)}s)
            </span>
          </div>

          <Slider
            min={0}
            max={100}
            step={0.1}
            value={[clipStart, clipEnd]}
            onValueChange={handleClipRangeChange}
            className="[&_[role=slider]]:bg-[var(--primary)] [&_[role=slider]]:border-[var(--primary)] [&_[role=slider]]:hover:bg-blue-600 dark:[&_[role=slider]]:bg-[var(--primary)] dark:[&_[role=slider]]:hover:bg-[var(--primary)]"
          />

          <Button
            onClick={() => handlePlayPause("clip")}
            variant="outline"
            size="sm"
            className="w-24 border-[var(--primary)] text-blue-600 dark:border-[var(--primary)] dark:text-[var(--primary)] hover:bg-blue-50 dark:hover:bg-blue-900/30"
            disabled={isPlaying && playMode !== "clip"}
          >
            {isPlaying && playMode === "clip" ? (
              <>
                <Pause className="h-4 w-4 mr-2" /> Pausa
              </>
            ) : (
              <>
                <Play className="h-4 w-4 mr-2" /> Probar
              </>
            )}
          </Button>
        </div>

        {/* 🎯 RESPUESTA */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-red-600 dark:text-[var(--primary)]">
              Respuesta
            </span>
            <span className="text-sm text-gray-700 dark:text-gray-300">
              {formatTime(answerStart)} - {formatTime(answerEnd)} (
              {(answerEnd - answerStart).toFixed(1)}s)
            </span>
          </div>

          <Slider
            min={0}
            max={100}
            step={0.1}
            value={[answerStart, answerEnd]} // 👈 solo value, sin defaultValue
            onValueChange={handleAnswerRangeChange}
            className="[&_[role=slider]]:bg-[var(--primary)] 
             [&_[role=slider]]:border-[var(--primary)] 
             [&_[role=slider]]:hover:bg-red-600 
             dark:[&_[role=slider]]:bg-[var(--primary)] 
             dark:[&_[role=slider]]:hover:bg-[var(--primary)]"
          />

          <Button
            onClick={() => handlePlayPause("answer")}
            variant="outline"
            size="sm"
            className="w-24 border-[var(--primary)] text-red-600 dark:border-[var(--primary)] dark:text-[var(--primary)] hover:bg-red-50 dark:hover:bg-red-900/30"
            disabled={isPlaying && playMode !== "answer"}
          >
            {isPlaying && playMode === "answer" ? (
              <>
                <Pause className="h-4 w-4 mr-2" /> Pausa
              </>
            ) : (
              <>
                <Play className="h-4 w-4 mr-2" /> Probar
              </>
            )}
          </Button>
        </div>
      </div>

      <div className="flex justify-end">
        <Button
          onClick={handleSaveClip}
          disabled={loading}
          className="bg-[var(--azul)] hover:bg-[var(--azul-oscuro)] dark:bg-[var(--rojo)] dark:hover:bg-[var(--rojo-oscuro)] text-white"
        >
          <Save className="h-4 w-4 mr-2" /> Guardar Configuración
        </Button>
      </div>
    </div>
  );
}
