import './globals.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'My Snap Vault',
  description: 'Public photo gallery with private uploader',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-gray-50 text-gray-900">
        <header className="border-b bg-white">
          <div className="mx-auto max-w-5xl px-4 py-4 flex items-center justify-between">
            <a href="/" className="text-xl font-semibold">MySnapVault</a>
            <nav className="space-x-4">
              <a href="/" className="text-sm text-gray-600 hover:text-gray-900">Gallery</a>
              <a href="/upload" className="text-sm text-gray-600 hover:text-gray-900">Upload</a>
            </nav>
          </div>
        </header>
        <main className="mx-auto max-w-5xl px-4 py-6">{children}</main>
      </body>
    </html>
  );
}
