import type { Request, Response, NextFunction } from "express";

import { HTTPSTATUSCODE } from "../configs/http.config.js";
import { prisma } from "../libs/prisma.js";
import { handleAsyncError } from "../middlewares/async-handler.middleware.js";
import { sendResponse } from "../utils/response.util.js";
import { createNoteSchema, updateNoteSchema } from "../validations/note.validation.js";

export const createNotes = handleAsyncError(async function (
    req: Request,
    res: Response,
    next: NextFunction,
) {
    const { title, description, thumbnail } = createNoteSchema.parse({ ...req.body });
    const note = await prisma.notes.create({
        data: {
            title: title,
            description: description,
            thumbnail: thumbnail,
            userId: req.user!.id,
        },
    });

    sendResponse(res, {
        statusCode: HTTPSTATUSCODE.OK,
        status: "success",
        message: "Note created successfully",
        data: {
            note: note,
        },
    });
});

export const getNotes = handleAsyncError(async function (
    req: Request,
    res: Response,
    next: NextFunction,
) {
    const { search } = req.query;
    const notes = await prisma.notes.findMany({
        where: {
            userId: req.user!.id,
            title: {
                contains: String(search ?? ""),
                mode: "insensitive",
            },
        },
    });

    sendResponse(res, {
        statusCode: HTTPSTATUSCODE.OK,
        status: "success",
        message: "Notes found successfully",
        data: {
            notes: notes,
        },
    });
});

export const updateNotes = handleAsyncError(async function (
    req: Request,
    res: Response,
    next: NextFunction,
) {
    const { title, description, thumbnail } = updateNoteSchema.parse({ ...req.body });
    const { id } = req.params;
    const note = await prisma.notes.update({
        where: {
            id: id as string,
        },
        data: {
            ...(title !== undefined && { title }),
            ...(description !== undefined && { description }),
            ...(thumbnail !== undefined && { thumbnail }),
        },
    });

    sendResponse(res, {
        statusCode: HTTPSTATUSCODE.OK,
        status: "success",
        message: "Note updated successfully",
        data: {
            note: note,
        },
    });
});

export const deleteNote = handleAsyncError(async function (
    req: Request,
    res: Response,
    next: NextFunction,
) {
    const { id } = req.params;
    await prisma.notes.delete({
        where: {
            id: id as string,
        },
    });

    sendResponse(res, {
        statusCode: HTTPSTATUSCODE.OK,
        status: "success",
        message: "Note deleted successfully",
    });
});
