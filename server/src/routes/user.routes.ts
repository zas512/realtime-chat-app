import { Router } from "express";
import { searchUser } from "../controllers/user.controller";
import { protect } from "../middleware/auth.middleware";

const router = Router();

router.use(protect);
router.get("/search", searchUser);

export default router;
