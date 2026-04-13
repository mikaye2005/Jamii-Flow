import { Hono } from "hono";
import {
  collectionTrendController,
  dashboardSummaryController,
  groupPerformanceController,
} from "../controllers/reportsController";
import { requireAuth, requireOptionalGroupAccessFromQuery } from "../middlewares/authMiddleware";

export const reportsRoutes = new Hono<{ Bindings: Env; Variables: { authUserId: string } }>();

reportsRoutes.use("*", requireAuth);
reportsRoutes.get("/summary", requireOptionalGroupAccessFromQuery("groupId"), dashboardSummaryController);
reportsRoutes.get(
  "/collection-trend",
  requireOptionalGroupAccessFromQuery("groupId"),
  collectionTrendController,
);
reportsRoutes.get("/group-performance", groupPerformanceController);
