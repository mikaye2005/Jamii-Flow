import { Hono } from "hono";
import {
  createMemberController,
  listMembersByGroupController,
  updateMemberController,
} from "../controllers/membersController";
import { requireAuth, requireGroupAccessFromBody, requireGroupAccessFromQuery } from "../middlewares/authMiddleware";

export const membersRoutes = new Hono<{ Bindings: Env; Variables: { authUserId: string } }>();

membersRoutes.use("*", requireAuth);
membersRoutes.get("/", requireGroupAccessFromQuery("groupId"), listMembersByGroupController);
membersRoutes.post("/", requireGroupAccessFromBody("groupId"), createMemberController);
membersRoutes.patch("/:membershipId", updateMemberController);
