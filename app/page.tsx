'use client';

import { useState } from 'react';
import Editor from '@monaco-editor/react';

interface GeneratedFile {
  path: string;
  content: string;
}

export default function BuilderPage() {
  const [prompt, setPrompt] = useState('');
  const [files, setFiles] = useState<GeneratedFile[]>([]);
  const [activeFile, setActiveFile] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim()) return;

    setIsLoading(true);
    setErrorMsg(null);
    setFiles([]);

    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt }),
      });

      if (!response.ok) {
        throw new Error(`Error en el servidor: ${response.statusText}`);
      }

      const data = await response.json();
      if (data.files && data.files.length > 0) {
        setFiles(data.files);
        setActiveFile(data.files[0].path);
      } else {
        setErrorMsg('La IA no devolvió archivos válidos. Inténtalo de nuevo.');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Ocurrió un error al conectar con el servidor.');
    } finally {
      setIsLoading(false);
    }
  };

  const currentCode = files.find((f) => f.path === activeFile)?.content || '// Aquí aparecerá el código generado por tu motor IA...';

  return (
    <div className="flex h-screen bg-[#030712] text-gray-100 font-sans overflow-hidden">
      {/* Panel Izquierdo: Controles */}
      <div className="w-1/3 border-r border-gray-800 flex flex-col p-6 bg-[#0a0f1d] shadow-2xl overflow-y-auto">
        <div className="mb-6">
          <hh1 className="text-2xl font-black tracking-wider uppercase text-transparent bg-clip-text bg-gradient-to-r from-[#00f0ff] to-[#ff1493] drop-shadow-[0_0_10px_rgba(0,240,255,0.3)]">
            ⚡️ TMA AI Builder
          </h1>
          <p className="text-xs text-gray-400 mt-1">Motor de Telegram Mini Apps & Web3</p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col flex-1">
          <label className="text-xs font-semibold uppercase text-[#00f0ff] mb-2 tracking-wide">
            Describe tu componente o juego:
          </label>
          <textarea
            className="w-full bg-[#030712] border border-gray-800 rounded-xl p-4 text-sm focus:outline-none focus:border-[#00f0ff] text-white resize-none shadow-inner transition-all"
            rows={6}
            placeholder="Ej: Menú principal estilo Cyberpunk con botones de inicio y pasarela TonConnect..."
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
          />
          <button
            type="submit"
            disabled={isLoading}
            className="mt-4 w-full bg-gradient-to-r from-[#ff1493] to-[#00f0ff] hover:opacity-90 text-gray-950 font-bold py-3 px-4 rounded-xl transition-all shadow-[0_0_20px_rgba(255,20,147,0.4)] disabled:opacity-50 cursor-pointer uppercase tracking-wider text-xs"
          >
            {isLoading ? 'Construyendo Arquitectura...' : '🚀 Generar Código'}
          </button>
        </form>

        {errorMsg && (
          <div className="mt-4 p-3 bg-red-950/50 border border-red-800 rounded-xl text-red-400 text-xs">
            {errorMsg}
          </div>
        )}

        {files.length > 0 && (
          <div className="mt-6 flex-1 flex flex-col">
            <h3 className="text-[#00f0ff] font-bold mb-3 text-xs uppercase tracking-wider">Archivos Generados</h3>
            <div className="space-y-1.5 overflow-y-auto max-h-60 pr-1">
              {files.map((file, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveFile(file.path)}
                  className={`w-full text-left px-3 py-2 rounded-lg text-xs font-mono transition-all ${
                    activeFile === file.path 
                      ? 'bg-[#00f0ff]/10 border-l-4 border-[#00f0ff] text-[#00f0ff]' 
                      : 'hover:bg-gray-900 text-gray-400'
                  }`}
                >
                  {file.path}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Panel Derecho: Editor de Código */}
      <div className="w-2/3 h-full flex flex-col bg-[#030712]">
        <div className="bg-[#0a0f1d] px-6 py-3 border-b border-gray-800 flex items-center justify-between">
          <span className="text-xs font-mono text-gray-400">
            {activeFile ? `📁 ${activeFile}` : '💡 Selecciona un archivo para inspeccionar'}
          </span>
          <div className="flex space-x-2">
            <span className="w-3 h-3 rounded-full bg-red-500/80 inline-block"></span>
            <span className="w-3 h-3 rounded-full bg-yellow-500/80 inline-block"></span>
            <span className="w-3 h-3 rounded-full bg-green-500/80 inline-block"></span>
          </div>
        </div>
        <div className="flex-1">
          <Editor
            height="100%"
            theme="vs-dark"
            path={activeFile || 'welcome.ts'}
            defaultLanguage="typescript"
            value={currentCode}
            options={{ 
              readOnly: true, 
              minimap: { enabled: false }, 
              padding: { top: 20 }, 
              fontSize: 13,
              fontFamily: 'Fira Code, monospace',
              background: '#030712'
            }}
          />
        </div>
      </div>
    </div>
  );
}
