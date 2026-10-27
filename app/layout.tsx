import './globals.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'TMA AI Builder',
  description: 'Generador de juegos Web3 para Telegram',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body className="bg-gray-950 text-white min-h-screen">
        {children}
      </body>
    </html>
  );
}
 