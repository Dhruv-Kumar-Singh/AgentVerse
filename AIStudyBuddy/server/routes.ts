import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { generateSubtopics, generateSubtopicContent } from "./openai-service";
import { insertTopicSchema, insertUserProgressSchema, insertQuizAttemptSchema } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  app.post("/api/topics", async (req, res) => {
    try {
      const validated = insertTopicSchema.parse(req.body);

      const generatedSubtopics = await generateSubtopics(validated.title);

      if (generatedSubtopics.length === 0) {
        return res.status(500).json({ error: "Failed to generate subtopics" });
      }

      const topic = await storage.createTopic(validated);

      const subtopicPromises = generatedSubtopics.map((sub, index) =>
        storage.createSubtopic({
          topicId: topic.id,
          title: sub.title,
          orderIndex: index,
        })
      );

      const createdSubtopics = await Promise.all(subtopicPromises);

      res.json({
        topic,
        subtopics: createdSubtopics,
      });
    } catch (error) {
      console.error("Error creating topic:", error);
      
      if (error instanceof Error && error.name === "ZodError") {
        return res.status(400).json({ error: "Invalid request data" });
      }
      
      const message = error instanceof Error ? error.message : "Failed to create topic";
      res.status(500).json({ error: message });
    }
  });

  app.get("/api/topics/:id", async (req, res) => {
    try {
      const topicId = parseInt(req.params.id);
      
      const topic = await storage.getTopicById(topicId);
      if (!topic) {
        return res.status(404).json({ error: "Topic not found" });
      }

      const subtopics = await storage.getSubtopicsByTopicId(topicId);

      res.json({
        topic,
        subtopics,
      });
    } catch (error) {
      console.error("Error fetching topic:", error);
      res.status(500).json({ error: "Failed to fetch topic" });
    }
  });

  app.get("/api/topics", async (req, res) => {
    try {
      const { userId } = req.query;
      
      if (!userId || typeof userId !== "string") {
        return res.status(400).json({ error: "userId is required" });
      }

      const topics = await storage.getTopicsByUserId(userId);
      res.json(topics);
    } catch (error) {
      console.error("Error fetching topics:", error);
      res.status(500).json({ error: "Failed to fetch topics" });
    }
  });

  app.get("/api/subtopics/:id", async (req, res) => {
    try {
      const subtopicId = parseInt(req.params.id);
      
      const subtopic = await storage.getSubtopicById(subtopicId);
      if (!subtopic) {
        return res.status(404).json({ error: "Subtopic not found" });
      }

      res.json(subtopic);
    } catch (error) {
      console.error("Error fetching subtopic:", error);
      res.status(500).json({ error: "Failed to fetch subtopic" });
    }
  });

  app.get("/api/subtopics/:id/content", async (req, res) => {
    try {
      const subtopicId = parseInt(req.params.id);
      
      if (isNaN(subtopicId)) {
        return res.status(400).json({ error: "Invalid subtopic ID" });
      }
      
      const subtopic = await storage.getSubtopicById(subtopicId);
      if (!subtopic) {
        return res.status(404).json({ error: "Subtopic not found" });
      }

      let content = await storage.getSubtopicContentBySubtopicId(subtopicId);

      if (!content) {
        const topic = await storage.getTopicById(subtopic.topicId);
        if (!topic) {
          return res.status(404).json({ error: "Topic not found" });
        }

        const generatedContent = await generateSubtopicContent(
          topic.title,
          subtopic.title
        );

        content = await storage.createSubtopicContent({
          subtopicId,
          explanation: generatedContent.explanation,
          examples: generatedContent.examples,
          quizQuestions: JSON.stringify(generatedContent.quizQuestions),
        });
      }

      let quizQuestions;
      try {
        quizQuestions = JSON.parse(content.quizQuestions);
        if (!Array.isArray(quizQuestions)) {
          quizQuestions = [];
        }
      } catch (error) {
        console.error("Error parsing quiz questions:", error);
        quizQuestions = [];
      }

      res.json({
        ...content,
        quizQuestions,
      });
    } catch (error) {
      console.error("Error fetching subtopic content:", error);
      const message = error instanceof Error ? error.message : "Failed to fetch subtopic content";
      res.status(500).json({ error: message });
    }
  });

  app.post("/api/progress", async (req, res) => {
    try {
      const validated = insertUserProgressSchema.parse(req.body);
      const progress = await storage.createOrUpdateUserProgress(validated);
      res.json(progress);
    } catch (error) {
      console.error("Error saving progress:", error);
      res.status(500).json({ error: "Failed to save progress" });
    }
  });

  app.get("/api/progress", async (req, res) => {
    try {
      const { userId } = req.query;
      
      if (!userId || typeof userId !== "string") {
        return res.status(400).json({ error: "userId is required" });
      }

      const progress = await storage.getUserProgressByUserId(userId);
      res.json(progress);
    } catch (error) {
      console.error("Error fetching progress:", error);
      res.status(500).json({ error: "Failed to fetch progress" });
    }
  });

  app.post("/api/quiz-attempts", async (req, res) => {
    try {
      const validated = insertQuizAttemptSchema.parse(req.body);
      const attempt = await storage.createQuizAttempt(validated);
      res.json(attempt);
    } catch (error) {
      console.error("Error saving quiz attempt:", error);
      res.status(500).json({ error: "Failed to save quiz attempt" });
    }
  });

  app.get("/api/quiz-attempts/:userId", async (req, res) => {
    try {
      const { userId } = req.params;
      const attempts = await storage.getQuizAttemptsByUserId(userId);
      res.json(attempts);
    } catch (error) {
      console.error("Error fetching quiz attempts:", error);
      res.status(500).json({ error: "Failed to fetch quiz attempts" });
    }
  });

  app.get("/api/users/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const user = await storage.getUser(id);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
      const { password, ...userWithoutPassword } = user;
      res.json(userWithoutPassword);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ error: "Failed to fetch user" });
    }
  });

  app.patch("/api/users/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const updateSchema = z.object({
        name: z.string().optional(),
        email: z.string().email().optional(),
        phone: z.string().optional(),
      });
      const validated = updateSchema.parse(req.body);
      const user = await storage.updateUser(id, validated);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
      const { password, ...userWithoutPassword } = user;
      res.json(userWithoutPassword);
    } catch (error) {
      console.error("Error updating user:", error);
      res.status(500).json({ error: "Failed to update user" });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
