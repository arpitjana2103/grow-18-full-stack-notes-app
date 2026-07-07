import type { ZodError } from "zod";

import stringify from "safe-stable-stringify";

export function formatZodError(error: ZodError): Record<string, unknown> {
    const fieldErrors: Record<string, string[]> = {};

    for (const issue of error.issues) {
        const key = issue.path.join(".") || "root";

        if (!fieldErrors[key]) {
            fieldErrors[key] = [];
        }

        fieldErrors[key].push(issue.message);
    }

    return {
        type: "validation_error",
        errors: fieldErrors,
    };
}

export function getErrorMessage(error: unknown): string {
    if (error instanceof Error) return error.message;

    if (typeof error === "object" && error !== null) {
        return stringify(error);
    }

    return String(error);
}
