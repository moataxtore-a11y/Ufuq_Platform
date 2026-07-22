-- =============================================
-- Supabase Full Schema + Seed
-- Idempotent – safe to run multiple times
-- =============================================

CREATE SCHEMA IF NOT EXISTS "public";

-- Tables
CREATE TABLE IF NOT EXISTS "User" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "teamId" TEXT,
    "teamTask" TEXT NOT NULL DEFAULT '',
    "teamPermissions" JSONB,
    "studentId" TEXT,
    "profile" JSONB,
    "isSuspended" BOOLEAN NOT NULL DEFAULT false,
    "suspendedAt" TIMESTAMP(3),
    "suspendedBy" TEXT,
    "suspendedReason" TEXT NOT NULL DEFAULT '',
    "emailChange" JSONB,
    "passwordReset" JSONB,
    "mustChangePassword" BOOLEAN NOT NULL DEFAULT false,
    "status" TEXT NOT NULL DEFAULT 'approved',
    "approvedAt" TIMESTAMP(3),
    "approvedBy" TEXT,
    "rejectionReason" TEXT,
    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "Course" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL DEFAULT '',
    "thumbnailUrl" TEXT NOT NULL DEFAULT '',
    "isHiddenFromStudents" BOOLEAN NOT NULL DEFAULT false,
    "pinnedAt" TIMESTAMP(3),
    "isIndividual" BOOLEAN NOT NULL DEFAULT false,
    "courseType" TEXT NOT NULL DEFAULT 'monthly',
    "isFree" BOOLEAN NOT NULL DEFAULT false,
    "price" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "discountPercent" INTEGER NOT NULL DEFAULT 0,
    "section" TEXT NOT NULL DEFAULT '',
    "gradeYear" TEXT NOT NULL DEFAULT '',
    "teacherId" TEXT NOT NULL,
    CONSTRAINT "Course_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "CourseEnrollment" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "courseId" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    CONSTRAINT "CourseEnrollment_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "Unit" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "courseId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL DEFAULT '',
    "order" INTEGER NOT NULL DEFAULT 0,
    CONSTRAINT "Unit_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "Lesson" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "unitId" TEXT NOT NULL,
    "kind" TEXT NOT NULL DEFAULT 'lesson',
    "title" TEXT NOT NULL,
    "isFree" BOOLEAN NOT NULL DEFAULT false,
    "coverImageUrl" TEXT NOT NULL DEFAULT '',
    "videoUrl" TEXT NOT NULL DEFAULT '',
    "videoPublicId" TEXT NOT NULL DEFAULT '',
    "pdfUrl" TEXT NOT NULL DEFAULT '',
    "imageUrls" JSONB,
    "contentSections" JSONB,
    "assessmentId" TEXT,
    "gateAssessmentId" TEXT,
    "gateNextLessons" BOOLEAN NOT NULL DEFAULT false,
    "order" INTEGER NOT NULL DEFAULT 0,
    CONSTRAINT "Lesson_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "Assignment" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "courseId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL DEFAULT '',
    "dueAt" TIMESTAMP(3),
    "createdBy" TEXT,
    CONSTRAINT "Assignment_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "Submission" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "assignmentId" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "contentUrl" TEXT NOT NULL,
    "submittedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Submission_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "Grade" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "submissionId" TEXT NOT NULL,
    "assignmentId" TEXT NOT NULL,
    "courseId" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "correctedBy" TEXT NOT NULL,
    "score" DOUBLE PRECISION NOT NULL,
    "feedback" TEXT NOT NULL DEFAULT '',
    CONSTRAINT "Grade_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "Assessment" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "type" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL DEFAULT '',
    "courseId" TEXT,
    "unitId" TEXT,
    "lessonId" TEXT,
    "durationMinutes" INTEGER,
    "startAt" TIMESTAMP(3),
    "endAt" TIMESTAMP(3),
    "attemptLimit" INTEGER,
    "showCorrectAnswersPolicy" TEXT NOT NULL DEFAULT 'never',
    "releaseScorePolicy" TEXT NOT NULL DEFAULT 'immediate',
    "questions" JSONB,
    "createdById" TEXT NOT NULL,
    CONSTRAINT "Assessment_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "AssessmentAttempt" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "assessmentId" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "startedAt" TIMESTAMP(3) NOT NULL,
    "submittedAt" TIMESTAMP(3),
    "status" TEXT NOT NULL DEFAULT 'in_progress',
    "answers" JSONB,
    "score" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "maxScore" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "autoGradedScore" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "manualGradedScore" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "gradedAt" TIMESTAMP(3),
    "gradedBy" TEXT,
    "feedback" TEXT,
    CONSTRAINT "AssessmentAttempt_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "CourseAccessCode" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "code" TEXT NOT NULL,
    "courseId" TEXT NOT NULL,
    "maxUses" INTEGER NOT NULL DEFAULT 1,
    "usedCount" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "lastUsedAt" TIMESTAMP(3),
    "lastUsedBy" TEXT,
    CONSTRAINT "CourseAccessCode_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "CourseDiscountCode" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "code" TEXT NOT NULL,
    "courseId" TEXT NOT NULL,
    "discountPercent" INTEGER NOT NULL,
    "maxUses" INTEGER,
    "usedCount" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "expiresAt" TIMESTAMP(3),
    CONSTRAINT "CourseDiscountCode_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "JoinTeacherApplication" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "firstName" TEXT NOT NULL,
    "secondName" TEXT NOT NULL,
    "thirdName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "nationalId" TEXT NOT NULL,
    "governorate" TEXT NOT NULL DEFAULT '',
    "jobTitle" TEXT NOT NULL DEFAULT '',
    "subject" TEXT NOT NULL DEFAULT '',
    "expectedSalary" TEXT NOT NULL DEFAULT '',
    "notes" TEXT NOT NULL DEFAULT '',
    "cvUrl" TEXT NOT NULL DEFAULT '',
    "photoUrl" TEXT NOT NULL DEFAULT '',
    "assignedTeamId" TEXT,
    "assignedById" TEXT,
    "assignedAt" TIMESTAMP(3),
    CONSTRAINT "JoinTeacherApplication_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "MotivationalMessage" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "title" TEXT NOT NULL DEFAULT '',
    "body" TEXT NOT NULL DEFAULT '',
    "ctaLabel" TEXT NOT NULL DEFAULT '',
    "ctaUrl" TEXT NOT NULL DEFAULT '',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "updatedBy" TEXT,
    CONSTRAINT "MotivationalMessage_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "StudentLessonProgress" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "studentId" TEXT NOT NULL,
    "courseId" TEXT NOT NULL,
    "lessonId" TEXT NOT NULL,
    "openedAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    CONSTRAINT "StudentLessonProgress_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "StudentVideoProgress" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "studentId" TEXT NOT NULL,
    "courseId" TEXT NOT NULL,
    "lessonId" TEXT NOT NULL,
    "videoUrl" TEXT NOT NULL,
    "totalSecondsWatched" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "lastPositionSeconds" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "lastDurationSeconds" DOUBLE PRECISION NOT NULL DEFAULT 0,
    CONSTRAINT "StudentVideoProgress_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "StudentMessageDismissal" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" TEXT NOT NULL,
    "messageId" TEXT NOT NULL,
    "dismissedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "StudentMessageDismissal_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "WalletTransaction" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "description" TEXT NOT NULL DEFAULT '',
    "referenceType" TEXT NOT NULL DEFAULT '',
    "referenceId" TEXT NOT NULL DEFAULT '',
    "balanceBefore" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "balanceAfter" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "status" TEXT NOT NULL DEFAULT 'completed',
    CONSTRAINT "WalletTransaction_pkey" PRIMARY KEY ("id")
);

