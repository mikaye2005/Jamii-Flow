import { Hono } from "hono";
import {
  broadcastGroupNotificationController,
  createAuditLogController,
  createNotificationController,
  createReminderController,
  listArrearsController,
  listAuditLogsController,
  listNotificationsController,
  listMyNotificationsController,
  markNotificationReadController,
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
operationsRoutes.get("/notifications/me", listMyNotificationsController);
operationsRoutes.post("/notifications/read", markNotificationReadController);
operationsRoutes.post("/notifications", createNotificationController);
operationsRoutes.post(
  "/notifications/broadcast",
  requireGroupAccessFromBody("groupId"),
  broadcastGroupNotificationController,
);

operationsRoutes.get("/audit-logs", requireGroupAccessFromQuery("groupId"), listAuditLogsController);
operationsRoutes.post("/audit-logs", createAuditLogController);
operationsRoutes.get("/payment-webhooks", listPaymentWebhookLogsController);
