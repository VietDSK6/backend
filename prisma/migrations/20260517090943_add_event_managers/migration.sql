-- CreateTable
CREATE TABLE "_EventManagers" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_EventManagers_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE INDEX "_EventManagers_B_index" ON "_EventManagers"("B");

-- AddForeignKey
ALTER TABLE "_EventManagers" ADD CONSTRAINT "_EventManagers_A_fkey" FOREIGN KEY ("A") REFERENCES "Event"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_EventManagers" ADD CONSTRAINT "_EventManagers_B_fkey" FOREIGN KEY ("B") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
