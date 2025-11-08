import { sql } from "drizzle-orm";
import { pgTable, text, varchar, serial, integer, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  name: text("name"),
  email: text("email"),
  phone: text("phone"),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  name: true,
  email: true,
  phone: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export const topics = pgTable("topics", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id),
  title: text("title").notNull(),
  description: text("description"),
});

export const insertTopicSchema = createInsertSchema(topics).omit({
  id: true,
});

export type InsertTopic = z.infer<typeof insertTopicSchema>;
export type Topic = typeof topics.$inferSelect;

export const subtopics = pgTable("subtopics", {
  id: serial("id").primaryKey(),
  topicId: integer("topic_id").notNull().references(() => topics.id),
  title: text("title").notNull(),
  orderIndex: integer("order_index").notNull(),
}, (table) => ({
  uniqueTopicOrder: sql`UNIQUE (${table.topicId}, ${table.orderIndex})`,
}));

export const insertSubtopicSchema = createInsertSchema(subtopics).omit({
  id: true,
});

export type InsertSubtopic = z.infer<typeof insertSubtopicSchema>;
export type Subtopic = typeof subtopics.$inferSelect;

export const subtopicContent = pgTable("subtopic_content", {
  id: serial("id").primaryKey(),
  subtopicId: integer("subtopic_id").notNull().references(() => subtopics.id),
  explanation: text("explanation").notNull(),
  examples: text("examples").notNull(),
  quizQuestions: text("quiz_questions").notNull(),
});

export const insertSubtopicContentSchema = createInsertSchema(subtopicContent).omit({
  id: true,
});

export type InsertSubtopicContent = z.infer<typeof insertSubtopicContentSchema>;
export type SubtopicContent = typeof subtopicContent.$inferSelect;

export const userProgress = pgTable("user_progress", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id),
  subtopicId: integer("subtopic_id").notNull().references(() => subtopics.id),
  completed: boolean("completed").notNull().default(false),
  score: integer("score"),
});

export const insertUserProgressSchema = createInsertSchema(userProgress).omit({
  id: true,
});

export type InsertUserProgress = z.infer<typeof insertUserProgressSchema>;
export type UserProgress = typeof userProgress.$inferSelect;

export const quizAttempts = pgTable("quiz_attempts", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id),
  subtopicId: integer("subtopic_id").notNull().references(() => subtopics.id),
  topicId: integer("topic_id").notNull().references(() => topics.id),
  questionIndex: integer("question_index").notNull(),
  selectedAnswer: integer("selected_answer").notNull(),
  correctAnswer: integer("correct_answer").notNull(),
  isCorrect: boolean("is_correct").notNull(),
  attemptedAt: timestamp("attempted_at").notNull().defaultNow(),
});

export const insertQuizAttemptSchema = createInsertSchema(quizAttempts).omit({
  id: true,
  attemptedAt: true,
});

export type InsertQuizAttempt = z.infer<typeof insertQuizAttemptSchema>;
export type QuizAttempt = typeof quizAttempts.$inferSelect;
