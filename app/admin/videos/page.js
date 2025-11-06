"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Plus,
  Pencil,
  Trash2,
  Save,
  X,
  Video,
  ExternalLink,
  Loader2,
  Search,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";

export default function AdminVideosPage() {
  const router = useRouter();
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [openModal, setOpenModal] = useState(false);
  const [currentVideo, setCurrentVideo] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [previewVideoId, setPreviewVideoId] = useState(null);

  useEffect(() => {
    fetchVideos();
  }, []);

  const fetchVideos = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/videos");
      if (!res.ok) throw new Error("Failed to fetch videos");
      const data = await res.json();
      setVideos(data);
    } catch (error) {
      console.error("Error fetching videos:", error);
      toast.error("Error al cargar los videos");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateNew = () => {
    setCurrentVideo({
      title: "",
      videoUrl: "",
    });
    setIsEditing(false);
    setOpenModal(true);
  };

  const handleEditVideo = (video) => {
    setCurrentVideo(video);
    setIsEditing(true);
    setOpenModal(true);
    setPreviewVideoId(video.videoId);
  };

  const handleDeleteVideo = async (id) => {
    if (!confirm("¿Estás seguro de que deseas eliminar este video?")) return;

    try {
      const res = await fetch(`/api/videos/${id}`, {
        method: "DELETE",
      });

      if (!res.ok) throw new Error("Failed to delete video");

      toast.success("Video eliminado correctamente");
      fetchVideos();
    } catch (error) {
      console.error("Error deleting video:", error);
      toast.error("Error al eliminar el video");
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCurrentVideo((prev) => (prev ? { ...prev, [name]: value } : null));
  };

  const extractYouTubeId = (url) => {
    const regExp =
      /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return match && match[2].length === 11 ? match[2] : null;
  };

  const handleVideoUrlChange = (e) => {
    const { value } = e.target;
    setCurrentVideo((prev) => (prev ? { ...prev, videoUrl: value } : null));

    // Extract video ID for preview
    const videoId = extractYouTubeId(value);
    setPreviewVideoId(videoId);
  };

  const validateForm = () => {
    if (!currentVideo) return false;

    if (!currentVideo.title?.trim()) {
      toast.error("El título es obligatorio");
      return false;
    }

    if (!currentVideo.videoUrl?.trim()) {
      toast.error("La URL del video es obligatoria");
      return false;
    }

    const videoId = extractYouTubeId(currentVideo.videoUrl);
    if (!videoId) {
      toast.error("La URL del video no es válida");
      return false;
    }

    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      const videoId = extractYouTubeId(currentVideo.videoUrl);
      const payload = {
        ...currentVideo,
        videoId,
      };

      const url = isEditing ? `/api/videos/${currentVideo._id}` : "/api/videos";
      const method = isEditing ? "PATCH" : "POST";

      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Error al guardar el video");
      }

      toast.success(
        `Video ${isEditing ? "actualizado" : "creado"} correctamente`
      );
      setOpenModal(false);
      fetchVideos();
    } catch (error) {
      console.error("Error saving video:", error);
      toast.error(
        error instanceof Error ? error.message : "Error al guardar el video"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredVideos = videos.filter((video) =>
    video.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="h-screen flex flex-col p-4 md:p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">🎬 Administrar Videos</h1>
        <Button
          onClick={handleCreateNew}
          className="bg-[var(--azul)] hover:bg-[var(--azul-oscuro)] dark:bg-[var(--rojo)] dark:hover:bg-[var(--rojo-oscuro)]"
        >
          <Plus className="h-4 w-4 mr-2" /> Nuevo Video
        </Button>
      </div>

      <div className="mb-4">
        <div className="relative">
          <Search
            className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
            size={18}
          />
          <Input
            placeholder="Buscar videos..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center flex-1">
          <Loader2 className="h-8 w-8 animate-spin text-[var(--azul)] dark:text-[var(--rojo)]" />
        </div>
      ) : filteredVideos.length === 0 ? (
        <div className="flex flex-col items-center justify-center flex-1 text-center">
          <Video className="h-16 w-16 text-gray-400 mb-4" />
          <h2 className="text-xl font-medium mb-2">No hay videos</h2>
          <p className="text-gray-500 mb-4">
            {searchTerm
              ? "No se encontraron videos con ese término"
              : "Añade tu primer video para empezar"}
          </p>
          {searchTerm && (
            <Button variant="outline" onClick={() => setSearchTerm("")}>
              Limpiar búsqueda
            </Button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 overflow-y-auto pb-4">
          {filteredVideos.map((video) => (
            <Card key={video._id} className="overflow-hidden">
              <div className="aspect-video bg-gray-100 dark:bg-gray-800 relative">
                {video.thumbnailUrl ? (
                  <img
                    src={video.thumbnailUrl || "/placeholder.svg"}
                    alt={video.title}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Video className="h-12 w-12 text-gray-400" />
                  </div>
                )}
                <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center">
                  <a
                    href={`https://www.youtube.com/watch?v=${video.videoId}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 bg-white rounded-full mr-2"
                  >
                    <ExternalLink className="h-5 w-5 text-black" />
                  </a>
                </div>
              </div>
              <CardHeader className="p-4">
                <CardTitle className="text-lg line-clamp-1">
                  {video.title}
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 pt-0">
                <div className="flex justify-between items-center">
                  <div className="text-xs text-gray-500">
                    {new Date(video.createdAt).toLocaleDateString()}
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEditVideo(video)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDeleteVideo(video._id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Create/Edit Video Modal */}
      <Dialog open={openModal} onOpenChange={setOpenModal}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>
              {isEditing ? "Editar Video" : "Nuevo Video"}
            </DialogTitle>
          </DialogHeader>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Left Column - Form */}
            <div className="space-y-4">
              <div>
                <label
                  htmlFor="title"
                  className="block text-sm font-medium mb-1"
                >
                  Título *
                </label>
                <Input
                  id="title"
                  name="title"
                  value={currentVideo?.title || ""}
                  onChange={handleInputChange}
                  placeholder="Título del video"
                  required
                />
              </div>

              <div>
                <label
                  htmlFor="videoUrl"
                  className="block text-sm font-medium mb-1"
                >
                  URL de YouTube *
                </label>
                <Input
                  id="videoUrl"
                  name="videoUrl"
                  value={currentVideo?.videoUrl || ""}
                  onChange={handleVideoUrlChange}
                  placeholder="https://www.youtube.com/watch?v=..."
                  required
                />
              </div>
            </div>

            {/* Right Column - Preview */}
            <div className="space-y-4">
              <div className="aspect-video bg-gray-100 dark:bg-gray-800 rounded-lg overflow-hidden">
                {previewVideoId ? (
                  <iframe
                    src={`https://www.youtube.com/embed/${previewVideoId}`}
                    className="w-full h-full"
                    allowFullScreen
                  ></iframe>
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <p className="text-gray-500">Vista previa del video</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-2 mt-4">
            <Button variant="outline" onClick={() => setOpenModal(false)}>
              <X className="h-4 w-4 mr-2" /> Cancelar
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="bg-[var(--azul)] hover:bg-[var(--azul-oscuro)] dark:bg-[var(--rojo)] dark:hover:bg-[var(--rojo-oscuro)]"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" /> Guardando...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" /> Guardar
                </>
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
