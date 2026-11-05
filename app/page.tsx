'use client';

import { useState } from 'react';
import Editor from '@monaco-editor/react';

interface GeneratedFile {
  path: string;
  content: string;
}

export default function BuilderPage() {
  const [prompt, setPrompt] = useState('Crea un menú principal Cyberpunk con botón de cobro USDT y diseño neón');
  const [files, setFiles] = useState<GeneratedFile[]>([]);
  const [activeFile, setActiveFile] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim()) {
      setErrorMsg('Por favor escribe una descripción primero.');
      return;
    }

    setIsLoading(true);
    setErrorMsg(null);
    setFiles([]);

    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt }),
      });

      const rawText = await response.text();
      let data: any;
      try {
        data = JSON.parse(rawText);
      } catch {
        throw new Error(`Respuesta inválida del servidor (${response.status}): ${rawText.slice(0, 150)}`);
      }

      if (!response.ok) {
        throw new Error(data.error || `Error HTTP ${response.status}`);
      }

      if (data.files && Array.isArray(data.files) && data.files.length > 0) {
        setFiles(data.files);
        setActiveFile(data.files[0].path);
      } else {
        setErrorMsg('La IA respondió pero no devolvió archivos válidos.');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Error desconocido al conectar.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = async () => {
    const file = files.find((f) => f.path === activeFile);
    if (!file || !file.content) return;
    
    try {
      await navigator.clipboard.writeText(file.content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      alert('Tu navegador no permite copiar automáticamente.');
    }
  };

  const handleDownload = () => {
    const file = files.find((f) => f.path === activeFile);
    if (!file || !file.content) return;
    
    const blob = new Blob([file.content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    // Extrae solo el nombre del archivo (ej. page.tsx)
    a.download = file.path.split('/').pop() || 'codigo.tsx';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const currentCode =
    files.find((f) => f.path === activeFile)?.content ||
    '// Aquí aparecerá el código generado por tu motor IA...';

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#050814',
      color: '#f3f4f6',
      fontFamily: 'system-ui, -apple-system, sans-serif',
      display: 'flex',
      flexDirection: 'column',
      padding: '16px',
      boxSizing: 'border-box'
    }}>
      {/* Encabezado Cyberpunk */}
      <div style={{
        backgroundColor: '#0b1329',
        border: '1px solid rgba(0, 240, 255, 0.35)',
        borderRadius: '14px',
        padding: '16px',
        marginBottom: '16px',
        boxShadow: '0 0 20px rgba(0, 240, 255, 0.15)'
      }}>
        <h1 style={{
          margin: 0,
          fontSize: '22px',
          fontWeight: 900,
          letterSpacing: '1px',
          textTransform: 'uppercase',
          color: '#00f0ff',
          textShadow: '0 0 10px rgba(0, 240, 255, 0.6)'
        }}>
          ⚡️ 🚀 TMA AI Builder
        </h1>
        <p style={{ margin: '4px 0 16px 0', fontSize: '12px', color: '#ff1493', fontWeight: 600 }}>
          Motor de Telegram Mini Apps & Web3
        </p>

        <form onSubmit={handleSubmit}>
          <label style={{
            display: 'block',
            fontSize: '12px',
            fontWeight: 700,
            textTransform: 'uppercase',
            color: '#00f0ff',
            marginBottom: '8px'
          }}>
            Describe tu componente o juego:
          </label>
          <textarea
            rows={4}
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Describe tu juego o tienda..."
            style={{
              width: '100%',
              boxSizing: 'border-box',
              backgroundColor: '#03050c',
              border: '1px solid #00f0ff',
              borderRadius: '10px',
              padding: '12px',
              color: '#ffffff',
              fontSize: '14px',
              outline: 'none',
              marginBottom: '12px'
            }}
          />
          <button
            type="submit"
            disabled={isLoading}
            style={{
              width: '100%',
              background: 'linear-gradient(90deg, #ff1493 0%, #00f0ff 100%)',
              color: '#050814',
              fontWeight: 900,
              fontSize: '13px',
              textTransform: 'uppercase',
              padding: '14px',
              borderRadius: '10px',
              border: 'none',
              cursor: 'pointer',
              boxShadow: '0 0 15px rgba(255, 20, 147, 0.5)',
              opacity: isLoading ? 0.6 : 1
            }}
          >
            {isLoading ? '⏳ Construyendo Arquitectura...' : '🚀 Generar Código'}
          </button>
        </form>

        {errorMsg && (
          <div style={{
            marginTop: '14px',
            padding: '12px',
            backgroundColor: 'rgba(127, 29, 29, 0.85)',
            border: '1px solid #ef4444',
            borderRadius: '10px',
            color: '#fecaca',
            fontSize: '12px',
            wordBreak: 'break-word'
          }}>
            <strong>Detalle del error:</strong> {errorMsg}
          </div>
        )}

        {files.length > 0 && (
          <div style={{ marginTop: '16px' }}>
            <div style={{ fontSize: '12px', fontWeight: 700, color: '#00f0ff', marginBottom: '8px', textTransform: 'uppercase' }}>
              Archivos Generados ({files.length}):
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {files.map((file, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveFile(file.path)}
                  style={{
                    textAlign: 'left',
                    padding: '10px 12px',
                    borderRadius: '8px',
                    fontSize: '12px',
                    fontFamily: 'monospace',
                    cursor: 'pointer',
                    backgroundColor: activeFile === file.path ? 'rgba(0, 240, 255, 0.2)' : '#050814',
                    border: activeFile === file.path ? '1px solid #00f0ff' : '1px solid #1f2937',
                    color: activeFile === file.path ? '#00f0ff' : '#9ca3af',
                    fontWeight: activeFile === file.path ? 700 : 400
                  }}
                >
                  📄 {file.path}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Visor de Código */}
      <div style={{
        flex: 1,
        minHeight: '420px',
        backgroundColor: '#0b1329',
        border: '1px solid rgba(255, 20, 147, 0.35)',
        borderRadius: '14px',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column'
      }}>
        <div style={{
          padding: '10px 14px',
          backgroundColor: '#070b19',
          borderBottom: '1px solid rgba(0, 240, 255, 0.2)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '10px'
        }}>
          <span style={{ fontSize: '12px', fontFamily: 'monospace', color: '#00f0ff' }}>
            {activeFile ? `📁 ${activeFile}` : '💡 Selecciona un archivo'}
          </span>
          
          {/* Controles de Exportación */}
          {activeFile && (
            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                onClick={handleCopy}
                style={{
                  backgroundColor: 'transparent',
                  border: '1px solid #00f0ff',
                  color: '#00f0ff',
                  padding: '6px 12px',
                  borderRadius: '6px',
                  fontSize: '11px',
                  fontWeight: 'bold',
                  cursor: 'pointer',
                  textTransform: 'uppercase'
                }}
              >
                {copied ? '¡Copiado! ✓' : 'Copiar'}
              </button>
              <button
                onClick={handleDownload}
                style={{
                  backgroundColor: 'transparent',
                  border: '1px solid #ff1493',
                  color: '#ff1493',
                  padding: '6px 12px',
                  borderRadius: '6px',
                  fontSize: '11px',
                  fontWeight: 'bold',
                  cursor: 'pointer',
                  textTransform: 'uppercase'
                }}
              >
                Descargar
              </button>
            </div>
          )}
        </div>
        
        <div style={{ height: '400px', width: '100%' }}>
          <Editor
            height="100%"
            theme="vs-dark"
            path={activeFile || 'welcome.tsx'}
            defaultLanguage="typescript"
            value={currentCode}
            options={{
              readOnly: true,
              minimap: { enabled: false },
              fontSize: 12,
              wordWrap: 'on',
              padding: { top: 12 }
            }}
          />
        </div>
      </div>
    </div>
  );
}
