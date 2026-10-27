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
    const body = await req.json();
    const prompt = body.prompt;

    if (!prompt) {
      return Response.json({ error: 'Falta el prompt' }, { status: 400 });
    }

    const result = await generateObject({
      model: google('gemini-2.0-flash'),
      schema: projectSchema,
      system: `Eres un generador de Telegram Mini Apps. Devuelve un JSON con una lista de archivos (path y content) utilizando Next.js y Tailwind.`,
      prompt: prompt,
    });

    return Response.json(result.object);
  } catch (error: any) {
    console.error('Error detallado de IA:', error);
    // Devolvemos el error real directamente a la pantalla para verlo desde el celular
    return Response.json({ error: error.message || 'Error desconocido en el servidor' }, { status: 500 });
  }
}
