import type { ZodError } from "zod";

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
