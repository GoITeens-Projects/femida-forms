import { Info } from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "./tooltip";

export function InfoTooltip({ textContent }: { textContent: string }) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Info className="size-3.5" />
      </TooltipTrigger>
      <TooltipContent side="top">
        <p className="text-center text-balance max-w-xs">{textContent}</p>
      </TooltipContent>
    </Tooltip>
  );
}
