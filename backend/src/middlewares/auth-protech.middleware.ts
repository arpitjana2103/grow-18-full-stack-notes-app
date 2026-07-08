import type { Request, Response, NextFunction } from "express";

import { HTTPSTATUSCODE } from "../configs/http.config.js";
import { ErrorCodeEnum } from "../enums/error-code.enum.js";
import { destroySessionAndLogout } from "../services/auth.service.js";
import { AppError } from "../utils/errors/app-error.util.js";
import { handleAsyncError } from "./async-handler.middleware.js";

export const authProtect = handleAsyncError(async function (
    req: Request,
    res: Response,
    next: NextFunction,
) {
    if (req.isAuthenticated() && req.user) next();
    else {
        await destroySessionAndLogout(req, res);

        throw new AppError({
            publicMessage: "Authentication required",
            internalMessage: "Session invalid (user missing or not active)",
            statusCode: HTTPSTATUSCODE.UNAUTHORIZED,
            errorCode: ErrorCodeEnum.AUTH_UNAUTHORIZED_ACCESS,
        });
    }
});
