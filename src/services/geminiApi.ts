// --- Gemini API 整合設定 ---
export const geminiApiKey = "";

export const callGeminiAPI = async (prompt: string, isJson = false, systemInstruction = "你是一個專業的人資助理。") => {
  if (!geminiApiKey) {
    throw new Error("請先在程式碼中填入 Gemini API Key 才能使用 AI 功能");
  }
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${geminiApiKey}`;

  const payload: Record<string, unknown> = {
    contents: [{ parts: [{ text: prompt }] }],
    systemInstruction: { parts: [{ text: systemInstruction }] },
  };

  if (isJson) {
    payload.generationConfig = {
      responseMimeType: "application/json",
      responseSchema: {
        type: "OBJECT",
        properties: {
          employeeId: { type: "STRING" },
          date: { type: "STRING" },
          startTime: { type: "STRING" },
          endTime: { type: "STRING" },
          note: { type: "STRING" }
        },
        required: ["employeeId", "date", "startTime", "endTime"]
      }
    };
  }

  let retries = 3;
  let delay = 1000;
  while (retries > 0) {
    try {
      const res = await fetch(url, {
        method: 'POST',
        body: JSON.stringify(payload),
        headers: { 'Content-Type': 'application/json' }
      });
      if (!res.ok) throw new Error('API Request Failed');
      const data = await res.json();
      const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
      return isJson ? JSON.parse(text) : text;
    } catch (e) {
      retries--;
      if (retries === 0) throw e;
      await new Promise(r => setTimeout(r, delay));
      delay *= 2;
    }
  }
};
