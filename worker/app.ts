import { Hono } from "hono";
import { handleApiError } from "./middlewares/errorHandler";
import { securityHeaders } from "./middlewares/securityHeaders";
import { apiRoutes } from "./routes";

const app = new Hono<{ Bindings: Env }>();

app.use("*", securityHeaders);
app.route("/api", apiRoutes);
app.onError(handleApiError);

export default app;
