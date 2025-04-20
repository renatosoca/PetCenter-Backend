/* path: /api/auth */
import { Router } from "express";
import {
  confirmAccount,
  forgotPassword,
  resetPassword,
  revalidateAuth,
  updateUserPassword,
  updateUserProfile,
  userAuth,
  userProfile,
  userRegister,
  validateToken,
} from "../controllers";
import { checkSession } from "../middleware";

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Auth
 */

router.post("/login", userAuth);

router.post("/register", userRegister);

router.get("/confirm-account/:token", confirmAccount);

router.post("/forgot-password", forgotPassword);

router.get("/reset-password/:token", validateToken);

router.post("/reset-password/:token", resetPassword);

//Area Protegida
router.use(checkSession);

router.get("/revalidateAuth", revalidateAuth);

router.get("/profile", userProfile);

router.put("/profile/:id", updateUserProfile);

router.put("/password-profile/:id", updateUserPassword);

export default router;
