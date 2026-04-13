import { Hono } from "hono";
import {
  createPaymentController,
  initiateMpesaStkPushController,
  listPaymentsController,
  mpesaCallbackController,
} from "../controllers/paymentsController";
import { requireAuth, requireGroupAccessFromBody, requireGroupAccessFromQuery } from "../middlewares/authMiddleware";

export const paymentsRoutes = new Hono<{ Bindings: Env; Variables: { authUserId: string } }>();

paymentsRoutes.post("/mpesa/callback", mpesaCallbackController);
paymentsRoutes.use("*", requireAuth);
paymentsRoutes.get("/", requireGroupAccessFromQuery("groupId"), listPaymentsController);
paymentsRoutes.post("/", requireGroupAccessFromBody("groupId"), createPaymentController);
paymentsRoutes.post("/mpesa/stk-push", initiateMpesaStkPushController);
