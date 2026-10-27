import { google } from '@ai-sdk/google';
import { generateText } from 'ai';

export async function POST(req: Request) {
  try {
    const { prompt } = await req.json();

    if (!prompt) {
      return Response.json({ error: 'Falta el prompt' }, { status: 400 });
    }

    const { text } = await generateText({
      model: google('gemini-2.0-flash'),
      system: `Eres un generador experto de Telegram Mini Apps. 
      Devuelve la respuesta EXCLUSIVAMENTE en un objeto JSON válido (sin markdown ni comillas de bloque de código como \`\`\`json), con la estructura exacta:
      {
        "files": [
          {
            "path": "app/page.tsx",
            "content": "// código aquí en Next.js y Tailwind con estética cyberpunk cian/rosa"
          }
        ]
      }`,
      prompt: `Requerimiento del usuario: ${prompt}`,
    });

    // Limpieza de seguridad para asegurar que el texto sea un JSON parseable
    const cleanText = text.replace(/```json/g, '').replace(/```/g, '').trim();
    const data = JSON.parse(cleanText);

    return Response.json(data);
  } catch (error: any) {
    console.error('Error detallado:', error);
    return Response.json({ error: error.message || 'Error desconocido' }, { status: 500 });
  }
}
