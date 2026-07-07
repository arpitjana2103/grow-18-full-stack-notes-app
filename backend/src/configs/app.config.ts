import { getEnv } from "../utils/get-env.util.js";

export const config = {
    NODE_ENV: getEnv("NODE_ENV"),
    PORT: getEnv("PORT"),

    SESSION_SECRET: getEnv("SESSION_SECRET"),
    SESSION_EXPIRES_IN: getEnv("SESSION_EXPIRES_IN"),
};

export const runningOnProduction = function (): boolean {
    return config.NODE_ENV === "production";
};

export const runningOnDevelopment = function (): boolean {
    return config.NODE_ENV === "development";
};
