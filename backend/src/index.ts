import "dotenv/config";
import "./configs/passport.config.js";

import type { Request, Response, NextFunction } from "express";
import type { StringValue as msStringValue } from "ms";

import express from "express";
import session from "express-session";
import ms from "ms";
import passport from "passport";
import qs from "qs";

import { config, runningOnProduction } from "./configs/app.config.js";
import { HTTPSTATUSCODE } from "./configs/http.config.js";
import { prisma } from "./libs/prisma.js";
import { handleAsyncError } from "./middlewares/async-handler.middleware.js";
import { authProtect } from "./middlewares/auth-protech.middleware.js";
import { handleGlobalError } from "./middlewares/global-error-handler.middleware.js";
import authRoutes from "./routes/auth.route.js";
import notesRoutes from "./routes/notes.route.js";

const app = express();

// Middleware: Parses JSON request bodies
// - Applies only to Content-Type: application/json
// - Attaches parsed payload to req.body
// - Payload size limit: 10MB
// - Invalid JSON → 400 Bad Request
app.use(express.json({ limit: "10mb" }));

// Config: Custom query parser using qs
// - Parses URL query strings into structured objects
// - Supports nested objects and arrays (qs.parse)
// - Overrides default Express query parser
app.set("query parser", function (queryString: string) {
    return qs.parse(queryString);
});

app.use(
    session({
        name: "g18-session",
        secret: config.SESSION_SECRET,
        resave: false,
        saveUninitialized: false,
        rolling: true,

        cookie: {
            // secure: ensures cookie is sent only over HTTPS in production
            // secure: runningOnProduction(),
            secure: runningOnProduction(),

            // httpOnly: prevents client-side JS access (mitigates XSS)
            httpOnly: true,

            // sameSite: "lax" → basic CSRF protection while allowing top-level navigation
            sameSite: "lax",

            // maxAge: session expiration time (7d)
            // After expiry → cookie invalid → session considered expired
            maxAge: ms(config.SESSION_EXPIRES_IN as msStringValue),
        },
    }),
);

// Middleware: Initializes Passport middleware
// - Attaches Passport to the request lifecycle
// - Adds helper methods: req.login(), req.logout(), req.isAuthenticated()
// - Does NOT persist login state (no session handling here)
app.use(passport.initialize());

// Middleware: Enables persistent login sessions (requires session middleware above)
// - Reads session data from the cookie
// - Calls passport.deserializeUser() on each request
// - Attaches the deserialized user to req.user
// - Maintains authentication state across requests
app.use(passport.session());

app.get(
    "/",
    handleAsyncError(async function (
        req: Request,
        res: Response,
        next: NextFunction,
    ): Promise<void> {
        res.status(HTTPSTATUSCODE.OK).json({
            message: "Welcome To TaskOrbit Server.",
        });
        return;
    }),
);

const BASE_PATH = config.BASE_PATH;
app.use(`${BASE_PATH}/auth`, authRoutes);
app.use(`${BASE_PATH}/notes`, authProtect, notesRoutes);

// Middleware: Global error handler with env-based responses
// - Routes errors to dev or prod handlers based on environment
app.use(handleGlobalError);

// Starts HTTP server on configured PORT and logs environment details
app.listen(config.PORT, async function () {
    console.log(`🛜 Server: http://localhost:${config.PORT} [env:${config.NODE_ENV}]`);
});
