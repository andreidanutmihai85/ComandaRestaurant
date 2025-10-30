import { GoogleGenAI, Modality } from "@google/genai";

export async function speakNumber(numberString: string, apiKey: string): Promise<string | null> {
  const ai = new GoogleGenAI({ apiKey });

  const textToSpeak = `Comanda numarul ${numberString}`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-preview-tts",
      contents: [{ parts: [{ text: textToSpeak }] }],
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: {
          voiceConfig: {
            // By removing the specific voiceName, we allow Gemini to
            // auto-detect the language from the text and select an appropriate voice.
            prebuiltVoiceConfig: {},
          },
        },
      },
    });

    const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;

    if (typeof base64Audio === 'string') {
      return base64Audio;
    }
    return null;

  } catch (error) {
    console.error("Error calling Gemini API:", error);
    if (error instanceof Error && error.message.includes('API key not valid')) {
       throw new Error("API key not valid. Please pass a valid API key.");
    }
    throw new Error("Failed to generate audio from Gemini API.");
  }
}