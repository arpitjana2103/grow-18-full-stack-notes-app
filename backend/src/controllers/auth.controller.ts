import type { NextFunction, Request, Response } from "express";

import { config } from "../configs/app.config.js";
import { HTTPSTATUSCODE } from "../configs/http.config.js";
import { handleAsyncError } from "../middlewares/async-handler.middleware.js";
import { ensureUserService } from "../services/user.service.js";
import { sendResponse } from "../utils/response.util.js";
import { registrationUserSchema } from "../validations/auth.validation.js";

export const handleGoogleAuthSuccess = handleAsyncError(async function (
    req: Request,
    res: Response,
    next: NextFunction,
) {
    return res.redirect(`${config.FRONTEND_ORIGIN}/notes`);
});

export const registerUser = handleAsyncError(async function (
    req: Request,
    res: Response,
    next: NextFunction,
) {
    const { name, email, password } = registrationUserSchema.parse({ ...req.body });
    const user = await ensureUserService({
        name: name,
        email: email,
        password: password,
        provider: "EMAIL",
    });

    sendResponse(res, {
        statusCode: HTTPSTATUSCODE.OK,
        status: "success",
        message: "User registered successfully",
        data: {
            user: {
                name: user.name,
                email: user.email,
            },
        },
    });
});

export const loginUserSuccess = handleAsyncError(async function (
    req: Request,
    res: Response,
    next: NextFunction,
) {
    sendResponse(res, {
        statusCode: HTTPSTATUSCODE.OK,
        status: "success",
        message: "user logged in",
        data: {
            user: req.user,
        },
    });
});
