import { getEnv } from "../utils/get-env.util.js";

export const config = {
    NODE_ENV: getEnv("NODE_ENV"),
    PORT: getEnv("PORT"),

    SESSION_SECRET: getEnv("SESSION_SECRET"),
    SESSION_EXPIRES_IN: getEnv("SESSION_EXPIRES_IN"),

    GOOGLE_CLIENT_ID: getEnv("GOOGLE_CLIENT_ID"),
    GOOGLE_CLIENT_SECRET: getEnv("GOOGLE_CLIENT_SECRET"),
    BASE_PATH: getEnv("BASE_PATH", "/api"),

    BACKEND_ORIGIN: getEnv("BACKEND_ORIGIN"),
    get_BACKEND_GOOGLE_CALLBACK_URL: function (): string {
        return getEnv("BACKEND_GOOGLE_CALLBACK_URL").replace(
            "<backend_origin>",
            this.BACKEND_ORIGIN,
        );
    },

    FRONTEND_ORIGIN: getEnv("FRONTEND_ORIGIN"),
    get_FRONTEND_GOOGLE_CALLBACK_URL: function (): string {
        return getEnv("FRONTEND_GOOGLE_CALLBACK_URL").replace(
            "<frontend_origin>",
            this.FRONTEND_ORIGIN,
        );
    },
};

export const runningOnProduction = function (): boolean {
    return config.NODE_ENV === "production";
};

export const runningOnDevelopment = function (): boolean {
    return config.NODE_ENV === "development";
};
