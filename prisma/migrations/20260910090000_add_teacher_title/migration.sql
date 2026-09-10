CREATE TYPE "TeacherTitle" AS ENUM ('SIR', 'MAAM');

ALTER TABLE "TeacherProfile"
ADD COLUMN "title" "TeacherTitle";