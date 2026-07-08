-- CreateEnum
CREATE TYPE "NoteStatus" AS ENUM ('FRESH', 'TRASH');

-- CreateTable
CREATE TABLE "Notes" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "thumbnail" TEXT NOT NULL,
    "status" "NoteStatus" NOT NULL,

    CONSTRAINT "Notes_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Notes_title_key" ON "Notes"("title");
