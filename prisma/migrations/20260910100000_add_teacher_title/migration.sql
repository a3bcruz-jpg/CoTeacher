-- Add optional teacher title for personalized CoTeacher greetings.
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'TeacherTitle') THEN
    CREATE TYPE "TeacherTitle" AS ENUM ('SIR', 'MAAM');
  END IF;
END $$;

ALTER TABLE "TeacherProfile"
  ADD COLUMN IF NOT EXISTS "title" "TeacherTitle";
