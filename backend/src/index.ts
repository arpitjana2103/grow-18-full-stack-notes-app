import "dotenv/config";

import type { Request, Response, NextFunction } from "express";

import express from "express";
import qs from "qs";

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

app.get("/", function (req: Request, res: Response, next: NextFunction) {
    return res.status(200).json({
        message: "Welcome to server",
    });
});

app.listen(3000, function () {
    console.log(`🛜 Server: http://localhost:3000`);
});
