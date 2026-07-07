import type { ErrorRequestHandler, Response } from "express";

import { ZodError } from "zod";

import { runningOnDevelopment, runningOnProduction } from "../configs/app.config.js";
import { HTTPSTATUSCODE } from "../configs/http.config.js";
import { logger } from "../configs/logger.config.js";
import { ErrorCodeEnum } from "../enums/error-code.enum.js";
import { AppError } from "../utils/errors/app-error.util.js";
import { formatZodError } from "../utils/errors/format-zod-error.util.js";
import { sendResponse } from "../utils/response.util.js";

// Middleware: Global error handler with env-based response strategy
// - Routes errors to dev/prod handlers based on runtime environment
export const handleGlobalError: ErrorRequestHandler = function (err: unknown, _req, res, _next) {
    if (err instanceof ZodError) {
        return sendResponse(res, {
            statusCode: HTTPSTATUSCODE.BAD_REQUEST,
            status: "fail",
            errorCode: ErrorCodeEnum.INVALID_INPUT,
            message: "Validation failed",
            data: formatZodError(err),
        });
    }

    if (runningOnDevelopment()) {
        return sendErrForDev(err, res);
    }

    if (runningOnProduction()) {
        return sendErrForProd(err, res);
    }

    return sendResponse(res, {
        statusCode: HTTPSTATUSCODE.INTERNAL_SERVER_ERROR,
        status: "error",
        message: "Something went wrong.",
    });
};

// Helper: Development error formatter
// - Sends detailed error response (message, stack, errorCode) while env is "development"
function sendErrForDev(err: unknown, res: Response): void {
    if (err instanceof AppError) {
        logger.error({ err: err }, err.internalMessage || err.publicMessage);

        sendResponse(res, {
            statusCode: err.statusCode,
            status: "error",
            message: err.publicMessage,
            stack: err.stack,
            ...(err.internalMessage && { internalMessage: err.internalMessage }),
            ...(err.errorCode && { errorCode: err.errorCode }),
        });
    } else {
        logger.error({ err: err });

        sendResponse(res, {
            statusCode: HTTPSTATUSCODE.INTERNAL_SERVER_ERROR,
            env: "development",
            status: "error",
            error: err instanceof Error ? { message: err.message, stack: err.stack } : err,
        });
    }
}

// Helper: Production error formatter
// - Sends sanitized error response (no stack) while env is "production"
function sendErrForProd(err: unknown, res: Response): void {
    if (err instanceof AppError) {
        logger.error({ err: err }, err.internalMessage || err.publicMessage);

        sendResponse(res, {
            env: "production",
            statusCode: err.statusCode,
            status: "error",
            message: err.publicMessage,
            ...(err.errorCode && { errorCode: err.errorCode }),
        });
    } else {
        logger.error({ err: err });

        sendResponse(res, {
            env: "production",
            statusCode: HTTPSTATUSCODE.INTERNAL_SERVER_ERROR,
            status: "error",
            message: "Something went wrong",
        });
    }
}
