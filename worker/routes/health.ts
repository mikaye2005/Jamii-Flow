import { Hono } from "hono";
import { healthController } from "../controllers/healthController";

export const healthRoutes = new Hono();

healthRoutes.get("/health", healthController);
