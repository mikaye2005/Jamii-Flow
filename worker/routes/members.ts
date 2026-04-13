import { Hono } from "hono";
import {
  createMemberController,
  listMembersByGroupController,
  updateMemberController,
} from "../controllers/membersController";
import { requireAuth } from "../middlewares/authMiddleware";

export const membersRoutes = new Hono<{ Bindings: Env; Variables: { authUserId: string } }>();

membersRoutes.use("*", requireAuth);
membersRoutes.get("/", listMembersByGroupController);
membersRoutes.post("/", createMemberController);
membersRoutes.patch("/:membershipId", updateMemberController);
