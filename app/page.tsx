'use client';

import { useState } from 'react';
import { experimental_useObject as useObject } from 'ai/react';
import Editor from '@monaco-editor/react';
import { z } from 'zod';

const projectSchema = z.object({
  files: z.array(
    z.object({
      path: z.string(),
      content: z.string(),
    })
  ),
});

export default function BuilderPage() {
  const [prompt, setPrompt] = useState('');
  const [activeFile, setActiveFile] = useState<string | null>(null);

  const { object, submit, isLoading } = useObject({
    api: '/api/generate',
    schema: projectSchema,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    submit({ prompt });
  };

  const files = object?.files || [];
  const currentCode = files.find((f) => f.path === activeFile)?.content || '// Escribe tu idea y presiona "Generar Código"';

  return (
    <div className="flex h-screen bg-gray-950 text-white font-sans">
      <div className="w-1/3 border-r border-gray-800 flex flex-col p-6 overflow-y-auto">
        <h1 className="text-2xl font-bold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-[#00f0ff] to-[#ff1493]">
          TMA AI Builder
        </h1>
        
        <form onSubmit={handleSubmit} className="mb-8">
          <textarea
            className="w-full bg-gray-900 border border-gray-700 rounded-lg p-3 text-sm focus:outline-none focus:border-[#00f0ff] text-white"
            rows={5}
            placeholder="Ej: Crea el menú principal para un juego tipo FarmVille con pagos en USDT..."
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
          />
          <button
            disabled={isLoading}
            className="mt-3 w-full bg-[#ff1493] hover:bg-[#d10c77] text-white font-semibold py-2 rounded-lg transition-colors shadow-[0_0_15px_rgba(255,20,147,0.4)] disabled:opacity-50"
          >
            {isLoading ? 'Generando Arquitectura...' : 'Generar Código'}
          </button>
        </form>

        {files.length > 0 && (
          <div>
            <h3 className="text-[#00f0ff] font-semibold mb-3 text-sm uppercase">Archivos Generados</h3>
            <ul className="space-y-2">
              {files.map((file, idx) => (
                <li key={idx}>
                  <button
                    onClick={() => setActiveFile(file.path)}
                    className={`w-full text-left p-2 rounded text-sm font-mono ${
                      activeFile === file.path ? 'bg-gray-800 border-l-2 border-[#00f0ff]' : 'hover:bg-gray-900 text-gray-400'
                    }`}
                  >
                    {file.path}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      <div className="w-2/3 h-full">
        <Editor
          height="100%"
          theme="vs-dark"
          path={activeFile || 'welcome.ts'}
          defaultLanguage="typescript"
          value={currentCode}
          options={{ readOnly: true, minimap: { enabled: false }, padding: { top: 20 }, fontSize: 14 }}
        />
      </div>
    </div>
  );
}
