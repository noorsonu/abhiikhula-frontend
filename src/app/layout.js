import { Suspense } from 'react';
import "./globals.css";
import Navbar from "@/components/Navbar";

export const metadata = {
  title: "AbhiiKhula | Hyperlocal Live Availability & Virtual Queue",
  description: "Ghar baithe pata karo kaun si dukan khuli hai aur contactless token book karo.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="hi">
      <body className="min-h-screen bg-slate-50 text-slate-900 flex flex-col antialiased selection:bg-sky-500 selection:text-white">
        <Suspense fallback={<div className="h-18 bg-white border-b border-sky-100" />}>
          <Navbar />
        </Suspense>
        
        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-28 md:pb-16">
          <Suspense fallback={<div className="py-20 text-center text-sm font-semibold text-slate-400">Loading...</div>}>
            {children}
          </Suspense>
        </main>

        <footer className="hidden md:block bg-white border-t border-sky-100 py-10 text-xs text-slate-500">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <span className="font-black text-slate-900 text-sm">AbhiiKhula</span>
              <span>— Hyperlocal Live Availability & Queue Architecture (AKH-BRD-001)</span>
            </div>
            <p className="text-slate-400">
              Built with Next.js, Framer Motion & Sky Glow. Pilot Live in Lucknow.
            </p>
          </div>
        </footer>
      </body>
    </html>
  );
}
