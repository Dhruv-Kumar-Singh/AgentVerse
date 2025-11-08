import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export interface GeneratedSubtopic {
  title: string;
}

export interface GeneratedContent {
  explanation: string;
  examples: string;
  quizQuestions: QuizQuestion[];
}

export interface QuizQuestion {
  question: string;
  options: string[];
  correctAnswer: number;
}

export async function generateSubtopics(topic: string): Promise<GeneratedSubtopic[]> {
  const prompt = `You are an expert educator. Generate exactly 6 key subtopics for learning about "${topic}". 
  
Return a JSON object with a "subtopics" array like this:
{
  "subtopics": [
    {"title": "Subtopic 1 name"},
    {"title": "Subtopic 2 name"},
    ...
  ]
}

Make the subtopics comprehensive and logically ordered for a complete learning path.`;

  const response = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [{ role: "user", content: prompt }],
    temperature: 0.7,
    response_format: { type: "json_object" },
  });

  const content = response.choices[0].message.content;
  if (!content) {
    throw new Error("No content generated from OpenAI");
  }

  try {
    const parsed = JSON.parse(content);
    
    if (!parsed.subtopics || !Array.isArray(parsed.subtopics) || parsed.subtopics.length === 0) {
      throw new Error("Invalid subtopics format from OpenAI");
    }
    
    return parsed.subtopics.slice(0, 6);
  } catch (error) {
    console.error("Error parsing OpenAI response:", error);
    throw new Error("Failed to parse subtopics from OpenAI");
  }
}

export async function generateSubtopicContent(
  topicTitle: string,
  subtopicTitle: string
): Promise<GeneratedContent> {
  const prompt = `You are an expert educator teaching about "${topicTitle}", specifically the subtopic "${subtopicTitle}".

Generate educational content in the following JSON format:
{
  "explanation": "A clear, comprehensive explanation of ${subtopicTitle} (3-4 paragraphs)",
  "examples": "3 practical, real-world examples demonstrating ${subtopicTitle}. Format as a numbered list.",
  "quizQuestions": [
    {
      "question": "Question text here?",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correctAnswer": 0
    }
  ]
}

Generate exactly 5 multiple-choice quiz questions with 4 options each. The correctAnswer is the index (0-3) of the correct option.
Make questions test understanding, not just memorization.`;

  const response = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [{ role: "user", content: prompt }],
    temperature: 0.7,
    response_format: { type: "json_object" },
  });

  const content = response.choices[0].message.content;
  if (!content) {
    throw new Error("No content generated from OpenAI");
  }

  try {
    const parsed = JSON.parse(content);
    
    console.log("OpenAI response for subtopic content:", JSON.stringify(parsed, null, 2));
    
    if (!parsed.explanation || typeof parsed.explanation !== "string") {
      console.error("Invalid explanation:", parsed.explanation);
      throw new Error("Invalid explanation format from OpenAI");
    }
    
    let examples = parsed.examples;
    if (Array.isArray(examples)) {
      examples = examples.map((ex, idx) => `${idx + 1}. ${ex}`).join("\n\n");
    } else if (typeof examples !== "string") {
      console.error("Invalid examples format:", examples);
      throw new Error("Invalid examples format from OpenAI");
    }
    
    if (!parsed.quizQuestions || !Array.isArray(parsed.quizQuestions) || parsed.quizQuestions.length === 0) {
      console.error("Invalid quiz questions:", parsed.quizQuestions);
      throw new Error("Invalid quiz questions format from OpenAI");
    }
    
    return {
      explanation: parsed.explanation,
      examples: examples,
      quizQuestions: parsed.quizQuestions.slice(0, 5),
    };
  } catch (error) {
    console.error("Error parsing OpenAI response:", error);
    console.error("Raw content:", content);
    throw new Error("Failed to parse content from OpenAI");
  }
}
