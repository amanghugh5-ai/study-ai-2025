import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { openai } from "./replit_integrations/image/client";
import { z } from "zod";
import Tesseract from 'tesseract.js';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const pdf = require('pdf-parse');
import mammoth from 'mammoth';

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  
  app.post(api.ai.generate.path, async (req, res) => {
    try {
      const input = api.ai.generate.input.parse(req.body);
      
      const ip = req.ip || 'unknown';
      if (!storage.checkRateLimit(ip)) {
        return res.status(429).json({ 
          message: "Daily limit exceeded. Please try again tomorrow." 
        });
      }

      let extractedText = input.content || "";

      // Handle File Processing
      if (input.fileData) {
        const buffer = Buffer.from(input.fileData.split(',')[1] || input.fileData, 'base64');
        const fileType = input.fileType || "";

        if (fileType.includes('image') || input.fileName?.match(/\.(jpg|jpeg|png)$/i)) {
          const { data: { text } } = await Tesseract.recognize(buffer);
          extractedText = text;
        } else if (fileType === 'application/pdf' || input.fileName?.endsWith('.pdf')) {
          const data = await pdf(buffer);
          extractedText = data.text;
        } else if (fileType.includes('officedocument.wordprocessingml.document') || input.fileName?.endsWith('.docx')) {
          const result = await mammoth.extractRawText({ buffer });
          extractedText = result.value;
        } else if (fileType === 'text/plain' || input.fileName?.endsWith('.txt')) {
          extractedText = buffer.toString('utf8');
        }
      }

      if (!extractedText.trim()) {
        return res.status(400).json({ message: "No text content found to process." });
      }

      let systemPrompt = "";
      const language = input.language || 'english';
      const languageInstruction = language === 'both' 
        ? "Provide the response in both English and Urdu (bilingual)." 
        : `Provide the response in ${language}.`;

      switch (input.type) {
        case 'solve':
          systemPrompt = `You are an expert academic tutor. Provide comprehensive, high-quality, step-by-step explanations.
          ${languageInstruction}
          
          Guidelines for "book-style" quality:
          1. Start with a clear definition of the concept.
          2. Break the solution into logical, numbered steps.
          3. For mathematical expressions, ALWAYS use LaTeX notation (e.g., $x^2$, $\frac{a}{b}$, $\sqrt{x}$) so they render clearly like a textbook.
          4. IMPORTANT: ALWAYS wrap math expressions in double backslashes and parentheses for inline math like \\( x^2 \\) or double backslashes and brackets for block math like \\[\frac{a}{b}\\]. DO NOT use single dollar signs.
          5. Include a "Key takeaway" or "Pro-tip" at the end to help the student remember the logic.
          6. Use bold text for important terms.
          7. Ensure the tone is encouraging and educational.`;
          if (input.subject) systemPrompt += ` The subject is ${input.subject}.`;
          break;
        case 'summarize':
          const complexity = input.complexity || 'medium';
          systemPrompt = `You are an expert summarizer. Create a professional study summary from the provided notes.
          Complexity level: ${complexity}.
          ${languageInstruction}
          
          Structure:
          - **Topic Overview**: A brief 2-3 sentence summary of the main idea.
          - **Core Concepts**: Bulleted list of the most important points.
          - **Detailed Breakdown**: A structured explanation of key details based on the ${complexity} level.
          - **Summary Table or List**: Quick reference for memorization.
          - **Summary Conclusion**: Final thought.
          
          Use LaTeX for any technical formulas.`;
          break;
        case 'mcq':
          const mcqCount = input.count || 5;
          systemPrompt = `You are an examiner. Generate ${mcqCount} high-quality Multiple Choice Questions.
          ${languageInstruction}
          
          Rules:
          1. Each question must be clear and test understanding, not just rote memory.
          2. Provide 4 distinct options (A, B, C, D).
          3. Format: 
             **Q[Number]: [Question Text]**
             A) [Option]
             B) [Option]
             C) [Option]
             D) [Option]
          4. After all questions, provide an **Answer Key** section with brief explanations for why each answer is correct.
          
          Use LaTeX for any formulas in questions or options.`;
          if (input.subject) systemPrompt += ` The subject is ${input.subject}.`;
          break;
      }

      if (input.type === 'solve' && input.fileData && !input.content) {
        systemPrompt = `Identify the questions in the attached image or document text and solve them step by step. ${systemPrompt}`;
      }

      const completion = await openai.chat.completions.create({
        model: "gpt-4o", // Changed from gpt-5.1 to a standard supported model
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: extractedText }
        ],
        max_tokens: 1000, // Changed from max_completion_tokens
      });

      const result = completion.choices[0].message.content || "No response generated.";

      await storage.createHistory({
        type: input.type,
        subject: input.subject || null,
        content: extractedText.substring(0, 500), // Store preview
        result: result,
        fileName: input.fileName || null,
      });

      const remaining = storage.getRemainingRequests(ip);
      res.json({ result, remaining });
    } catch (error) {
      console.error('Generation error:', error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.post("/api/subscribe", async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).send("Unauthorized");
    const { transactionId } = req.body;
    if (!transactionId) return res.status(400).send("Transaction ID required");
    
    // Simulate manual verification - in a real app, this would be an admin check
    // For now, we'll just log it and potentially unlock immediately for demo purposes
    console.log(`Payment verification requested for user ${req.user.id} with TID: ${transactionId}`);
    
    res.json({ message: "Payment submitted for verification. Premium will be unlocked shortly." });
  });

  app.get(api.history.list.path, async (req, res) => {
    try {
      const history = await storage.getHistory();
      res.json(history);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch history" });
    }
  });

  app.delete("/api/history/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) return res.status(400).send("Invalid ID");
      await storage.deleteHistory(id);
      res.sendStatus(204);
    } catch (error) {
      res.status(500).json({ message: "Failed to delete history item" });
    }
  });

  return httpServer;
}
