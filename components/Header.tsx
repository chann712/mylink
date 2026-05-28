"use client";

import Link from "next/link";
import { User } from "firebase/auth";
import { Button } from "@/components/ui/button";
import { IconBrandGoogle, IconLogout, IconExternalLink } from "@tabler/icons-react";

interface HeaderProps {
  user: User | null;
  displayName: string;
  onLogin: () => Promise<void>;
  onLogout: () => Promise<void>;
  isLoading: boolean;
}

export default function Header({ user, displayName, onLogin, onLogout, isLoading }: HeaderProps) {
  // 로그인 상태에서 표시할 이름 결정 (Firestore의 displayName이 있으면 우선 사용, 없으면 구글 displayName 혹은 이메일 앞부분)
  const getUserDisplayName = () => {
    if (displayName) return displayName;
    if (user?.displayName) return user.displayName;
    if (user?.email) {
      return user.email.split("@")[0];
    }
    return "사용자";
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-zinc-200/80 bg-white/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        {/* Left Side: Brand Logo and Public Link */}
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center gap-2 group">
            <span className="text-xl font-black tracking-tight bg-gradient-to-r from-zinc-900 to-zinc-700 bg-clip-text text-transparent">
              MyLink
            </span>
          </Link>

          {user && displayName && (
            <a
              href={`/mypage`} // 혹은 닉네임 기반 퍼블릭 프로필 페이지 주소
              target="_blank"
              rel="noopener noreferrer"
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-zinc-100 hover:bg-zinc-200/80 text-zinc-600 hover:text-zinc-800 text-xs font-bold transition-all"
            >
              <span>내 마이페이지</span>
              <IconExternalLink className="w-3.5 h-3.5" />
            </a>
          )}
        </div>

        {/* Right Side: Auth Action Button & User Info */}
        <div className="flex items-center gap-4">
          {isLoading ? (
            <div className="h-9 w-24 animate-pulse rounded-xl bg-zinc-100" />
          ) : user ? (
            <div className="flex items-center gap-3.5">
              {/* Profile Avatar */}
              {user?.photoURL ? (
                <img
                  src={user.photoURL}
                  alt={`${getUserDisplayName()} 프로필 아바타`}
                  className="w-8 h-8 rounded-full object-cover border border-zinc-200 shadow-sm select-none"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <div className="flex w-8 h-8 rounded-full bg-zinc-900 text-white font-black text-sm items-center justify-center border border-zinc-700 shadow-sm select-none">
                  {getUserDisplayName().charAt(0).toUpperCase()}
                </div>
              )}

              <span className="text-sm font-bold text-zinc-700">
                <span className="text-zinc-950 font-black">{getUserDisplayName()}</span>님
              </span>
              <Button
                variant="ghost"
                onClick={onLogout}
                className="h-9 gap-1.5 px-3 rounded-xl border border-zinc-200 hover:bg-zinc-50 hover:text-red-600 text-zinc-500 font-bold transition-colors cursor-pointer text-xs"
              >
                <IconLogout className="w-4 h-4" />
                <span>로그아웃</span>
              </Button>
            </div>
          ) : (
            <Button
              onClick={onLogin}
              className="h-9 gap-2 px-4 rounded-xl bg-zinc-950 hover:bg-zinc-800 text-white font-bold transition-all shadow-sm active:scale-95 cursor-pointer text-xs sm:text-sm"
            >
              <IconBrandGoogle className="w-4 h-4" />
              <span>Google로 로그인</span>
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}
