"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { auth } from "@/lib/firebase";
import {
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
  onAuthStateChanged,
  type User,
} from "firebase/auth";
import Header from "@/components/Header";
import { Button } from "@/components/ui/button";
import {
  IconBrandGoogle,
  IconLoader2,
  IconBrandGithub,
  IconArticle,
  IconArrowRight,
} from "@tabler/icons-react";

export default function Page() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);

  // 구글 로그인 처리
  const handleLogin = async () => {
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
    } catch (err) {
      console.error("Login failed:", err);
    }
  };

  // 로그아웃 처리
  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (err) {
      console.error("Logout failed:", err);
    }
  };

  // Auth 상태 구독 및 로그인 시 리다이렉션
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setAuthLoading(false);
      
      // 이미 로그인되어 있으면 즉시 관리 페이지(/mypage)로 리다이렉트
      if (currentUser) {
        router.push("/mypage");
      }
    });

    return () => unsubscribe();
  }, [router]);

  return (
    <div className="min-h-svh bg-zinc-50/30 flex flex-col">
      <Header
        user={user}
        displayName=""
        onLogin={handleLogin}
        onLogout={handleLogout}
        isLoading={authLoading}
      />

      <main className="flex-1 flex flex-col items-center justify-center px-4 py-16 selection:bg-blue-100 text-zinc-900 font-sans relative overflow-hidden">
        {/* Soft background ambient aurora glow */}
        <div className="fixed top-[-15%] left-[-15%] w-[60vw] h-[60vw] rounded-full bg-blue-200/20 blur-[130px] pointer-events-none z-0" />
        <div className="fixed bottom-[-15%] right-[-15%] w-[60vw] h-[60vw] rounded-full bg-indigo-200/20 blur-[130px] pointer-events-none z-0" />

        {authLoading ? (
          <div className="flex flex-col items-center justify-center py-12 z-10">
            <IconLoader2 className="w-8 h-8 animate-spin text-blue-600 mb-2" />
            <p className="text-sm font-bold text-zinc-400">정보를 확인하는 중...</p>
          </div>
        ) : (
          <div className="relative w-full max-w-4xl flex flex-col items-center text-center z-10 my-auto">
            {/* Hero Main Heading with premium gradient */}
            <h1 className="text-5xl sm:text-7xl font-extrabold tracking-tight text-zinc-950 mb-6 leading-[1.1] max-w-3xl">
              Development in{" "}
              <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent font-black">
                One Link
              </span>
              .
            </h1>

            {/* Hero Sub Description */}
            <p className="text-base sm:text-lg text-zinc-500 font-bold leading-relaxed tracking-tight mb-10 max-w-xl">
              GitHub, 블로그, 포트폴리오까지.
              <br />
              개발자를 위한 모든 링크를 한 페이지에 담아보세요.
            </p>

            {/* Hero CTA Button: Google Login */}
            <Button
              onClick={handleLogin}
              className="h-14 px-8 gap-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-extrabold transition-all shadow-lg hover:shadow-xl hover:shadow-blue-500/25 hover:-translate-y-0.5 active:scale-[0.98] cursor-pointer text-base sm:text-lg mb-16 duration-300"
            >
              <IconBrandGoogle className="w-5 h-5 stroke-[2.5]" />
              <span>Google로 시작하기</span>
            </Button>

            {/* Elegant 3D Glassmorphism Mockup Illustration */}
            <div
              className="relative w-full max-w-[360px] aspect-[16/10] bg-white/70 backdrop-blur-xl border border-white/50 rounded-3xl p-6 shadow-[0_30px_70px_-15px_rgba(0,0,0,0.06)] select-none pointer-events-none transition-transform duration-500 hover:scale-[1.03] flex flex-col justify-between"
              style={{
                transform: "perspective(1200px) rotateX(15deg) rotateY(-8deg) rotateZ(-12deg) skewX(2deg)",
                transformStyle: "preserve-3d",
              }}
            >
              {/* Mockup Profile Info Row (Real data feel) */}
              <div className="flex items-center gap-3.5 mb-6 text-left">
                <div className="w-11 h-11 rounded-full bg-gradient-to-tr from-blue-500 to-indigo-500 flex items-center justify-center text-white font-black text-sm border border-white shadow-sm shrink-0">
                  M
                </div>
                <div className="flex flex-col gap-1 w-full">
                  <span className="text-[13px] font-black text-zinc-800 leading-none">
                    minsoo.dev
                  </span>
                  <div className="flex">
                    <span className="text-[8px] font-black tracking-wide text-blue-600 bg-blue-50/80 border border-blue-100/50 px-2 py-0.5 rounded-full uppercase">
                      Frontend Dev
                    </span>
                  </div>
                </div>
              </div>

              {/* Mockup Links Area */}
              <div className="flex flex-col gap-2.5 w-full text-left">
                {/* Link slot 1 (GitHub) */}
                <div className="w-full h-12 bg-white/90 border border-zinc-100 rounded-xl flex items-center justify-between px-3.5 shadow-[0_2px_4px_rgba(0,0,0,0.02)]">
                  <div className="flex items-center gap-2.5">
                    <div className="w-6 h-6 rounded-lg bg-zinc-950 text-white flex items-center justify-center shrink-0">
                      <IconBrandGithub className="w-3.5 h-3.5 stroke-[2.5]" />
                    </div>
                    <span className="text-[11px] font-black text-zinc-700">
                      GitHub / @minsoo-dev
                    </span>
                  </div>
                  <IconArrowRight className="w-3 h-3 text-zinc-300 stroke-[3]" />
                </div>

                {/* Link slot 2 (Tech Blog) */}
                <div className="w-full h-12 bg-white/90 border border-zinc-100 rounded-xl flex items-center justify-between px-3.5 shadow-[0_2px_4px_rgba(0,0,0,0.02)]">
                  <div className="flex items-center gap-2.5">
                    <div className="w-6 h-6 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 border border-blue-100">
                      <IconArticle className="w-3.5 h-3.5 stroke-[2.5]" />
                    </div>
                    <span className="text-[11px] font-black text-zinc-700">
                      Tech Blog / devlog
                    </span>
                  </div>
                  <IconArrowRight className="w-3 h-3 text-zinc-300 stroke-[3]" />
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}


