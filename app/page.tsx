"use client";

import { useState } from "react";
import { dummyLinks, type Link } from "@/data/links";
import { Card, CardContent } from "@/components/ui/card";

export default function Page() {
  const [links, setLinks] = useState<Link[]>(dummyLinks);

  return (
    <main className="relative flex min-h-svh flex-col items-center justify-center overflow-hidden bg-zinc-50 px-4 py-8 selection:bg-zinc-200 text-zinc-900 font-sans">
      {/* Background ambient lighting (Soft Gradient effect for light theme) */}
      <div className="fixed top-[-10%] left-[-10%] w-[50vw] h-[50vw] rounded-full bg-zinc-200/40 blur-[100px] pointer-events-none" />
      <div className="fixed bottom-[-10%] right-[-10%] w-[50vw] h-[50vw] rounded-full bg-slate-200/40 blur-[100px] pointer-events-none" />
      
      <div className="relative w-full max-w-[480px] flex flex-col items-center z-10 my-auto">
        {/* Profile Header */}
        <header className="mb-10 w-full flex flex-col items-center text-center">
          <div className="mb-5 inline-flex items-center justify-center rounded-full bg-white px-8 py-3 border border-zinc-200 shadow-sm focus-within:shadow-md transition-shadow">
            <h1 className="text-3xl font-extrabold tracking-tight text-zinc-900">
              My Links
            </h1>
          </div>
          <p className="text-sm text-zinc-500 font-medium tracking-wide max-w-[280px] leading-relaxed">
             안녕하세요. 모든 작업물과 소셜 미디어를 한곳에서 확인하실 수 있습니다.
          </p>
        </header>

        {/* Link List */}
        <section className="w-full flex flex-col gap-3">
          {links.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 px-4 rounded-2xl border border-dashed border-zinc-200 bg-white/80 shadow-sm text-center backdrop-blur-sm">
              <span className="text-3xl mb-2">📁</span>
              <p className="text-sm font-bold text-zinc-400">아직 등록된 링크가 없습니다.</p>
            </div>
          ) : (
            links.map((link) => (
              <a
                key={link.id}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full outline-none group"
              >
                <Card className="w-full bg-white border-zinc-100 shadow-sm hover:shadow-xl hover:shadow-zinc-200/50 hover:border-zinc-200 transition-all duration-300 ease-out hover:-translate-y-1 group-focus-visible:ring-2 ring-zinc-900 ring-offset-2 ring-offset-white overflow-hidden relative p-0 rounded-2xl">
                  <CardContent className="p-4 flex items-center relative min-h-[72px] w-full">
                    
                    {/* Left Icon Area */}
                    {link.faviconUrl ? (
                      <div className="absolute left-4 flex shrink-0 items-center justify-center w-12 h-12 rounded-2xl bg-zinc-50 border border-zinc-100 shadow-sm group-hover:bg-white transition-all duration-300">
                        <img
                          src={link.faviconUrl}
                          alt={`${link.title} 아이콘`}
                          className="w-6 h-6 object-contain"
                        />
                      </div>
                    ) : (
                      <div className="absolute left-4 flex shrink-0 items-center justify-center w-12 h-12 rounded-2xl bg-zinc-50 border border-zinc-100" />
                    )}
                    
                    {/* Center Text Area */}
                    <div className="flex-1 text-center">
                      <span className="text-[16px] font-bold tracking-tight text-zinc-800 group-hover:text-zinc-900 transition-colors duration-300">
                        {link.title}
                      </span>
                    </div>

                    {/* Right Arrow Area */}
                    <div className="absolute right-6 opacity-0 group-hover:opacity-100 -translate-x-3 group-hover:translate-x-0 transition-all duration-300 text-zinc-400">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="18"
                        height="18"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="3"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="m9 18 6-6-6-6" />
                      </svg>
                    </div>
                  </CardContent>
                </Card>
              </a>
            ))
          )}
        </section>

        {/* Footer Branding */}
        <footer className="mt-14 mb-4">
          <div className="flex items-center justify-center gap-2 opacity-30 hover:opacity-100 transition-all duration-500 cursor-default">
            <span className="text-[10px] font-bold tracking-[0.2em] uppercase text-zinc-900">
              Powered by MyLink
            </span>
          </div>
        </footer>
      </div>
    </main>
  );
}
