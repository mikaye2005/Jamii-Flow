import { Hono } from "hono";
import { requireAuth } from "../middlewares/authMiddleware";
import {
  createGroupController,
  getGroupController,
  listGroupsController,
  updateGroupController,
} from "../controllers/groupsController";

export const groupsRoutes = new Hono<{ Bindings: Env; Variables: { authUserId: string } }>();

groupsRoutes.use("*", requireAuth);
groupsRoutes.get("/", listGroupsController);
groupsRoutes.get("/:groupId", getGroupController);
groupsRoutes.post("/", createGroupController);
groupsRoutes.patch("/:groupId", updateGroupController);
