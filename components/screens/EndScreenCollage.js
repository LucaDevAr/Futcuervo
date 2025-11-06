"use client";

import { useState } from "react";

export default function EndScreenCollage({ images, defaultIcon: DefaultIcon }) {
  const [mediaErrors, setMediaErrors] = useState(new Set());

  const handleMediaError = (url) => {
    setMediaErrors((prev) => new Set(prev).add(url));
  };

  const validMedia = images.filter(
    (item) => item.url && !mediaErrors.has(item.url)
  );

  if (validMedia.length === 0) {
    return (
      <div className="w-full aspect-video flex items-center justify-center bg-[var(--gris-claro)] dark:bg-[var(--fondo-oscuro)] rounded-lg">
        <DefaultIcon className="h-16 w-16 text-[var(--azul)] dark:text-[var(--rojo)]" />
      </div>
    );
  }

  // 🎯 Si hay solo una media, se muestra centrada y grande
  if (validMedia.length === 1) {
    const item = validMedia[0];
    return (
      <div className="w-full aspect-video flex items-center justify-center rounded-lg overflow-hidden bg-[var(--gris-claro)] dark:bg-[var(--fondo-oscuro)]">
        <div className="w-[80%] max-w-[500px] aspect-[4/3] rounded-lg shadow-lg overflow-hidden">
          {item.type === "image" ? (
            <img
              src={item.url}
              alt="Media única"
              className="w-full h-full object-cover"
              onError={() => handleMediaError(item.url)}
            />
          ) : (
            <video
              src={item.url}
              muted
              loop
              autoPlay
              playsInline
              className="w-full h-full object-cover"
              onError={() => handleMediaError(item.url)}
            />
          )}
        </div>
      </div>
    );
  }

  // 🧩 Estilo para múltiples medias (collage)
  const generateStyle = (index, total) => {
    const angle = (360 / total) * index + (Math.random() * 20 - 10);
    const angleRad = (angle * Math.PI) / 180;

    const minRadius = 10;
    const maxRadius = 130;
    const radius = minRadius + Math.random() * (maxRadius - minRadius);

    const x = Math.cos(angleRad) * radius;
    const y = Math.sin(angleRad) * radius;

    let widthPercent = 60;
    let maxWidthPx = 500;

    if (total === 2) {
      widthPercent = 45;
      maxWidthPx = 400;
    } else if (total === 3) {
      widthPercent = 40;
      maxWidthPx = 350;
    } else if (total === 4) {
      widthPercent = 35;
      maxWidthPx = 320;
    } else if (total <= 6) {
      widthPercent = 30;
      maxWidthPx = 280;
    } else {
      widthPercent = 25;
      maxWidthPx = 240;
    }

    const rotation = (Math.random() * 20 - 10).toFixed(2);

    return {
      top: "40%",
      left: "40%",
      transform: `translate(-50%, -50%) translate(${x}%, ${y}%) rotate(${rotation}deg)`,
      zIndex: 10 + index,
      width: `${widthPercent}%`,
      maxWidth: `${maxWidthPx}px`,
    };
  };

  return (
    <div className="relative w-full h-full aspect-video rounded-lg bg-[var(--gris-claro)] dark:bg-[var(--fondo-oscuro)]">
      {validMedia.slice(0, 10).map((item, index) => (
        <div
          key={index}
          style={generateStyle(index, validMedia.length)}
          className="absolute aspect-[4/3] shadow-md rounded-md overflow-hidden bg-white"
        >
          {item.type === "image" ? (
            <img
              src={item.url}
              alt={`Media ${index}`}
              className="w-full h-full object-cover"
              onError={() => handleMediaError(item.url)}
            />
          ) : (
            <video
              src={item.url}
              muted
              loop
              autoPlay
              playsInline
              className="w-full h-full object-cover"
              onError={() => handleMediaError(item.url)}
            />
          )}
        </div>
      ))}

      {validMedia.length > 8 && (
        <div className="absolute bottom-1/2 right-1/2 bg-black bg-opacity-50 text-white text-xs px-2 py-1 rounded shadow z-20">
          +{validMedia.length - 8}
        </div>
      )}
    </div>
  );
}
