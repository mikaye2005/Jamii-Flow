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
import { requireAuth, requireGroupAccessFromBody, requireGroupAccessFromQuery } from "../middlewares/authMiddleware";

export const operationsRoutes = new Hono<{ Bindings: Env; Variables: { authUserId: string } }>();

operationsRoutes.use("*", requireAuth);

operationsRoutes.get("/arrears", requireGroupAccessFromQuery("groupId"), listArrearsController);

operationsRoutes.get("/reminders", requireGroupAccessFromQuery("groupId"), listRemindersController);
operationsRoutes.post("/reminders", requireGroupAccessFromBody("groupId"), createReminderController);

operationsRoutes.get("/notifications", listNotificationsController);
operationsRoutes.post("/notifications", createNotificationController);

operationsRoutes.get("/audit-logs", requireGroupAccessFromQuery("groupId"), listAuditLogsController);
operationsRoutes.post("/audit-logs", createAuditLogController);
operationsRoutes.get("/payment-webhooks", listPaymentWebhookLogsController);
