export async function POST(req: Request) {
  try {
    const { prompt } = await req.json();
    const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY;
 
    if (!apiKey) {
      return Response.json(
        { error: 'Falta la variable GOOGLE_GENERATIVE_AI_API_KEY en Vercel.' },
        { status: 500 }
      );
    }

    const systemPrompt = `Eres un generador experto de Telegram Mini Apps (Next.js, Tailwind, Supabase, TonConnect) con estética Cyberpunk (#00f0ff y #ff1493).
Devuelve ÚNICAMENTE un objeto JSON válido con esta estructura exacta:
{
  "files": [
    {
      "path": "app/page.tsx",
      "content": "// código completo aquí"
    }
  ]
}
Requerimiento: ${prompt}`;

    // Llamada directa a la API oficial de Google con el modelo que nos pidió el servidor
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.8-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: systemPrompt }] }],
          generationConfig: {
            temperature: 0.2,
            responseMimeType: 'application/json',
          },
        }),
      }
    );

    const result = await response.json();

    if (!response.ok) {
      return Response.json(
        { error: result?.error?.message || `Error de Google API (${response.status})` },
        { status: response.status }
      );
    }

    const rawText = result?.candidates?.[0]?.content?.parts?.[0]?.text || '{}';
    const cleanText = rawText.replace(/```json/g, '').replace(/```/g, '').trim();
    const parsed = JSON.parse(cleanText);

    return Response.json(parsed);
  } catch (error: any) {
    return Response.json(
      { error: error.message || 'Error interno en el servidor' },
      { status: 500 }
    );
  }
}
