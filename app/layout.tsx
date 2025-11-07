import './globals.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'My Snap Vault',
  description: 'Public photo gallery with private uploader',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-gradient-to-b from-black via-black to-neutral-900 text-white selection:bg-white/20 selection:text-white">
        <header className="border-b border-white/10 bg-white/5 backdrop-blur-md">
          <div className="mx-auto max-w-5xl px-4 py-4 flex items-center justify-between">
            <a href="/" className="text-xl font-semibold">MySnapVault</a>
            <nav className="space-x-4">
              <a href="/" className="text-sm text-white/70 hover:text-white">Gallery</a>
              <a href="/upload" className="text-sm text-white/70 hover:text-white">Upload</a>
            </nav>
          </div>
        </header>
        <main className="mx-auto max-w-5xl px-4 py-6">{children}</main>
      </body>
    </html>
  );
}
