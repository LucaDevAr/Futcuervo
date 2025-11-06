"use client";

import { useEffect, useState } from "react";
import { format, addMonths, subMonths } from "date-fns";
import { es } from "date-fns/locale";
import {
  PlusCircle,
  ChevronLeft,
  ChevronRight,
  CalendarIcon,
  Trash2,
  BookOpen,
  PlusSquare,
  MinusSquare,
  ImageIcon,
  VideoIcon,
  Save,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function HistoryGameCalendarPage() {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [games, setGames] = useState([]);
  const [openModal, setOpenModal] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);
  const [topic, setTopic] = useState("");
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editingGameId, setEditingGameId] = useState(null);
  const [activeQuestionTab, setActiveQuestionTab] = useState("0");

  useEffect(() => {
    fetchGames();
  }, []);

  const fetchGames = async () => {
    try {
      const res = await fetch("/api/admin/history-games");
      if (!res.ok) throw new Error("Error al cargar los juegos");
      const data = await res.json();
      setGames(data);
    } catch (error) {
      console.error("Error fetching games:", error);
      toast.error("Error al cargar los juegos");
    }
  };

  const handleDayClick = (day) => {
    const date = new Date(
      currentMonth.getFullYear(),
      currentMonth.getMonth(),
      day
    );
    setSelectedDate(date);

    const existingGame = getGameForDay(day);
    if (existingGame) {
      setTopic(existingGame.topic);
      setQuestions(existingGame.questions);
      setEditingGameId(existingGame._id);
    } else {
      resetForm();
      setEditingGameId(null);
    }

    setOpenModal(true);
    setActiveQuestionTab("0");
  };

  const getGameForDay = (day) => {
    const date = new Date(
      currentMonth.getFullYear(),
      currentMonth.getMonth(),
      day
    );
    return games.find(
      (game) => new Date(game.date).toDateString() === date.toDateString()
    );
  };

  const resetForm = () => {
    setTopic("");
    setQuestions([
      {
        question: "",
        media: [],
        options: ["", "", "", ""],
        correctAnswer: "",
      },
    ]);
  };

  const handleCreateOrUpdateGame = async () => {
    if (!selectedDate || !topic || questions.length === 0) {
      toast.error("Por favor completa el tema y al menos una pregunta");
      return;
    }

    for (let i = 0; i < questions.length; i++) {
      const q = questions[i];
      if (!q.question) {
        toast.error(`La pregunta ${i + 1} está vacía`);
        return;
      }
      if (q.options.some((opt) => !opt.trim())) {
        toast.error(`La pregunta ${i + 1} tiene opciones vacías`);
        return;
      }
      if (!q.correctAnswer) {
        toast.error(
          `La pregunta ${i + 1} no tiene respuesta correcta seleccionada`
        );
        return;
      }
      if (!q.options.includes(q.correctAnswer)) {
        toast.error(
          `La respuesta correcta de la pregunta ${
            i + 1
          } no está entre las opciones`
        );
        return;
      }
      for (let j = 0; j < q.media.length; j++) {
        if (!q.media[j].url.trim()) {
          toast.error(`La pregunta ${i + 1} tiene URLs de media vacías`);
          return;
        }
      }
    }

    setLoading(true);
    try {
      const payload = {
        date: selectedDate.toISOString(),
        topic,
        questions,
      };

      const url = editingGameId
        ? `/api/admin/history-games/${editingGameId}`
        : "/api/admin/history-games";
      const method = editingGameId ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Error al guardar el juego");
      }

      toast.success(
        `Juego ${editingGameId ? "actualizado" : "creado"} correctamente`
      );
      setOpenModal(false);
      resetForm();
      fetchGames();
    } catch (error) {
      toast.error(error.message || "Error al guardar el juego");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteGame = async (id) => {
    if (
      !confirm(
        "¿Estás seguro de eliminar este juego? Esta acción no se puede deshacer."
      )
    )
      return;

    try {
      const res = await fetch(`/api/admin/history-games/${id}`, {
        method: "DELETE",
      });

      if (!res.ok) throw new Error("Error al eliminar el juego");

      toast.success("Juego eliminado correctamente");
      setOpenModal(false);
      fetchGames();
    } catch (error) {
      toast.error("Error al eliminar el juego");
    }
  };

  const addQuestion = () => {
    const newQuestion = {
      question: "",
      media: [],
      options: ["", "", "", ""],
      correctAnswer: "",
    };
    setQuestions([...questions, newQuestion]);
    setActiveQuestionTab(questions.length.toString());
  };

  const removeQuestion = (index) => {
    if (questions.length <= 1) {
      toast.error("Debe haber al menos una pregunta");
      return;
    }
    const newQuestions = [...questions];
    newQuestions.splice(index, 1);
    setQuestions(newQuestions);
    if (parseInt(activeQuestionTab) >= newQuestions.length) {
      setActiveQuestionTab((newQuestions.length - 1).toString());
    }
  };

  const updateQuestion = (index, field, value) => {
    const updatedQuestions = [...questions];
    updatedQuestions[index] = { ...updatedQuestions[index], [field]: value };
    setQuestions(updatedQuestions);
  };

  const updateQuestionOption = (qIndex, optIndex, value) => {
    const updatedQuestions = [...questions];
    const updatedOptions = [...updatedQuestions[qIndex].options];
    updatedOptions[optIndex] = value;
    updatedQuestions[qIndex].options = updatedOptions;
    setQuestions(updatedQuestions);
  };

  const addMediaToQuestion = (qIndex, type) => {
    const updatedQuestions = [...questions];
    updatedQuestions[qIndex].media.push({ type, url: "" });
    setQuestions(updatedQuestions);
  };

  const updateMediaUrl = (qIndex, mIndex, url) => {
    const updatedQuestions = [...questions];
    updatedQuestions[qIndex].media[mIndex].url = url;
    setQuestions(updatedQuestions);
  };

  const updateMediaType = (qIndex, mIndex, type) => {
    const updatedQuestions = [...questions];
    updatedQuestions[qIndex].media[mIndex].type = type;
    setQuestions(updatedQuestions);
  };

  const removeMediaFromQuestion = (qIndex, mIndex) => {
    const updatedQuestions = [...questions];
    updatedQuestions[qIndex].media.splice(mIndex, 1);
    setQuestions(updatedQuestions);
  };

  const duplicateQuestion = (index) => {
    const questionToDuplicate = {
      ...questions[index],
      media: questions[index].media.map((m) => ({ ...m })),
      options: [...questions[index].options],
    };
    const newQuestions = [...questions];
    newQuestions.splice(index + 1, 0, questionToDuplicate);
    setQuestions(newQuestions);
    setActiveQuestionTab((index + 1).toString());
  };

  const goToPreviousMonth = () => {
    setCurrentMonth((prevMonth) => subMonths(prevMonth, 1));
  };

  const goToNextMonth = () => {
    setCurrentMonth((prevMonth) => addMonths(prevMonth, 1));
  };

  const firstDayOfMonth = new Date(
    currentMonth.getFullYear(),
    currentMonth.getMonth(),
    1
  );
  const lastDayOfMonth = new Date(
    currentMonth.getFullYear(),
    currentMonth.getMonth() + 1,
    0
  );
  const firstDayOfWeek = firstDayOfMonth.getDay();
  const daysInMonth = lastDayOfMonth.getDate();
  const weekDays = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];

  const generateCalendarCells = () => {
    const cells = [];
    for (let i = 0; i < firstDayOfWeek; i++) {
      cells.push(<div key={`empty-${i}`} className="bg-muted" />);
    }
    for (let day = 1; day <= daysInMonth; day++) {
      const game = getGameForDay(day);
      const isToday =
        new Date().getDate() === day &&
        new Date().getMonth() === currentMonth.getMonth() &&
        new Date().getFullYear() === currentMonth.getFullYear();
      cells.push(
        <div
          key={`day-${day}`}
          onClick={() => handleDayClick(day)}
          className={`border relative group cursor-pointer p-1 transition-all min-h-[80px]
            ${
              isToday
                ? "bg-blue-50 border-blue-300"
                : "bg-white dark:bg-gray-800"
            }
            ${game ? "hover:border-blue-500" : "hover:border-gray-400"}`}
        >
          <span className="text-sm font-medium">{day}</span>
          {game ? (
            <div className="absolute bottom-1 left-1 right-1 flex flex-col items-center justify-end">
              <BookOpen className="h-4 w-4 text-blue-600 mb-1" />
              <span className="text-xs truncate w-full text-center font-medium">
                {game.topic}
              </span>
              <span className="text-xs text-gray-500">
                {game.questions.length} preguntas
              </span>
            </div>
          ) : (
            <div className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <PlusCircle className="h-4 w-4 text-blue-600" />
            </div>
          )}
        </div>
      );
    }
    return cells;
  };

  return (
    <div className="h-screen flex flex-col p-4 md:p-6">
      <h1 className="text-3xl font-bold mb-4">
        📚 Modo Historia - Administración
      </h1>
      <Card className="flex-1 flex flex-col">
        <CardHeader className="pb-2">
          <div className="flex justify-between items-center">
            <CardTitle className="flex items-center gap-2 text-xl">
              <CalendarIcon className="h-5 w-5 text-blue-600" />
              <span className="capitalize">
                {format(currentMonth, "MMMM yyyy", { locale: es })}
              </span>
            </CardTitle>
            <div className="flex gap-2">
              <Button onClick={goToPreviousMonth} variant="outline" size="icon">
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button onClick={goToNextMonth} variant="outline" size="icon">
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="flex-1 flex flex-col p-4">
          <div className="grid grid-cols-7 gap-1 mb-2">
            {weekDays.map((day) => (
              <div
                key={day}
                className="text-center py-2 font-medium text-sm text-blue-600"
              >
                {day}
              </div>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-1 flex-1">
            {generateCalendarCells()}
          </div>
        </CardContent>
      </Card>

      {/* Modal */}
      <Dialog open={openModal} onOpenChange={setOpenModal}>
        <DialogContent className="max-w-6xl max-h-[95vh] overflow-y-auto">
          <DialogHeader>
            <h2 className="text-xl font-semibold mb-4">
              {selectedDate
                ? `${
                    editingGameId ? "Editar" : "Crear"
                  } Juego de Historia - ${format(selectedDate, "PPP", {
                    locale: es,
                  })}`
                : "Juego de Historia"}
            </h2>
          </DialogHeader>

          <div className="space-y-6">
            <div>
              <Label htmlFor="topic">Tema del día</Label>
              <Input
                id="topic"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="Ej: Fundación del club, Campeonatos históricos, Grandes jugadores..."
                className="mt-1"
              />
            </div>

            <div className="flex justify-between items-center">
              <h3 className="font-bold text-lg">
                Preguntas ({questions.length}) - Control total sobre cantidad
              </h3>
              <Button onClick={addQuestion} variant="outline" size="sm">
                <PlusSquare className="h-4 w-4 mr-1" /> Agregar Pregunta
              </Button>
            </div>

            <Tabs
              value={activeQuestionTab}
              onValueChange={setActiveQuestionTab}
            >
              <TabsList className="mb-4 flex flex-wrap gap-1">
                {questions.map((_, index) => (
                  <TabsTrigger
                    key={index}
                    value={index.toString()}
                    className="text-xs"
                  >
                    P{index + 1}
                  </TabsTrigger>
                ))}
              </TabsList>

              {questions.map((question, qIndex) => (
                <TabsContent
                  key={qIndex}
                  value={qIndex.toString()}
                  className="border p-4 rounded-lg space-y-4"
                >
                  <div className="flex justify-between items-center">
                    <h3 className="font-bold">Pregunta {qIndex + 1}</h3>
                    <div className="flex gap-2">
                      <Button
                        onClick={() => duplicateQuestion(qIndex)}
                        variant="outline"
                        size="sm"
                      >
                        Duplicar
                      </Button>
                      <Button
                        onClick={() => removeQuestion(qIndex)}
                        variant="destructive"
                        size="sm"
                        disabled={questions.length <= 1}
                      >
                        <MinusSquare className="h-4 w-4 mr-1" /> Eliminar
                      </Button>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor={`question-${qIndex}`}>Pregunta</Label>
                    <Textarea
                      id={`question-${qIndex}`}
                      value={question.question}
                      onChange={(e) =>
                        updateQuestion(qIndex, "question", e.target.value)
                      }
                      placeholder="Escribe la pregunta sobre la historia de San Lorenzo"
                      className="mt-1"
                      rows={3}
                    />
                  </div>

                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <Label>
                        Multimedia ({question.media.length}) - Imágenes y/o
                        Videos (opcional)
                      </Label>
                      <div className="flex gap-2">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => addMediaToQuestion(qIndex, "image")}
                        >
                          <ImageIcon className="h-4 w-4 mr-1" /> + Imagen
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => addMediaToQuestion(qIndex, "video")}
                        >
                          <VideoIcon className="h-4 w-4 mr-1" /> + Video
                        </Button>
                      </div>
                    </div>

                    {question.media.length === 0 ? (
                      <p className="text-sm text-gray-500 italic p-3 bg-gray-50 rounded">
                        Sin multimedia. Puedes agregar imágenes o videos para
                        enriquecer la pregunta.
                      </p>
                    ) : (
                      <div className="space-y-2">
                        {question.media.map((media, mediaIndex) => (
                          <div
                            key={mediaIndex}
                            className="flex items-center gap-2"
                          >
                            <Select
                              value={media.type}
                              onValueChange={(value) => {
                                if (value === "image" || value === "video") {
                                  updateMediaType(qIndex, mediaIndex, value);
                                }
                              }}
                            >
                              <SelectTrigger className="w-[100px]">
                                <SelectValue placeholder="Tipo" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="image">Imagen</SelectItem>
                                <SelectItem value="video">Video</SelectItem>
                              </SelectContent>
                            </Select>

                            <Input
                              type="text"
                              value={media.url}
                              onChange={(e) =>
                                updateMediaUrl(
                                  qIndex,
                                  mediaIndex,
                                  e.target.value
                                )
                              }
                              placeholder="URL del medio"
                              className="flex-1"
                            />

                            <Button
                              type="button"
                              variant="destructive"
                              size="icon"
                              onClick={() => removeMedia(qIndex, mediaIndex)}
                            >
                              ✕
                            </Button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div>
                    <Label className="mb-2 block">Opciones (siempre 4)</Label>
                    <div className="space-y-2">
                      {question.options.map((opt, optIndex) => (
                        <div key={optIndex} className="flex gap-2">
                          <Input
                            value={opt}
                            onChange={(e) =>
                              updateQuestionOption(
                                qIndex,
                                optIndex,
                                e.target.value
                              )
                            }
                            placeholder={`Opción ${optIndex + 1}`}
                            className="flex-1"
                          />
                          <Button
                            type="button"
                            variant={
                              question.correctAnswer === opt && opt
                                ? "default"
                                : "outline"
                            }
                            size="sm"
                            onClick={() =>
                              updateQuestion(qIndex, "correctAnswer", opt)
                            }
                            disabled={!opt.trim()}
                            className="min-w-[120px]"
                          >
                            {question.correctAnswer === opt && opt
                              ? "✓ Correcta"
                              : "Marcar correcta"}
                          </Button>
                        </div>
                      ))}
                    </div>
                    {question.correctAnswer && (
                      <p className="text-sm text-green-600 mt-2">
                        Respuesta correcta:{" "}
                        <strong>{question.correctAnswer}</strong>
                      </p>
                    )}
                  </div>
                </TabsContent>
              ))}
            </Tabs>

            <div className="flex justify-between items-center pt-4 border-t">
              <div className="text-sm text-gray-600">
                Total: {questions.length} pregunta
                {questions.length !== 1 ? "s" : ""} configurada
                {questions.length !== 1 ? "s" : ""}
              </div>
              <div className="flex gap-2">
                {editingGameId && (
                  <Button
                    variant="destructive"
                    onClick={() => handleDeleteGame(editingGameId)}
                    disabled={loading}
                  >
                    <Trash2 className="w-4 h-4 mr-1" />
                    Eliminar Juego
                  </Button>
                )}
                <Button
                  onClick={handleCreateOrUpdateGame}
                  disabled={loading}
                  size="lg"
                >
                  {loading ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  ) : (
                    <Save className="w-4 h-4 mr-2" />
                  )}
                  {editingGameId ? "Actualizar Juego" : "Crear Juego"}
                </Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
