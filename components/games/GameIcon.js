import Image from "next/image";
import { BookOpen, Music } from "lucide-react";
import { cn } from "../../lib/utils";

export function GameIcon({ icon, className }) {
  const imageProps = {
    width: 100,
    height: 100,
    className: cn(className, "object-contain"),
  };

  const iconComponents = {
    nacional: (
      <div className={cn("flex items-center justify-center gap-1", className)}>
        <Image
          src="/images/san-lorenzo-escudo.png"
          alt="Escudo San Lorenzo"
          width={80}
          height={80}
          className="w-20 h-20 object-contain"
        />
        <Image
          src="/images/afa-logo.svg"
          alt="Logo AFA"
          width={80}
          height={80}
          className="w-20 h-20 object-contain"
        />
      </div>
    ),
    internacional: (
      <div className={cn("flex items-center justify-center gap-1", className)}>
        <Image
          src="/images/san-lorenzo-escudo.png"
          alt="Escudo San Lorenzo"
          width={80}
          height={80}
          className="w-20 h-20 object-contain"
        />
        <Image
          src="/images/fifa-logo.svg"
          alt="Logo FIFA"
          width={80}
          height={80}
          className="w-20 h-20 object-contain"
        />
      </div>
    ),
    camiseta: (
      <Image
        src="/images/camiseta.png"
        alt="Camiseta"
        {...imageProps}
        className={cn(className, "object-contain invert")}
      />
    ),
    jugador: (
      <Image
        src="/images/jugador-correcto.png"
        alt="Jugador"
        {...imageProps}
        className={cn(className, "object-contain invert")}
      />
    ),
    historia: <BookOpen className={cn(className, "text-white")} />,
    video: (
      <Image
        src="/images/video.webp"
        alt="Video"
        {...imageProps}
        className={cn(className, "object-contain invert")}
      />
    ),
    trayectoria: (
      <Image
        src="/images/trayectoria.png"
        alt="Trayectoria"
        {...imageProps}
        className={cn(className, "object-contain invert")}
      />
    ),
    presencias: (
      <div
        className={cn("flex items-center justify-center relative", className)}
      >
        <Image
          src="/images/cancha.png"
          alt="Cancha"
          width={100}
          height={100}
          className="w-full h-full object-contain invert"
        />
        <Image
          src="/images/jugadorpelota.png"
          alt="Jugador"
          width={40}
          height={80}
          className="h-2/4 absolute left-[10%] object-contain"
        />
        <Image
          src="/images/plusminus-2.png"
          alt="Plus Minus"
          width={30}
          height={30}
          className="w-1/6 h-1/6 absolute right-[25%] top-[20%] object-contain"
        />
      </div>
    ),
    goles: (
      <div
        className={cn("flex items-center justify-center relative", className)}
      >
        <Image
          src="/images/gol.png"
          alt="Gol"
          width={100}
          height={100}
          className="w-full h-full object-contain invert"
        />
        <Image
          src="/images/plusminus.webp"
          alt="Plus Minus"
          width={30}
          height={30}
          className="w-1/3 h-1/3 object-contain invert absolute right-[5%] bottom-[5%]"
        />
      </div>
    ),
    cancion: <Music className={cn(className, "text-white")} />,
  };

  return iconComponents[icon] || null;
}
