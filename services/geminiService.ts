
import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || "" });


export const getFestiveWish = async (amount: number, valueText: string): Promise<string> => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Hãy viết một câu chúc Tết ngắn gọn (dưới 15 từ), hài hước và ý nghĩa cho năm Bính Ngọ 2026 khi người chơi vừa lật được bao lì xì trị giá ${valueText}. Hãy tập trung vào biểu tượng con Ngựa (Bính Ngọ).`,
      config: {
        systemInstruction: "Bạn là một ông đồ vui tính, chuyên viết lời chúc Tết cho năm Bính Ngọ 2026.",
        temperature: 0.8,
      }
    });
    return response.text || "Chúc mừng năm mới, vạn sự như ý!";
  } catch (error) {
    console.error("Gemini Error:", error);
    return "Chúc mừng năm mới, lộc xuân tràn đầy!";
  }
};
