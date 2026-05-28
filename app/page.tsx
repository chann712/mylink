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
import { IconBrandGoogle, IconLoader2 } from "@tabler/icons-react";

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
    <div className="min-h-svh bg-white flex flex-col">
      <Header
        user={user}
        displayName=""
        onLogin={handleLogin}
        onLogout={handleLogout}
        isLoading={authLoading}
      />

      <main className="flex-1 flex flex-col items-center justify-center px-4 py-16 selection:bg-blue-100 text-zinc-900 font-sans relative overflow-hidden">
        {/* Soft background ambient glow */}
        <div className="fixed top-[-10%] left-[-10%] w-[50vw] h-[50vw] rounded-full bg-blue-50/40 blur-[120px] pointer-events-none z-0" />
        <div className="fixed bottom-[-10%] right-[-10%] w-[50vw] h-[50vw] rounded-full bg-indigo-50/40 blur-[120px] pointer-events-none z-0" />

        {authLoading ? (
          <div className="flex flex-col items-center justify-center py-12 z-10">
            <IconLoader2 className="w-8 h-8 animate-spin text-blue-600 mb-2" />
            <p className="text-sm font-bold text-zinc-400">정보를 확인하는 중...</p>
          </div>
        ) : (
          <div className="relative w-full max-w-4xl flex flex-col items-center text-center z-10 my-auto">
            {/* Hero Main Heading */}
            <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-zinc-900 mb-6 leading-tight max-w-3xl">
              Development in{" "}
              <span className="text-blue-600 font-extrabold">One Link</span>.
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
              className="h-14 px-8 gap-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-extrabold transition-all shadow-lg shadow-blue-600/20 active:scale-[0.98] cursor-pointer text-base sm:text-lg mb-16"
            >
              <IconBrandGoogle className="w-5 h-5 stroke-[2.5]" />
              <span>Google로 시작하기</span>
            </Button>

            {/* Elegant 3D Mockup Illustration using pure CSS */}
            <div
              className="relative w-full max-w-[380px] aspect-[16/10] bg-white border border-zinc-200/50 rounded-3xl p-6 shadow-[0_25px_50px_-12px_rgba(0,0,0,0.08)] select-none pointer-events-none transition-transform duration-500 hover:scale-[1.02] flex flex-col justify-between"
              style={{
                transform: "perspective(1200px) rotateX(14deg) rotateY(-8deg) rotateZ(-12deg) skewX(2deg)",
                transformStyle: "preserve-3d",
              }}
            >
              {/* Mockup Profile Info Row */}
              <div className="flex items-center gap-3.5 mb-6">
                <div className="w-10 h-10 rounded-full bg-zinc-100 shrink-0" />
                <div className="flex flex-col gap-1.5 w-full">
                  <div className="w-24 h-3 bg-zinc-100 rounded-full" />
                  <div className="w-14 h-2 bg-zinc-50 rounded-full" />
                </div>
              </div>

              {/* Mockup Links Area */}
              <div className="flex flex-col gap-2.5 w-full">
                {/* Link slot 1 (Highlighted Active Link in blue) */}
                <div className="w-full h-11 bg-blue-50/30 border border-blue-100/50 rounded-xl flex items-center px-3.5">
                  <div className="w-5 h-5 rounded-full bg-blue-100 border border-blue-200 shrink-0" />
                  <div className="w-full h-4 bg-blue-100/50 rounded-lg ml-3" />
                </div>

                {/* Link slot 2 (Soft Gray Link) */}
                <div className="w-full h-11 bg-zinc-50/50 border border-zinc-100 rounded-xl flex items-center px-3.5">
                  <div className="w-5 h-5 rounded-full bg-zinc-100 shrink-0" />
                  <div className="w-full h-4 bg-zinc-100/60 rounded-lg ml-3" />
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