-- Indexes (IF NOT EXISTS not supported for CREATE INDEX in PG < 9.5, but Supabase is fine)
CREATE UNIQUE INDEX IF NOT EXISTS "User_email_key" ON "User"("email");
CREATE UNIQUE INDEX IF NOT EXISTS "User_studentId_key" ON "User"("studentId");
CREATE INDEX IF NOT EXISTS "User_teamId_idx" ON "User"("teamId");
CREATE INDEX IF NOT EXISTS "User_role_idx" ON "User"("role");
CREATE INDEX IF NOT EXISTS "User_status_idx" ON "User"("status");

CREATE INDEX IF NOT EXISTS "Course_teacherId_idx" ON "Course"("teacherId");
CREATE INDEX IF NOT EXISTS "CourseEnrollment_studentId_idx" ON "CourseEnrollment"("studentId");
CREATE UNIQUE INDEX IF NOT EXISTS "CourseEnrollment_courseId_studentId_key" ON "CourseEnrollment"("courseId", "studentId");

CREATE INDEX IF NOT EXISTS "Unit_courseId_idx" ON "Unit"("courseId");

CREATE INDEX IF NOT EXISTS "Lesson_unitId_idx" ON "Lesson"("unitId");
CREATE INDEX IF NOT EXISTS "Lesson_kind_idx" ON "Lesson"("kind");

CREATE INDEX IF NOT EXISTS "Assignment_courseId_idx" ON "Assignment"("courseId");

CREATE INDEX IF NOT EXISTS "Submission_assignmentId_idx" ON "Submission"("assignmentId");
CREATE INDEX IF NOT EXISTS "Submission_studentId_idx" ON "Submission"("studentId");
CREATE UNIQUE INDEX IF NOT EXISTS "Submission_assignmentId_studentId_key" ON "Submission"("assignmentId", "studentId");

