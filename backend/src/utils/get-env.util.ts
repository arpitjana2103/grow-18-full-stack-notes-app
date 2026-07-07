// Util: Retrieves environment variable
// - Returns value from process.env by key
// - Uses defaultValue if key is undefined
export const getEnv = function (key: string, defaultValue: string = ""): string {
    const value = process.env[key];
    if (value === undefined) {
        if (defaultValue) {
            return defaultValue;
        }
        throw new Error(`Environment variable ${key} is not set`);
    }
    return value;
};
