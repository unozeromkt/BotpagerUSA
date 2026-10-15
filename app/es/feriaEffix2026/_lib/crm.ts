import "server-only";
import { getConfig, highLevelRequest } from "@/lib/integrations/highlevel";

// IDs supplied for the existing BotPager sub-account and Feria Effix pipeline.
// Credentials remain shared with BotPager and are never stored here.
export const effixCrm = {
  locationId: "ue94rPvevtVT7o7wCQt2",
  pipelineId: "4o6WiPB5RnPKn70WzABN",
} as const;

export function getEffixConfig() {
  return getConfig(effixCrm.locationId);
}

type PipelineStage = { id: string; position?: number | string };
type Pipeline = { id: string; stages: PipelineStage[] };

export async function firstEffixStage(config: NonNullable<ReturnType<typeof getEffixConfig>>) {
  const query = new URLSearchParams({ locationId: config.locationId });
  const response = await highLevelRequest<{ pipelines: Pipeline[] }>(config, `/opportunities/pipelines?${query}`, { method: "GET" });
  const pipeline = response.pipelines?.find(item => item.id === effixCrm.pipelineId);
  if (!pipeline || !Array.isArray(pipeline.stages) || !pipeline.stages.length) {
    throw new Error("No se encontró el pipeline Feria Effix o sus etapas.");
  }

  // Older APIs use numeric positions; newer ones can use fractional-index keys.
  // Without complete positions, preserve the API's stage order.
  const stages = [...pipeline.stages];
  if (stages.every(stage => typeof stage.position === "number" && Number.isFinite(stage.position))) {
    stages.sort((a, b) => Number(a.position) - Number(b.position));
  } else if (stages.every(stage => typeof stage.position === "string" && stage.position.length > 0)) {
    const numeric = stages.every(stage => Number.isFinite(Number(stage.position)));
    stages.sort((a, b) => numeric
      ? Number(a.position) - Number(b.position)
      : a.position! < b.position! ? -1 : a.position! > b.position! ? 1 : 0);
  }
  if (typeof stages[0].id !== "string" || !stages[0].id.trim()) {
    throw new Error("La primera etapa de Feria Effix no tiene un ID válido.");
  }
  return stages[0].id;
}
