import { Hono } from "hono";
import { handleApiError } from "./middlewares/errorHandler";
import { apiRoutes } from "./routes";

const app = new Hono<{ Bindings: Env }>();

app.route("/api", apiRoutes);
app.onError(handleApiError);

export default app;
