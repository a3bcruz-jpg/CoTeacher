export type AIRequest = {
  system: string;
  user: string;
};

export type AIProvider = {
  generateText(request: AIRequest): Promise<string>;
};

class ConfiguredProvider implements AIProvider {
  constructor(private readonly apiKey: string, private readonly model: string, private readonly baseUrl: string) {}

  async generateText(request: AIRequest) {
    const response = await fetch(`${this.baseUrl.replace(/\/$/, "")}/chat/completions`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${this.apiKey}` },
      body: JSON.stringify({ model: this.model, temperature: 0.2, messages: [{ role: "system", content: request.system }, { role: "user", content: request.user }] }),
      cache: "no-store",
    });
    if (!response.ok) throw new Error("AI provider request failed.");
    const data = await response.json();
    const text = data?.choices?.[0]?.message?.content;
    if (typeof text !== "string" || !text.trim()) throw new Error("AI provider returned no text.");
    return text.trim();
  }
}

export function getAIProvider(): AIProvider | null {
  const apiKey = process.env.AI_API_KEY;
  if (!apiKey) return null;
  return new ConfiguredProvider(apiKey, process.env.AI_MODEL || "gpt-5.6-mini", process.env.AI_BASE_URL || "https://api.openai.com/v1");
}
