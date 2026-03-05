import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

export async function analyzeCropImage(imageUrl: string) {
  try {
    // In a real app, we'd fetch the image and send it as base64
    // For this simulation, we'll prompt Gemini to "imagine" the analysis of a typical crop image
    // based on the URL (which in our simulation will be a picsum seed)
    
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Analyze this simulated drone image of a farm field (URL: ${imageUrl}). 
      Identify crop health, potential diseases, pests, or nutrient deficiencies.
      Provide a health score (0-100), the main issue found, a recommendation, and any detected patterns.
      Also determine a severity level: low, medium, high, or critical.
      Flag if this looks like an anomaly (something very unusual).`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            health_score: { type: Type.NUMBER },
            issue: { type: Type.STRING },
            recommendation: { type: Type.STRING },
            detected_patterns: { 
              type: Type.ARRAY,
              items: { type: Type.STRING }
            },
            severity: { 
              type: Type.STRING,
              description: "Must be one of: low, medium, high, critical"
            },
            is_anomaly: { type: Type.BOOLEAN }
          },
          required: ["health_score", "issue", "recommendation", "severity", "is_anomaly"]
        }
      }
    });

    return JSON.parse(response.text || "{}");
  } catch (error) {
    console.error("AI Analysis failed:", error);
    return {
      health_score: 50,
      issue: "Analysis Error",
      recommendation: "Manual inspection required",
      severity: "medium",
      is_anomaly: false,
      detected_patterns: ["Error in AI pipeline"]
    };
  }
}
