-- Add optional teacher title for personalized CoTeacher greetings.
CREATE TYPE "TeacherTitle" AS ENUM ('SIR', 'MAAM');
ALTER TABLE "TeacherProfile" ADD COLUMN "title" "TeacherTitle";
