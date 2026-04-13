import { Hono } from "hono";
import {
  createContributionCycleController,
  createContributionPlanController,
  listContributionCyclesController,
  listContributionPlansController,
  listDueItemsController,
} from "../controllers/contributionsController";
import { requireAuth } from "../middlewares/authMiddleware";

export const contributionsRoutes = new Hono<{ Bindings: Env; Variables: { authUserId: string } }>();

contributionsRoutes.use("*", requireAuth);
contributionsRoutes.get("/plans", listContributionPlansController);
contributionsRoutes.post("/plans", createContributionPlanController);
contributionsRoutes.get("/cycles", listContributionCyclesController);
contributionsRoutes.post("/cycles", createContributionCycleController);
contributionsRoutes.get("/due-items", listDueItemsController);
