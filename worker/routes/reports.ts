import { Hono } from "hono";
import {
  collectionTrendController,
  dashboardSummaryController,
  groupPerformanceController,
} from "../controllers/reportsController";
import { requireAuth } from "../middlewares/authMiddleware";

export const reportsRoutes = new Hono<{ Bindings: Env; Variables: { authUserId: string } }>();

reportsRoutes.use("*", requireAuth);
reportsRoutes.get("/summary", dashboardSummaryController);
reportsRoutes.get("/collection-trend", collectionTrendController);
reportsRoutes.get("/group-performance", groupPerformanceController);
