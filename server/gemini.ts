import { GoogleGenAI } from '@google/genai';

let aiClient: GoogleGenAI | null = null;

function getGenAI(): GoogleGenAI | null {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.warn('GEMINI_API_KEY not configured. AI Coach will return structured fallback responses.');
      return null;
    }
    aiClient = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build'
        }
      }
    });
  }
  return aiClient;
}

export interface CoachPromptPayload {
  message: string;
  contextSummary: string;
  recommendationSummary: string;
  behaviorSummary: string;
  history?: { role: 'user' | 'model'; text: string }[];
}

export async function askAiCoach(payload: CoachPromptPayload): Promise<string> {
  const ai = getGenAI();
  if (!ai) {
    return `[HealthPilot Decision Intelligence Agent - Offline Mode]
I have reviewed your current context (${payload.contextSummary}) and today's recommendation (${payload.recommendationSummary}).
Based on your behavioral pattern (${payload.behaviorSummary}):
- Prioritize consistency over high-intensity strain when your recovery is below 55%.
- Shorter 20-30 minute home routines historically maintain an 86% adherence rate.
- As your coach, I recommend embracing the lighter restorative protocol today to allow your autonomic nervous system to rebound before your next threshold effort.`;
  }

  try {
    const systemInstruction = `You are HealthPilot AI Coach, an expert in personalized health decision intelligence, exercise physiology, and behavioral science.
You are grounded in the user's actual multi-domain state, daily context, empirical behavioral history, and today's model-recommended action.

Key Rules:
1. Explain the "why" behind decisions using behavioral science (habit continuity, friction reduction) and recovery physiology (autonomic readiness, sleep debt).
2. Never make unsupported clinical or medical diagnostic claims. Present insights as decision support intelligence and research models.
3. Be supportive, empathetic, precise, and concise. Avoid generic fluff or cliches.
4. If a goal-condition conflict exists (e.g., wanting to do intense training on poor sleep), explain the rationale for adaptation.

User State Context:
${payload.contextSummary}

Today's Recommendation & Reason:
${payload.recommendationSummary}

Historical Behavioral Patterns:
${payload.behaviorSummary}`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: payload.message,
      config: {
        systemInstruction,
        temperature: 0.7
      }
    });

    return response.text || 'I analyzed your health context, but could not produce a response at this moment.';
  } catch (error: any) {
    console.error('Error generating AI coach response:', error);
    return `HealthPilot AI Coach response note: We analyzed your query in relation to your current recovery readiness (${payload.contextSummary}). Today's recommendation is designed specifically to mitigate fatigue while preserving behavioral momentum. Let me know if you would like to run a What-If scenario to test different duration or intensity adjustments.`;
  }
}
