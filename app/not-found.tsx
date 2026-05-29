"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { IconHome, IconHelp } from "@tabler/icons-react";

export default function NotFound() {
  return (
    <div className="min-h-svh bg-zinc-50/50 flex flex-col justify-center items-center px-4 relative overflow-hidden selection:bg-zinc-200">
      {/* Background ambient light */}
      <div className="fixed top-[-10vw] left-[-10vw] w-[45vw] h-[45vw] rounded-full bg-zinc-200/50 blur-[130px] pointer-events-none z-0" />
      <div className="fixed bottom-[-10vw] right-[-10vw] w-[45vw] h-[45vw] rounded-full bg-slate-200/50 blur-[130px] pointer-events-none z-0" />

      <div className="relative max-w-md w-full text-center z-10">
        {/* Brand logo container */}
        <div className="flex justify-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-white border border-zinc-200/80 flex items-center justify-center shadow-lg text-zinc-950 font-black text-2xl tracking-tighter select-none animate-bounce">
            ML
          </div>
        </div>

        {/* 404 Main card */}
        <div className="bg-white/80 backdrop-blur-xl border border-zinc-200/80 shadow-2xl rounded-3xl p-8 sm:p-12 relative overflow-hidden">
          <div className="absolute top-[-20%] left-[-20%] w-[60%] h-[60%] rounded-full bg-zinc-100/50 blur-[80px] pointer-events-none" />
          
          <div className="relative flex flex-col items-center">
            {/* Status indicator badge */}
            <span className="text-[10px] font-black tracking-widest text-zinc-400 bg-zinc-100 px-3 py-1 rounded-full uppercase mb-4">
              Error 404
            </span>

            {/* Error Message */}
            <h1 className="text-2xl sm:text-3xl font-black text-zinc-900 tracking-tight mb-4 leading-tight">
              페이지를 찾을 수 없습니다
            </h1>
            
            <p className="text-sm font-semibold text-zinc-500 leading-relaxed mb-8 max-w-[280px]">
              요청하신 페이지가 존재하지 않거나, 주소가 잘못 입력되었을 수 있습니다.
            </p>

            {/* Home CTA Button */}
            <div className="flex flex-col gap-3 w-full">
              <Button
                asChild
                className="w-full h-13 gap-2.5 rounded-2xl bg-zinc-950 hover:bg-zinc-800 text-white font-black transition-all shadow-xl shadow-zinc-950/10 active:scale-[0.98] cursor-pointer text-sm"
              >
                <Link href="/">
                  <IconHome className="w-4 h-4" />
                  <span>홈으로 돌아가기</span>
                </Link>
              </Button>

              <Button
                asChild
                variant="ghost"
                className="w-full h-13 gap-2.5 rounded-2xl text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100 font-bold transition-all cursor-pointer text-sm"
              >
                <Link href="/mypage">
                  <IconHelp className="w-4 h-4" />
                  <span>내 마이페이지 관리하기</span>
                </Link>
              </Button>
            </div>
          </div>
        </div>

        {/* Footer info */}
        <p className="text-xs font-semibold text-zinc-400 mt-8 select-none">
          &copy; {new Date().getFullYear()} MyLink. All rights reserved.
        </p>
      </div>
    </div>
  );
}
