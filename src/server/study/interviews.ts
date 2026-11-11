import { desc, eq } from "drizzle-orm";
import { mockInterviews } from "@/server/db/schema/study";
import { recordActivity, type StudyDb } from "./db";

export type InterviewInput = Omit<typeof mockInterviews.$inferInsert, "userId" | "createdAt">;

/** Últimas 30 entrevistas simuladas do usuário. */
export async function listInterviews(db: StudyDb, userId: string) {
  return db
    .select()
    .from(mockInterviews)
    .where(eq(mockInterviews.userId, userId))
    .orderBy(desc(mockInterviews.createdAt))
    .limit(30);
}

/** Idempotente pelo id do próprio usuário; um id de outro usuário é ignorado (não sobrescreve nada). */
export async function saveInterview(db: StudyDb, userId: string, input: InterviewInput): Promise<void> {
  const inserted = await db
    .insert(mockInterviews)
    .values({ ...input, userId })
    .onConflictDoNothing()
    .returning({ id: mockInterviews.id });
  if (inserted.length) await recordActivity(db, userId);
}

