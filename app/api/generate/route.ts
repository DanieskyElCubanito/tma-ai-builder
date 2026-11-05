// Lista de modelos oficiales confirmados
const MODELS = [
  'gemini-3.8-flash',
  'gemini-3.1-pro-preview'
];

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

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

    let lastError = 'Servidores de Google ocupados';

    for (const model of MODELS) {
      for (let attempt = 1; attempt <= 3; attempt++) {
        const response = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
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

        if (response.ok) {
          const rawText = result?.candidates?.[0]?.content?.parts?.[0]?.text || '{}';
          const cleanText = rawText.replace(/```json/g, '').replace(/```/g, '').trim();
          const parsed = JSON.parse(cleanText);
          return Response.json(parsed);
        }

        const errMsg = result?.error?.message || `Error HTTP ${response.status}`;
        lastError = `[${model}] ${errMsg}`;

        // Si el modelo no existe, rompemos el intento con este modelo
        if (response.status === 404) {
          break;
        }

        // Esperamos 2 segundos antes de volver a intentar golpear la puerta de Google
        await sleep(2000);
      }
    }

    return Response.json({ error: lastError }, { status: 503 });
  } catch (error: any) {
    return Response.json(
      { error: error.message || 'Error interno en el servidor' },
      { status: 500 }
    );
  }
}
