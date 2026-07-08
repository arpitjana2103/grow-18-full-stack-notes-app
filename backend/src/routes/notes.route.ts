import { Router } from "express";

import { createNotes, deleteNote, getNotes, updateNotes } from "../controllers/notes.controller.js";

const notesRoutes = Router();

notesRoutes.route("/").get(getNotes).post(createNotes);
notesRoutes.route("/:id").delete(deleteNote).post(updateNotes);

export default notesRoutes;
