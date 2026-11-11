import { Suspense } from 'react';
import "./globals.css";
import Navbar from "@/components/Navbar";

export const metadata = {
  title: "AbhiiKhula | Hyperlocal Live Availability & Virtual Queue Platform",
  description: "Check live store availability, current crowd status, and book digital queue tokens from home.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-[#eef2f6] text-slate-800 flex flex-col antialiased selection:bg-sky-600 selection:text-white">
        
        {/* Soft Muted Ambience (Balanced midtones) */}
        <div className="fixed top-0 left-1/3 w-[600px] h-[600px] bg-sky-200/40 rounded-full blur-[130px] pointer-events-none -z-10"></div>
        <div className="fixed bottom-10 right-1/4 w-[500px] h-[500px] bg-slate-300/40 rounded-full blur-[130px] pointer-events-none -z-10"></div>

        <Suspense fallback={<div className="h-20 bg-white/90 border-b border-slate-200" />}>
          <Navbar />
        </Suspense>
        
        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-32 md:pb-20">
          <Suspense fallback={<div className="py-24 text-center text-sm font-semibold text-slate-500">Loading platform...</div>}>
            {children}
          </Suspense>
        </main>

        <footer className="hidden md:block bg-slate-900 border-t border-slate-800 py-10 text-xs text-slate-400">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <span className="font-black text-white text-sm">AbhiiKhula</span>
              <span>— Hyperlocal Live Availability & Queue Architecture (AKH-BRD-001)</span>
            </div>
            <p className="text-slate-400 font-medium">
              Balanced Midtone Palette • Next.js & Framer Motion Engine • Lucknow Pilot Live
            </p>
          </div>
        </footer>
      </body>
    </html>
  );
}
