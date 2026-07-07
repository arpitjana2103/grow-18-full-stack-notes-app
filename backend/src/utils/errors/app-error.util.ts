import type { THttpStatusCode } from "../../configs/http.config.js";
import type { TErrorCodeEnum } from "../../enums/error-code.enum.js";

import { ErrorCodeEnum } from "../../enums/error-code.enum.js";

type AppErrorOptions = {
    publicMessage: string;
    internalMessage?: string;
    statusCode: THttpStatusCode;
    errorCode?: TErrorCodeEnum;
};

export class AppError extends Error {
    readonly statusCode: THttpStatusCode;
    readonly errorCode?: TErrorCodeEnum;

    readonly publicMessage: string;
    readonly internalMessage?: string | undefined;

    constructor({
        publicMessage,
        internalMessage = undefined,
        statusCode,
        errorCode = ErrorCodeEnum.UNKNOWN_ERROR,
    }: AppErrorOptions) {
        super(internalMessage || publicMessage);

        this.statusCode = statusCode;
        this.errorCode = errorCode;

        this.publicMessage = publicMessage;
        this.internalMessage = internalMessage;

        Error.captureStackTrace(this, this.constructor);
        /*
        Error.captureStackTrace(this, this.constructor) : Explanation
        -------------------------------------------------------------
        this → refers to the current instance of your AppError.
        this.constructor → refers to the AppError class itself.

        This tells JavaScript:
        "Start the stack trace from this point, and exclude everything above this constructor."
        */
    }
}
