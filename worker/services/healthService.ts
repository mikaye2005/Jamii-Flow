import { nowIsoString } from "../../shared/utils/date";

export function getHealthStatus() {
  return {
    status: "ok",
    service: "jamii-flow-api",
    timestamp: nowIsoString(),
  };
}
