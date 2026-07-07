import pino from "pino";

export const logger = pino({
    level: "info",
    transport: {
        target: "pino-pretty",
        options: {
            colorize: true,
            translateTime: "SYS:standard",
            ignore: "pid,hostname",
        },
    },
});

/*
| Level   | Value | Use case                 |
| ------- | ----- | ------------------------ |
| `fatal` | 60    | App crash, unrecoverable |
| `error` | 50    | Failed operation         |
| `warn`  | 40    | Unexpected but handled   |
| `info`  | 30    | Normal events            |
| `debug` | 20    | Dev debugging            |
| `trace` | 10    | Very detailed, noisy     |

fatal > error > warn > info > debug > trace
Higher number = more severe

logger.fatal("System crash");
logger.error({ err }, "DB failed");
logger.warn("Cache miss");
logger.info("Server started");
logger.debug("User payload", { user });
logger.trace("Function entry");
*/
