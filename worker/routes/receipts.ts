import { Hono } from "hono";
import { listReceiptsController } from "../controllers/paymentsController";
import { requireAuth, requireGroupAccessFromQuery } from "../middlewares/authMiddleware";

export const receiptsRoutes = new Hono<{ Bindings: Env; Variables: { authUserId: string } }>();

receiptsRoutes.use("*", requireAuth);
receiptsRoutes.get("/", requireGroupAccessFromQuery("groupId"), listReceiptsController);
