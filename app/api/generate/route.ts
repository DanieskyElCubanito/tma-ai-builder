import { openai } from '@ai-sdk/openai';
import { streamObject } from 'ai';
import { z } from 'zod';

const projectSchema = z.object({
  files: z.array(
    z.object({
      path: z.string(),
      content: z.string(),
    })
  ),
});

export async function POST(req: Request) {
  const { prompt } = await req.json();

  const result = await streamObject({
    model: openai('gpt-4o'),
    schema: projectSchema,
    system: `Eres el motor interno de un Generador de Telegram Mini Apps. 
    REGLAS ESTRICTAS:
    1. PROHIBIDO usar Bolt Database, SQLite, Firebase o shadcn/ui.
    2. Usa únicamente: Next.js, Supabase, TailwindCSS, @telegram-apps/sdk y @tonconnect/ui.
    3. Diseña en dark-mode con colores cian neón (#00f0ff) y rosa (#ff1493).
    4. Devuelve el código funcional y estructurado.`,
    prompt: `Genera la estructura para: ${prompt}`,
  });

  return result.toTextStreamResponse();
}
