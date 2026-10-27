import { GoogleGenerativeAI } from '@google/generative-ai';

// Usamos directamente la librería oficial de Google con tu clave de entorno
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GENERATIVE_AI_API_KEY || '');

export async function POST(req: Request) {
  try {
    const { prompt } = await req.json();

    if (!prompt) {
      return Response.json({ error: 'Falta el prompt' }, { status: 400 });
    }

    // Usamos el modelo flash actual
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

    const structuredPrompt = `Eres un generador experto de Telegram Mini Apps. 
    Devuelve la respuesta EXCLUSIVAMENTE en formato JSON válido, sin bloques de código ni texto adicional, con la siguiente estructura exacta:
    {
      "files": [
        {
          "path": "app/page.tsx",
          "content": "// código aquí en Next.js y Tailwind con estética cyberpunk cian/rosa"
        }
      ]
    }
    Requerimiento del usuario: ${prompt}`;

    const result = await model.generateContent(structuredPrompt);
    const responseText = result.response.text();

    // Limpiamos posibles etiquetas markdown de los bloques de código que la IA suele poner
    const cleanJson = responseText.replace(/```json/g, '').replace(/```/g, '').trim();
    const data = JSON.parse(cleanJson);

    return Response.json(data);
  } catch (error: any) {
    console.error('Error detallado:', error);
    return Response.json({ error: error.message || 'Error desconocido' }, { status: 500 });
  }
}
