"use client";

import { Heart, CheckCircle, XCircle, Clock } from "lucide-react";
import { GAME_CONFIGS } from "@/constants/gameConfig";

export default function GameScreen({
  gameSlug,
  gameMode,
  timeLeft,
  lives,
  currentStep,
  totalSteps,
  title,
  topic, // <- nuevo
  question,
  children, // Options/inputs area
  mediaContent, // Left side media content
  onSubmit,
  canSubmit,
  showFeedback,
  formatTime,
  progressInfo,
  gameLogic,
}) {
  const config = GAME_CONFIGS[gameSlug];

  const getProgressPercentage = () => {
    if (!currentStep || !totalSteps) return 0;
    return (currentStep / totalSteps) * 100;
  };

  return (
    <>
      <div className="h-screen flex flex-col md:flex-row py-[56px] md:py-[64px]">
        {/* Left Column - Media */}
        <div className="w-full md:w-1/2 flex items-center justify-center bg-[var(--gris-claro)] dark:bg-[var(--fondo-oscuro)] relative h-[40%] md:h-auto">
          <div className="relative h-full flex items-center justify-center p-4 md:p-6 w-full">
            {mediaContent}
          </div>
        </div>

        {/* Right Column - Game Content */}
        <div className="w-full md:w-1/2 flex flex-col items-center p-2 lg:p-4 bg-[var(--azul)] dark:bg-[var(--rojo)] min-h-[60%] md:min-h-full relative">
          {/* Centered content container */}
          <div className="flex-1 flex flex-col justify-start lg:justify-center items-center w-full">
            {/* Header section */}
            <div className="flex flex-col items-center w-full mb-1 md:mb-8 px-4">
              <h3 className="text-2xl md:text-3xl font-bold text-[var(--blanco)] text-center hidden lg:block">
                {config.title}
              </h3>
              {topic && (
                <p className="text-sm md:text-base text-[var(--blanco)] opacity-90 mb-2 text-center md:mb-3 hidden lg:block">
                  {topic}
                </p>
              )}

              {/* Game mode indicators */}
              <div className="flex items-center gap-3 md:gap-4 mb-2 md:mb-4">
                {gameMode === "lives" ? (
                  <div className="flex items-center gap-1 md:gap-2">
                    {Array.from({ length: 3 }).map((_, index) => (
                      <Heart
                        key={index}
                        size={20}
                        className={
                          index < (lives || 0)
                            ? "text-red-500 fill-red-500 dark:text-blue-900 dark:fill-blue-900"
                            : "text-white opacity-30"
                        }
                      />
                    ))}
                  </div>
                ) : gameMode === "time" ? (
                  <div className="flex items-center gap-2 text-[var(--blanco)]">
                    <Clock size={20} />
                    <span className="text-lg md:text-xl font-bold">
                      {gameLogic
                        ? gameLogic.formatTime(gameLogic.timeLeft)
                        : formatTime(timeLeft || 0)}
                    </span>
                  </div>
                ) : (
                  ""
                )}
              </div>
            </div>

            {/* Main content section */}
            <div className="w-full max-w-sm md:max-w-md px-4">
              <h2 className="text-base md:text-lg font-bold mb-2 md:mb-4 text-center text-[var(--blanco)] leading-tight">
                {question}
              </h2>

              <div className="space-y-2 md:space-y-4">
                {children}

                {/* Feedback toast notification */}
                {showFeedback && showFeedback.show && (
                  <div className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none p-4">
                    <div
                      className={`px-6 py-4 rounded-xl flex items-center gap-2 shadow-lg ${
                        showFeedback.correct
                          ? "bg-green-500 text-white"
                          : "bg-red-500 text-white"
                      }`}
                    >
                      {showFeedback.correct ? (
                        <CheckCircle className="h-4 w-4 md:h-5 md:w-5" />
                      ) : (
                        <XCircle className="h-4 w-4 md:h-5 md:w-5" />
                      )}
                      <span className="font-medium text-sm md:text-base">
                        {showFeedback.message}
                      </span>
                    </div>
                  </div>
                )}

                <button
                  onClick={onSubmit}
                  disabled={!canSubmit}
                  className="w-full py-2 lg:py-3 rounded-lg font-bold text-sm transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-lg bg-[var(--blanco)] text-[var(--azul)] dark:text-[var(--rojo)] hover:opacity-90 border-2 border-[var(--blanco)]"
                >
                  Confirmar Respuesta
                </button>
              </div>
            </div>
          </div>

          {/* Footer section - Progress Bar - Fixed at bottom */}
          {((currentStep && totalSteps) || progressInfo) && (
            <div className="w-full max-w-sm md:max-w-md absolute bottom-2 lg:bottom-4 left-1/2 transform -translate-x-1/2 px-4">
              {currentStep && totalSteps && (
                <div className="h-1.5 rounded-full lg:placeholder:mb-2 bg-[var(--rojo)] dark:bg-[var(--azul)] bg-opacity-30">
                  <div
                    className="h-full rounded-full transition-all duration-300 bg-[var(--blanco)]"
                    style={{ width: `${getProgressPercentage()}%` }}
                  />
                </div>
              )}
              <p className="text-xs font-medium text-center text-[var(--blanco)] opacity-80">
                {progressInfo || `Paso ${currentStep} de ${totalSteps}`}
              </p>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