CREATE UNIQUE INDEX IF NOT EXISTS "Grade_submissionId_key" ON "Grade"("submissionId");
CREATE INDEX IF NOT EXISTS "Grade_assignmentId_idx" ON "Grade"("assignmentId");
CREATE INDEX IF NOT EXISTS "Grade_courseId_idx" ON "Grade"("courseId");
CREATE INDEX IF NOT EXISTS "Grade_studentId_idx" ON "Grade"("studentId");
CREATE INDEX IF NOT EXISTS "Grade_correctedBy_idx" ON "Grade"("correctedBy");

CREATE INDEX IF NOT EXISTS "Assessment_courseId_idx" ON "Assessment"("courseId");
CREATE INDEX IF NOT EXISTS "Assessment_unitId_idx" ON "Assessment"("unitId");
CREATE INDEX IF NOT EXISTS "Assessment_lessonId_idx" ON "Assessment"("lessonId");
CREATE INDEX IF NOT EXISTS "Assessment_createdById_idx" ON "Assessment"("createdById");

CREATE INDEX IF NOT EXISTS "AssessmentAttempt_assessmentId_idx" ON "AssessmentAttempt"("assessmentId");
CREATE INDEX IF NOT EXISTS "AssessmentAttempt_studentId_idx" ON "AssessmentAttempt"("studentId");
CREATE INDEX IF NOT EXISTS "AssessmentAttempt_assessmentId_studentId_createdAt_idx" ON "AssessmentAttempt"("assessmentId", "studentId", "createdAt");

CREATE UNIQUE INDEX IF NOT EXISTS "CourseAccessCode_code_key" ON "CourseAccessCode"("code");
CREATE INDEX IF NOT EXISTS "CourseAccessCode_code_idx" ON "CourseAccessCode"("code");
CREATE INDEX IF NOT EXISTS "CourseAccessCode_courseId_idx" ON "CourseAccessCode"("courseId");

CREATE UNIQUE INDEX IF NOT EXISTS "CourseDiscountCode_code_key" ON "CourseDiscountCode"("code");
CREATE INDEX IF NOT EXISTS "CourseDiscountCode_code_idx" ON "CourseDiscountCode"("code");
CREATE INDEX IF NOT EXISTS "CourseDiscountCode_courseId_idx" ON "CourseDiscountCode"("courseId");

CREATE INDEX IF NOT EXISTS "JoinTeacherApplication_email_idx" ON "JoinTeacherApplication"("email");
CREATE INDEX IF NOT EXISTS "JoinTeacherApplication_assignedTeamId_idx" ON "JoinTeacherApplication"("assignedTeamId");

CREATE INDEX IF NOT EXISTS "MotivationalMessage_isActive_idx" ON "MotivationalMessage"("isActive");

CREATE INDEX IF NOT EXISTS "StudentLessonProgress_studentId_idx" ON "StudentLessonProgress"("studentId");
CREATE INDEX IF NOT EXISTS "StudentLessonProgress_courseId_idx" ON "StudentLessonProgress"("courseId");
CREATE UNIQUE INDEX IF NOT EXISTS "StudentLessonProgress_studentId_courseId_lessonId_key" ON "StudentLessonProgress"("studentId", "courseId", "lessonId");

CREATE INDEX IF NOT EXISTS "StudentVideoProgress_studentId_idx" ON "StudentVideoProgress"("studentId");
CREATE INDEX IF NOT EXISTS "StudentVideoProgress_courseId_idx" ON "StudentVideoProgress"("courseId");
CREATE UNIQUE INDEX IF NOT EXISTS "StudentVideoProgress_studentId_courseId_lessonId_videoUrl_key" ON "StudentVideoProgress"("studentId", "courseId", "lessonId", "videoUrl");

CREATE INDEX IF NOT EXISTS "StudentMessageDismissal_userId_idx" ON "StudentMessageDismissal"("userId");
CREATE INDEX IF NOT EXISTS "StudentMessageDismissal_messageId_idx" ON "StudentMessageDismissal"("messageId");
CREATE UNIQUE INDEX IF NOT EXISTS "StudentMessageDismissal_userId_messageId_key" ON "StudentMessageDismissal"("userId", "messageId");

CREATE INDEX IF NOT EXISTS "WalletTransaction_userId_createdAt_idx" ON "WalletTransaction"("userId", "createdAt");

-- Foreign Keys (use DO blocks to avoid errors if constraint already exists)
DO $$ BEGIN
    ALTER TABLE "User" ADD CONSTRAINT "User_suspendedBy_fkey" FOREIGN KEY ("suspendedBy") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
DO $$ BEGIN
    ALTER TABLE "User" ADD CONSTRAINT "User_approvedBy_fkey" FOREIGN KEY ("approvedBy") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
