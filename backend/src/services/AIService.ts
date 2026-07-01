import { OpenRouter } from '@openrouter/sdk';

interface ProviderConfig {
  model: string;
  apiKey: string;
}

class AIServiceClass {
  private providers: ProviderConfig[] = [
    {
      model: 'qwen/qwen3-32b',
      apiKey: process.env.OPENROUTER_QWEN_KEY || ''
    },
    {
      model: 'moonshotai/kimi-k2.6',
      apiKey: process.env.OPENROUTER_KIMI_KEY || ''
    },
    {
      model: 'openai/gpt-oss-120b:free',
      apiKey: process.env.OPENROUTER_FALLBACK_KEY || ''
    }
  ];

  /**
   * Send a message to OpenRouter with fallback failover.
   */
  async generateText(prompt: string, systemPrompt?: string, providerIndex = 0): Promise<string> {
    if (providerIndex >= this.providers.length) {
      throw new Error('All OpenRouter AI providers failed or are rate limited.');
    }

    const provider = this.providers[providerIndex];
    console.log(`[AI SERVICE] Invoking model: ${provider.model} (Attempt ${providerIndex + 1})`);

    try {
      const openrouter = new OpenRouter({
        apiKey: provider.apiKey
      });

      const messages: any[] = [];
      if (systemPrompt) {
        messages.push({ role: 'system', content: systemPrompt });
      }
      messages.push({ role: 'user', content: prompt });

      const response = await openrouter.chat.send({
        chatRequest: {
          model: provider.model,
          messages,
          stream: false
        }
      });

      const content = (response as any).choices?.[0]?.message?.content;
      if (!content) {
        throw new Error('Empty response from provider');
      }

      return content;
    } catch (error: any) {
      console.warn(`[AI SERVICE] Provider ${provider.model} failed. Error: ${error?.message || error}. Falling back...`);
      return this.generateText(prompt, systemPrompt, providerIndex + 1);
    }
  }

  /**
   * Generate clean JSON by instructing the AI and parsing the response.
   */
  async generateJSON<T = any>(prompt: string, systemPrompt?: string): Promise<T> {
    const jsonInstruction = '\nReturn ONLY a raw JSON string. Do not include markdown code block syntax (like ```json). Just start with [ or { and end with ] or }. Ensure it is perfectly valid JSON.';
    const fullPrompt = prompt + jsonInstruction;

    const text = await this.generateText(fullPrompt, systemPrompt);
    
    try {
      let cleaned = text.trim();
      if (cleaned.startsWith('```')) {
        cleaned = cleaned.replace(/^```(?:json)?\n/, '').replace(/\n```$/, '').trim();
      }
      
      return JSON.parse(cleaned) as T;
    } catch (err) {
      console.error('[AI SERVICE] Failed to parse JSON from AI response. Raw response was:', text);
      throw new Error('AI failed to return valid JSON structures.');
    }
  }
}

export const AIService = new AIServiceClass();
export default AIService;
