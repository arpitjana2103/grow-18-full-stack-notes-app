import type { Request, Response, NextFunction, RequestHandler } from "express";

type AsyncController = (req: Request, res: Response, next: NextFunction) => Promise<unknown>;

// Util: Wraps async route handlers for error forwarding
// - Catches rejected promises from async controllers
// - Forwards errors to Express error middleware via next()
// - Eliminates need for try/catch in controllers
export const handleAsyncError = (asyncController: AsyncController): RequestHandler => {
    return (req, res, next) => {
        asyncController(req, res, next).catch(next);
    };
};
