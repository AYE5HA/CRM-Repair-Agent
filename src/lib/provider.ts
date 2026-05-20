/**
 * LLM provider seam — swap `analyzeWithProvider` for OpenAI/Azure when API keys are set.
 * The product defaults to the deterministic analyzer for reliable demos.
 */
export type ProviderConfig = {
  provider: "deterministic" | "openai";
  model?: string;
  apiKey?: string;
};

export function getProviderConfig(): ProviderConfig {
  return {
    provider: process.env.OPENAI_API_KEY ? "openai" : "deterministic",
    model: process.env.OPENAI_MODEL || "gpt-4o-mini",
    apiKey: process.env.OPENAI_API_KEY
  };
}

export function providerLabel() {
  const config = getProviderConfig();
  return config.provider === "openai" ? `OpenAI (${config.model})` : "Deterministic local analyzer";
}
