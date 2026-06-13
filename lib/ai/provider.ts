export interface AIProvider {
  generateIdea(topic?: string, category?: string): Promise<{ title: string; category: string; description: string }>;
  generatePrompt(ideaTitle: string, category: string): Promise<{ image_prompt: string; video_prompt: string; description_prompt: string }>;
  generateDescription(ideaTitle: string): Promise<string>;
}

export class MockAIProvider implements AIProvider {
  async generateIdea(topic = 'Future Tech', category = 'YouTube'): Promise<{ title: string; category: string; description: string }> {
    // Artificial delay to simulate network latency
    await new Promise((resolve) => setTimeout(resolve, 800));

    const ideas = [
      {
        title: `10 Hidden Features of ${topic} That Will Blow Your Mind`,
        category: category,
        description: `An in-depth breakdown of secret capabilities and features in ${topic} that most users are completely unaware of. High retention hooks and visual examples included.`
      },
      {
        title: `The Ultimate Beginner Guide to Mastering ${topic} in 2026`,
        category: category,
        description: `A step-by-step tutorial designed to take absolute beginners to advanced proficiency in ${topic}. Focuses on practical projects and hands-on exercises.`
      },
      {
        title: `Why Everyone is Wrong About ${topic} (Unpopular Opinion)`,
        category: category,
        description: `A critical analysis challenging the mainstream narratives surrounding ${topic}. Explores controversial aspects, future projections, and hidden opportunities.`
      }
    ];

    const randomIndex = Math.floor(Math.random() * ideas.length);
    return ideas[randomIndex];
  }

  async generatePrompt(ideaTitle: string, category: string): Promise<{ image_prompt: string; video_prompt: string; description_prompt: string }> {
    await new Promise((resolve) => setTimeout(resolve, 1000));

    return {
      image_prompt: `A high-tech cinematic thumbnail art for a video titled "${ideaTitle}". Features glowing neon elements, abstract representations of ${category}, modern composition, octane render style, ultra-detailed 8k resolution.`,
      video_prompt: `Dynamic camera panning shot over a futuristic desktop workspace displaying code and visual data related to "${ideaTitle}". Smooth transitions, warm ambient lighting, highly realistic 3d rendering, cinematic lighting.`,
      description_prompt: `🚀 Dive deep into the future of content! Today, we are exploring "${ideaTitle}". \n\nIn this episode, we break down what this means for the industry, how you can leverage it, and the tools you need to succeed.\n\n👇 Let us know your thoughts in the comments!\n\n#${category.replace(/\s+/g, '')} #AI #TechTrends #ContentCreation2026`
    };
  }

  async generateDescription(ideaTitle: string): Promise<string> {
    await new Promise((resolve) => setTimeout(resolve, 500));
    return `This comprehensive guide explores the core concepts of "${ideaTitle}". It covers everything from setup, core features, advanced use-cases, and optimization tricks for content creators looking to scale.`;
  }
}

export class OpenAIProvider implements AIProvider {
  private apiKey: string;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  private async callOpenAI(systemPrompt: string, userPrompt: string): Promise<string> {
    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt }
          ],
          temperature: 0.7,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error?.message || `OpenAI API error (${response.status})`);
      }

      const result = await response.json();
      return result.choices[0]?.message?.content || '';
    } catch (error: any) {
      console.error('OpenAI API request failed, falling back to Mock Data:', error);
      throw error;
    }
  }

  async generateIdea(topic = 'Future Tech', category = 'YouTube'): Promise<{ title: string; category: string; description: string }> {
    const systemPrompt = `You are a viral content strategist. Generate a creative, catchy, and high-retention content idea based on a topic and category. Output ONLY a valid JSON object in this format: {"title": "idea title", "category": "category name", "description": "brief description of the idea"}. Do not include markdown code block syntax.`;
    const userPrompt = `Topic: ${topic}\nCategory: ${category}`;

    try {
      const text = await this.callOpenAI(systemPrompt, userPrompt);
      const cleaned = text.replace(/```json/g, '').replace(/```/g, '').trim();
      return JSON.parse(cleaned);
    } catch {
      // Fallback
      return new MockAIProvider().generateIdea(topic, category);
    }
  }

  async generatePrompt(ideaTitle: string, category: string): Promise<{ image_prompt: string; video_prompt: string; description_prompt: string }> {
    const systemPrompt = `You are an AI prompt engineer for image, video, and social media description models. Generate tailored prompts for a content idea. Output ONLY a valid JSON object in this format: {"image_prompt": "Midjourney style prompt", "video_prompt": "Runway/Sora style prompt", "description_prompt": "Social media description with hashtags"}. Do not include markdown code block syntax.`;
    const userPrompt = `Idea Title: ${ideaTitle}\nPlatform/Category: ${category}`;

    try {
      const text = await this.callOpenAI(systemPrompt, userPrompt);
      const cleaned = text.replace(/```json/g, '').replace(/```/g, '').trim();
      return JSON.parse(cleaned);
    } catch {
      return new MockAIProvider().generatePrompt(ideaTitle, category);
    }
  }

  async generateDescription(ideaTitle: string): Promise<string> {
    const systemPrompt = `You are a professional content editor. Write a brief, engaging, and professional 2-3 sentence description of the content idea provided. Return plain text only.`;
    try {
      return await this.callOpenAI(systemPrompt, `Write description for: "${ideaTitle}"`);
    } catch {
      return new MockAIProvider().generateDescription(ideaTitle);
    }
  }
}

/**
 * Factory to retrieve the active AI Provider based on configuration.
 */
export function getAIProvider(overrideMode?: 'mock' | 'openai'): AIProvider {
  // If explicitly overridden, or if OPENAI_API_KEY is not set or set to MOCK_MODE
  const apiKey = process.env.OPENAI_API_KEY || '';
  const isMockMode = !apiKey || apiKey === 'MOCK_MODE' || !apiKey.startsWith('sk-');
  
  if (overrideMode === 'openai' || (!overrideMode && !isMockMode)) {
    return new OpenAIProvider(apiKey);
  }
  
  return new MockAIProvider();
}
