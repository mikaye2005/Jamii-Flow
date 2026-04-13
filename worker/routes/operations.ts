import { Hono } from "hono";
import {
  createAuditLogController,
  createNotificationController,
  createReminderController,
  listArrearsController,
  listAuditLogsController,
  listNotificationsController,
  listPaymentWebhookLogsController,
  listRemindersController,
} from "../controllers/operationsController";
import { requireAuth } from "../middlewares/authMiddleware";

export const operationsRoutes = new Hono<{ Bindings: Env; Variables: { authUserId: string } }>();

operationsRoutes.use("*", requireAuth);

operationsRoutes.get("/arrears", listArrearsController);

operationsRoutes.get("/reminders", listRemindersController);
operationsRoutes.post("/reminders", createReminderController);

operationsRoutes.get("/notifications", listNotificationsController);
operationsRoutes.post("/notifications", createNotificationController);

operationsRoutes.get("/audit-logs", listAuditLogsController);
operationsRoutes.post("/audit-logs", createAuditLogController);
operationsRoutes.get("/payment-webhooks", listPaymentWebhookLogsController);
