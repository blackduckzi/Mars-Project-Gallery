
import { GoogleGenAI } from "@google/genai";

// Strictly adhering to Google GenAI SDK initialization guidelines.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const getProjectInsights = async (projectName: string) => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Provide a visionary, one-sentence futuristic insight about a project named "${projectName}" in the context of the MARS Initiative. Keep it poetic and tech-oriented.`,
    });
    // Directly accessing .text property as per guidelines.
    return response.text;
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "The future of this initiative is bound to redefine human potential.";
  }
};
