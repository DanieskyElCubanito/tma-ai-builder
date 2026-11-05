export async function POST(req: Request) {
  try {
    const { prompt } = await req.json();

    const systemPrompt = `Eres un generador experto de Telegram Mini Apps (Next.js, Tailwind, Supabase, TonConnect) con estética Cyberpunk (#00f0ff y #ff1493).
Devuelve ÚNICAMENTE un objeto JSON válido. NO incluyas texto fuera del JSON.
Estructura obligatoria:
{
  "files": [
    {
      "path": "app/page.tsx",
      "content": "// código completo aquí en Next.js"
    }
  ]
}`;

    // Pollinations AI: API abierta y gratuita, sin necesidad de API KEY
    const response = await fetch('https://text.pollinations.ai/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: `Requerimiento: ${prompt}` }
        ],
        model: 'openai', // Utiliza una versión optimizada de OpenAI por detrás
        jsonMode: true
      }),
    });

    const rawText = await response.text();

    if (!response.ok) {
      return Response.json(
        { error: `Error en la API libre (${response.status}): ${rawText}` },
        { status: response.status }
      );
    }

    // Limpiamos el texto por si la IA le pone comillas de Markdown
    const cleanText = rawText.replace(/```json/g, '').replace(/```/g, '').trim();
    const parsed = JSON.parse(cleanText);

    return Response.json(parsed);

  } catch (error: any) {
    return Response.json(
      { error: error.message || 'Error interno al procesar el código' },
      { status: 500 }
    );
  }
}