DO $$ BEGIN
    ALTER TABLE "Course" ADD CONSTRAINT "Course_teacherId_fkey" FOREIGN KEY ("teacherId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
DO $$ BEGIN
    ALTER TABLE "CourseEnrollment" ADD CONSTRAINT "CourseEnrollment_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "Course"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
DO $$ BEGIN
    ALTER TABLE "CourseEnrollment" ADD CONSTRAINT "CourseEnrollment_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
DO $$ BEGIN
    ALTER TABLE "Unit" ADD CONSTRAINT "Unit_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "Course"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
DO $$ BEGIN
    ALTER TABLE "Lesson" ADD CONSTRAINT "Lesson_unitId_fkey" FOREIGN KEY ("unitId") REFERENCES "Unit"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
DO $$ BEGIN
    ALTER TABLE "Assignment" ADD CONSTRAINT "Assignment_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "Course"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
DO $$ BEGIN
    ALTER TABLE "Assignment" ADD CONSTRAINT "Assignment_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
DO $$ BEGIN
    ALTER TABLE "Submission" ADD CONSTRAINT "Submission_assignmentId_fkey" FOREIGN KEY ("assignmentId") REFERENCES "Assignment"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
DO $$ BEGIN
    ALTER TABLE "Submission" ADD CONSTRAINT "Submission_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
DO $$ BEGIN
    ALTER TABLE "Grade" ADD CONSTRAINT "Grade_submissionId_fkey" FOREIGN KEY ("submissionId") REFERENCES "Submission"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
DO $$ BEGIN
    ALTER TABLE "Grade" ADD CONSTRAINT "Grade_assignmentId_fkey" FOREIGN KEY ("assignmentId") REFERENCES "Assignment"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
DO $$ BEGIN
    ALTER TABLE "Grade" ADD CONSTRAINT "Grade_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "Course"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
DO $$ BEGIN
    ALTER TABLE "Grade" ADD CONSTRAINT "Grade_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
DO $$ BEGIN
    ALTER TABLE "Grade" ADD CONSTRAINT "Grade_correctedBy_fkey" FOREIGN KEY ("correctedBy") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
DO $$ BEGIN
    ALTER TABLE "Assessment" ADD CONSTRAINT "Assessment_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
DO $$ BEGIN
    ALTER TABLE "Assessment" ADD CONSTRAINT "Assessment_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "Course"("id") ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
DO $$ BEGIN
    ALTER TABLE "AssessmentAttempt" ADD CONSTRAINT "AssessmentAttempt_assessmentId_fkey" FOREIGN KEY ("assessmentId") REFERENCES "Assessment"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
DO $$ BEGIN
    ALTER TABLE "AssessmentAttempt" ADD CONSTRAINT "AssessmentAttempt_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
DO $$ BEGIN
    ALTER TABLE "JoinTeacherApplication" ADD CONSTRAINT "JoinTeacherApplication_assignedById_fkey" FOREIGN KEY ("assignedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
DO $$ BEGIN
    ALTER TABLE "StudentLessonProgress" ADD CONSTRAINT "StudentLessonProgress_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
DO $$ BEGIN
    ALTER TABLE "StudentLessonProgress" ADD CONSTRAINT "StudentLessonProgress_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "Course"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
DO $$ BEGIN
    ALTER TABLE "StudentLessonProgress" ADD CONSTRAINT "StudentLessonProgress_lessonId_fkey" FOREIGN KEY ("lessonId") REFERENCES "Lesson"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
DO $$ BEGIN
    ALTER TABLE "StudentVideoProgress" ADD CONSTRAINT "StudentVideoProgress_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
DO $$ BEGIN
    ALTER TABLE "StudentVideoProgress" ADD CONSTRAINT "StudentVideoProgress_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "Course"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
DO $$ BEGIN
    ALTER TABLE "StudentVideoProgress" ADD CONSTRAINT "StudentVideoProgress_lessonId_fkey" FOREIGN KEY ("lessonId") REFERENCES "Lesson"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
DO $$ BEGIN
    ALTER TABLE "StudentMessageDismissal" ADD CONSTRAINT "StudentMessageDismissal_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
DO $$ BEGIN
    ALTER TABLE "StudentMessageDismissal" ADD CONSTRAINT "StudentMessageDismissal_messageId_fkey" FOREIGN KEY ("messageId") REFERENCES "MotivationalMessage"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Seed: Default Admin (only if no admin exists)
INSERT INTO "User" (id, "createdAt", "updatedAt", name, email, password, role, "mustChangePassword", status)
SELECT gen_random_uuid()::text, NOW(), NOW(), 'Default Admin', 'admin@school.local', '$2b$12$jeweclHR0GDzxmWD.4QQWeTtpJWUKjIcLBxZGPpoUdBoOWZJU/izS', 'admin', true, 'approved'
WHERE NOT EXISTS (SELECT 1 FROM "User" WHERE role = 'admin');
