import { Hono } from "hono";
import { authRoutes } from "./auth";
import { groupsRoutes } from "./groups";
import { healthRoutes } from "./health";
import { membersRoutes } from "./members";
import { fail } from "../utils/http";

export const apiRoutes = new Hono();

apiRoutes.route("/", healthRoutes);
apiRoutes.route("/auth", authRoutes);
apiRoutes.route("/groups", groupsRoutes);
apiRoutes.route("/members", membersRoutes);
apiRoutes.all("*", (c) => fail(c, "API route not found.", 404, "API_NOT_FOUND"));
