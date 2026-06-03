import * as React from "react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

interface DesktopTooltipProps {
  children: React.ReactNode;
  content: React.ReactNode;
  contentClassName?: string;
  side?: "top" | "right" | "bottom" | "left";
}

export function DesktopTooltip({
  children,
  content,
  contentClassName,
  side = "top",
}: DesktopTooltipProps) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>{children}</TooltipTrigger>
      <TooltipContent
        side={side}
        className={cn(
          "hidden md:block pointer-coarse:hidden",
          contentClassName,
        )}
      >
        {content}
      </TooltipContent>
    </Tooltip>
  );
}
