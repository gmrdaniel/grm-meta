
import { Progress } from "@/components/ui/progress";

interface BatchProcessingProgressProps {
  operationType: string | null;
  progress: number;
  processedCount: number;
  totalCount: number;
}

export function BatchProcessingProgress({
  operationType,
  progress,
  processedCount,
  totalCount
}: BatchProcessingProgressProps) {
  if (!operationType) {
    return null;
  }

  let operationLabel = "";
  switch (operationType) {
    case "tikTokInfo":
      operationLabel = "Obteniendo información de TikTok...";
      break;
    case "tikTokVideos":
      operationLabel = "Obteniendo videos de TikTok...";
      break;
    case "youTubeInfo":
      operationLabel = "Actualizando información de YouTube...";
      break;
    case "youTubeShorts":
      operationLabel = "Obteniendo Shorts de YouTube...";
      break;
    default:
      operationLabel = "Procesando...";
  }

  return (
    <div className="mt-1 mb-2">
      <div className="flex justify-between text-sm mb-1">
        <span>{operationLabel}</span>
        <span className="text-muted-foreground">
          {processedCount} de {totalCount} procesados
        </span>
      </div>
      <Progress value={progress} className="h-2 w-full" />
    </div>
  );
}
