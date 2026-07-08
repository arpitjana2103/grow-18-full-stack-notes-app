import type { NextFunction, Request, Response } from "express";

import { Router } from "express";
import passport from "passport";

import { config } from "../configs/app.config.js";
import {
    handleGoogleAuthSuccess,
    loginUserSuccess,
    registerUser,
} from "../controllers/auth.controller.js";

const authRoutes = Router();

authRoutes.route("/google").get(
    passport.authenticate("google", {
        scope: ["profile", "email"],
    }),
);

authRoutes.route("/google/callback").get(
    passport.authenticate("google", {
        session: true,
        failureRedirect: `${config.get_FRONTEND_GOOGLE_CALLBACK_URL()}?status=failure`,
    }),
    handleGoogleAuthSuccess,
);

authRoutes.route("/register").post(registerUser);

authRoutes.route("/login").post(
    passport.authenticate("local", {
        session: true,
        failWithError: true,
    }),
    loginUserSuccess,
);

export default authRoutes;
