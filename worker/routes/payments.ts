import { Hono } from "hono";
import {
  createPaymentController,
  initiateMpesaStkPushController,
  listPaymentsController,
  mpesaCallbackController,
} from "../controllers/paymentsController";
import { requireAuth } from "../middlewares/authMiddleware";

export const paymentsRoutes = new Hono<{ Bindings: Env; Variables: { authUserId: string } }>();

paymentsRoutes.post("/mpesa/callback", mpesaCallbackController);
paymentsRoutes.use("*", requireAuth);
paymentsRoutes.get("/", listPaymentsController);
paymentsRoutes.post("/", createPaymentController);
paymentsRoutes.post("/mpesa/stk-push", initiateMpesaStkPushController);
