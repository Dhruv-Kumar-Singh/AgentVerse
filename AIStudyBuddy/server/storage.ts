import { 
  type User, 
  type InsertUser,
  type Topic,
  type InsertTopic,
  type Subtopic,
  type InsertSubtopic,
  type SubtopicContent,
  type InsertSubtopicContent,
  type UserProgress,
  type InsertUserProgress,
  type QuizAttempt,
  type InsertQuizAttempt,
} from "@shared/schema";
import { db } from "./db";
import { users, topics, subtopics, subtopicContent, userProgress, quizAttempts } from "@shared/schema";
import { eq, and } from "drizzle-orm";

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: string, updates: Partial<Pick<User, "name" | "email" | "phone">>): Promise<User | undefined>;
  
  createTopic(topic: InsertTopic): Promise<Topic>;
  getTopicById(id: number): Promise<Topic | undefined>;
  getTopicsByUserId(userId: string): Promise<Topic[]>;
  
  createSubtopic(subtopic: InsertSubtopic): Promise<Subtopic>;
  getSubtopicsByTopicId(topicId: number): Promise<Subtopic[]>;
  getSubtopicById(id: number): Promise<Subtopic | undefined>;
  
  createSubtopicContent(content: InsertSubtopicContent): Promise<SubtopicContent>;
  getSubtopicContentBySubtopicId(subtopicId: number): Promise<SubtopicContent | undefined>;
  
  createOrUpdateUserProgress(progress: InsertUserProgress): Promise<UserProgress>;
  getUserProgressByUserAndSubtopic(userId: string, subtopicId: number): Promise<UserProgress | undefined>;
  getUserProgressByUserId(userId: string): Promise<UserProgress[]>;
  
  createQuizAttempt(attempt: InsertQuizAttempt): Promise<QuizAttempt>;
  getQuizAttemptsByUserId(userId: string): Promise<QuizAttempt[]>;
}

export class DbStorage implements IStorage {
  async getUser(id: string): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.id, id));
    return result[0];
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.username, username));
    return result[0];
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const result = await db.insert(users).values(insertUser).returning();
    return result[0];
  }

  async createTopic(insertTopic: InsertTopic): Promise<Topic> {
    const result = await db.insert(topics).values(insertTopic).returning();
    return result[0];
  }

  async getTopicById(id: number): Promise<Topic | undefined> {
    const result = await db.select().from(topics).where(eq(topics.id, id));
    return result[0];
  }

  async getTopicsByUserId(userId: string): Promise<Topic[]> {
    return db.select().from(topics).where(eq(topics.userId, userId));
  }

  async createSubtopic(insertSubtopic: InsertSubtopic): Promise<Subtopic> {
    const result = await db.insert(subtopics).values(insertSubtopic).returning();
    return result[0];
  }

  async getSubtopicsByTopicId(topicId: number): Promise<Subtopic[]> {
    return db.select().from(subtopics).where(eq(subtopics.topicId, topicId));
  }

  async getSubtopicById(id: number): Promise<Subtopic | undefined> {
    const result = await db.select().from(subtopics).where(eq(subtopics.id, id));
    return result[0];
  }

  async createSubtopicContent(insertContent: InsertSubtopicContent): Promise<SubtopicContent> {
    const result = await db.insert(subtopicContent).values(insertContent).returning();
    return result[0];
  }

  async getSubtopicContentBySubtopicId(subtopicId: number): Promise<SubtopicContent | undefined> {
    const result = await db.select().from(subtopicContent).where(eq(subtopicContent.subtopicId, subtopicId));
    return result[0];
  }

  async createOrUpdateUserProgress(insertProgress: InsertUserProgress): Promise<UserProgress> {
    const existing = await db.select().from(userProgress).where(
      and(
        eq(userProgress.userId, insertProgress.userId),
        eq(userProgress.subtopicId, insertProgress.subtopicId)
      )
    );

    if (existing.length > 0) {
      const result = await db.update(userProgress)
        .set({
          completed: insertProgress.completed,
          score: insertProgress.score,
        })
        .where(eq(userProgress.id, existing[0].id))
        .returning();
      return result[0];
    } else {
      const result = await db.insert(userProgress).values(insertProgress).returning();
      return result[0];
    }
  }

  async getUserProgressByUserAndSubtopic(userId: string, subtopicId: number): Promise<UserProgress | undefined> {
    const result = await db.select().from(userProgress).where(
      and(
        eq(userProgress.userId, userId),
        eq(userProgress.subtopicId, subtopicId)
      )
    );
    return result[0];
  }

  async getUserProgressByUserId(userId: string): Promise<UserProgress[]> {
    return db.select().from(userProgress).where(eq(userProgress.userId, userId));
  }

  async updateUser(id: string, updates: Partial<Pick<User, "name" | "email" | "phone">>): Promise<User | undefined> {
    const result = await db.update(users)
      .set(updates)
      .where(eq(users.id, id))
      .returning();
    return result[0];
  }

  async createQuizAttempt(insertAttempt: InsertQuizAttempt): Promise<QuizAttempt> {
    const result = await db.insert(quizAttempts).values(insertAttempt).returning();
    return result[0];
  }

  async getQuizAttemptsByUserId(userId: string): Promise<QuizAttempt[]> {
    return db.select().from(quizAttempts).where(eq(quizAttempts.userId, userId));
  }
}

export const storage = new DbStorage();
