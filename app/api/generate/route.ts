import { google } from '@ai-sdk/google';
import { generateObject } from 'ai';
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
  try {
    const { prompt } = await req.json();

    const result = await generateObject({
      model: google('gemini-1.5-pro'),
      schema: projectSchema,
      system: `Eres el motor experto de desarrollo para Telegram Mini Apps de alto rendimiento. 
      REGLAS ESTRICTAS DE ARQUITECTURA:
      1. PROHIBIDO usar Bolt Database, SQLite, Firebase, Bootstrap o shadcn/ui.
      2. STACK OBLIGATORIO: Next.js (App Router), Tailwind CSS, Supabase para base de datos, @telegram-apps/sdk, y @tonconnect/ui para pagos Web3 con criptomonedas (USDT/TON).
      3. DISEÑO VISUAL: Estricto modo oscuro (dark-mode) con estilo cyberpunk (cian neón #00f0ff y rosa neón #ff1493).
      4. CALIDAD: Devuelve componentes limpios con tipado en TypeScript. Cada archivo debe tener su ruta completa y código funcional.`,
      prompt: `Genera la implementación completa para: ${prompt}`,
    });

    return Response.json(result.object);
  } catch (error: any) {
    return Response.json({ error: error.message || 'Error interno en la IA' }, { status: 500 });
  }
}
