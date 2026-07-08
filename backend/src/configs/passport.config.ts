import type { Request } from "express";
import type { Profile } from "passport";
import type { VerifyCallback } from "passport-google-oauth20";

import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { Strategy as LocalStrategy } from "passport-local";

import { ErrorCodeEnum } from "../enums/error-code.enum.js";
import { prisma } from "../libs/prisma.js";
import { ensureUserService } from "../services/user.service.js";
import { bcryptCompare } from "../utils/bcrypt.util.js";
import { AppError } from "../utils/errors/app-error.util.js";
import { config } from "./app.config.js";
import { HTTPSTATUSCODE } from "./http.config.js";

passport.use(
    new GoogleStrategy(
        {
            clientID: config.GOOGLE_CLIENT_ID,
            clientSecret: config.GOOGLE_CLIENT_SECRET,
            callbackURL: "http://localhost:8000/api/auth/google/callback",
            scope: ["profile", "email"],
            passReqToCallback: true,
        },
        async function (
            req: Request,
            accessToken: string,
            refreshToken: string,
            profile: Profile,
            done: VerifyCallback,
        ) {
            try {
                const email = profile.emails?.[0]?.value;
                const googleId = profile.id;
                const picture = profile.photos?.[0]?.value;
                const name = profile.displayName;
                console.log(email, googleId, picture);
                console.log(config.get_BACKEND_GOOGLE_CALLBACK_URL());

                if (!email) {
                    throw new AppError({
                        internalMessage: "Google profile missing email",
                        publicMessage: "Authentication failed. Email not available.",
                        statusCode: HTTPSTATUSCODE.UNAUTHORIZED,
                        errorCode: ErrorCodeEnum.AUTH_NOT_FOUND,
                    });
                }

                const user = await ensureUserService({
                    email: email,
                    name: name,
                    password: null,
                    profilePic: picture ?? null,
                    provider: "GOOGLE",
                });

                user.password = "__REMOVED__";

                done(null, user);
            } catch (error) {
                done(error, false);
            }
        },
    ),
);

passport.use(
    new LocalStrategy(
        {
            usernameField: "email",
            passwordField: "password",
            passReqToCallback: true,
        },
        async function localVerifyCallback(req: Request, email: string, password: string, done) {
            try {
                // Find User 1
                const user = await prisma.user.findUnique({
                    where: {
                        email: email,
                    },
                });

                if (!user) {
                    throw new AppError({
                        internalMessage: `No user found for email: ${email}`,
                        publicMessage: "Invalid email or password",
                        statusCode: HTTPSTATUSCODE.UNAUTHORIZED,
                        errorCode: ErrorCodeEnum.AUTH_NOT_FOUND,
                    });
                }

                if (user.provider === "GOOGLE") {
                    throw new AppError({
                        internalMessage: "user.provider = GOOGLE, trying to login with EMAIL",
                        publicMessage: "Try Login with GOOGLE",
                        statusCode: HTTPSTATUSCODE.BAD_REQUEST,
                        errorCode: ErrorCodeEnum.AUTH_NOT_FOUND,
                    });
                }
                const matchPassword = await bcryptCompare(password, user.password!);

                if (!matchPassword) {
                    throw new AppError({
                        publicMessage: "Invalid email or password",
                        internalMessage: `Password mismatch for userId: ${user.id}`,
                        statusCode: HTTPSTATUSCODE.UNAUTHORIZED,
                        errorCode: ErrorCodeEnum.AUTH_INVALID_CREDENTIALS,
                    });
                }

                user.password = "__REMOVED__";
                done(null, user);
            } catch (error) {
                done(error, false);
            }
        },
    ),
);

passport.serializeUser(function (user, done) {
    const userId = String((user as { id: string }).id);
    done(null, userId);
});

passport.deserializeUser(async function (id: string, done) {
    try {
        const user = await prisma.user.findUnique({ where: { id } });
        if (!user) {
            return done(null, false);
        }

        user.password = "__REMOVED__";
        done(null, user);
    } catch (error) {
        done(error, false);
    }
});
