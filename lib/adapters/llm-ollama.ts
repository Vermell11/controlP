import { adapterConfig } from "../config";

export async function askOllama(prompt: string): Promise<string> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 45_000);
  try {
    const response = await fetch(`${adapterConfig.ollamaUrl}/api/chat`, {
      body: JSON.stringify({
        format: "json",
        messages: [{ content: prompt, role: "user" }],
        model: adapterConfig.ollamaModel,
        options: { num_predict: 150, temperature: 0.1 },
        stream: false,
      }),
      headers: { "Content-Type": "application/json" },
      method: "POST",
      signal: controller.signal,
    });
    if (!response.ok) throw new Error(`Ollama respondió ${response.status}`);
    const data = (await response.json()) as { message?: { content?: unknown } };
    if (typeof data.message?.content !== "string") throw new Error("respuesta Ollama inválida");
    return data.message.content;
  } finally {
    clearTimeout(timeout);
  }
}
