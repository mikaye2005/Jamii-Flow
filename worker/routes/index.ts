import { Hono } from "hono";
import { authRoutes } from "./auth";
import { contributionsRoutes } from "./contributions";
import { groupsRoutes } from "./groups";
import { healthRoutes } from "./health";
import { membersRoutes } from "./members";
import { memberPortalRoutes } from "./memberPortal";
import { operationsRoutes } from "./operations";
import { paymentsRoutes } from "./payments";
import { reportsRoutes } from "./reports";
import { receiptsRoutes } from "./receipts";
import { fail } from "../utils/http";

export const apiRoutes = new Hono();

apiRoutes.route("/", healthRoutes);
apiRoutes.route("/auth", authRoutes);
apiRoutes.route("/groups", groupsRoutes);
apiRoutes.route("/members", membersRoutes);
apiRoutes.route("/member-portal", memberPortalRoutes);
apiRoutes.route("/contributions", contributionsRoutes);
apiRoutes.route("/payments", paymentsRoutes);
apiRoutes.route("/receipts", receiptsRoutes);
apiRoutes.route("/operations", operationsRoutes);
apiRoutes.route("/reports", reportsRoutes);
apiRoutes.all("*", (c) => fail(c, "API route not found.", 404, "API_NOT_FOUND"));
