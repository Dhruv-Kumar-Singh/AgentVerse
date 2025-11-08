import { cn } from "@/lib/utils";

interface LoadingDotsProps {
  text?: string;
  className?: string;
}

export function LoadingDots({ text = "Loading", className }: LoadingDotsProps) {
  return (
    <div className={cn("flex items-center gap-1", className)}>
      <span>{text}</span>
      <span className="inline-flex gap-1">
        <span className="animate-loading-dot-1">.</span>
        <span className="animate-loading-dot-2">.</span>
        <span className="animate-loading-dot-3">.</span>
      </span>
    </div>
  );
}
