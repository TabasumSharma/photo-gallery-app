const OLLAMA_URL = "https://api.databi.io/api";

type OllamaGenerateResponse = {
  response: string;
  done?: boolean;
  model?: string;
};

export async function askLLM(prompt: string): Promise<string> {
  const res = await fetch(`${OLLAMA_URL}/generate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: "llama3.1:latest",
      stream: false,
      prompt,
    }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`LLM error ${res.status}: ${text}`);
  }

  const json = (await res.json()) as OllamaGenerateResponse;
  return json.response ?? "";
}
