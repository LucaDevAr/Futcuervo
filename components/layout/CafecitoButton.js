"use client";

import { FaCoffee } from "react-icons/fa";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export default function CafecitoCustom() {
  return (
    <TooltipProvider delayDuration={0}>
      <Tooltip>
        <TooltipTrigger asChild>
          <a
            href="https://cafecito.app/futcuervo"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Invitame un café en Cafecito"
            className="p-2 rounded-lg transition-all duration-300 transform hover:scale-105 hover:shadow-lg outline-none focus:outline-none border-none bg-[var(--navbar-button-bg)] text-[var(--navbar-button-text)] hover:bg-[var(--navbar-button-bg-hover)] hover:text-[var(--navbar-button-text-hover)]"
          >
            <FaCoffee size={20} />
          </a>
        </TooltipTrigger>
        <TooltipContent className="bg-[var(--navbar-button-bg)] text-[var(--navbar-text-tooltip)] border-0">
          Invitame un café
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
