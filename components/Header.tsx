"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { User } from "firebase/auth";
import { Button } from "@/components/ui/button";
import {
  IconLogout,
  IconExternalLink,
  IconUser,
  IconSettings,
} from "@tabler/icons-react";

interface HeaderProps {
  user: User | null;
  displayName: string;
  username: string;
  onLogin: () => Promise<void>;
  onLogout: () => Promise<void>;
  isLoading: boolean;
}

export default function Header({ user, displayName, username, onLogin, onLogout, isLoading }: HeaderProps) {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // 로그인 상태에서 표시할 이름 결정
  const getUserDisplayName = () => {
    if (displayName) return displayName;
    if (user?.displayName) return user.displayName;
    if (user?.email) {
      return user.email.split("@")[0];
    }
    return "사용자";
  };

  // 드롭다운 외부 클릭 감지 및 닫기
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    }

    // ESC 키 입력 시 닫기
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsDropdownOpen(false);
      }
    }

    if (isDropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("keydown", handleKeyDown);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isDropdownOpen]);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-zinc-200/80 bg-white/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        {/* Left Side: Brand Logo */}
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center gap-2 group">
            <span className="text-xl font-black tracking-tight bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent hover:opacity-90 transition-opacity select-none">
              MyLink
            </span>
          </Link>
        </div>

        {/* Right Side: Auth Action Button & Profile Dropdown */}
        <div className="flex items-center gap-4">
          {isLoading ? (
            <div className="h-9 w-24 animate-pulse rounded-xl bg-zinc-100" />
          ) : user ? (
            <div className="relative" ref={dropdownRef}>
              {/* Profile Avatar Button */}
              <button
                onClick={() => setIsDropdownOpen((prev) => !prev)}
                className="flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2 rounded-full transition-all active:scale-95 cursor-pointer"
                aria-expanded={isDropdownOpen}
                aria-haspopup="true"
              >
                {user?.photoURL ? (
                  <img
                    src={user.photoURL}
                    alt={`${getUserDisplayName()} 프로필 아바타`}
                    className="w-9 h-9 rounded-full object-cover border border-zinc-200 shadow-sm hover:border-zinc-300 transition-all select-none"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <div className="flex w-9 h-9 rounded-full bg-blue-600 text-white font-black text-sm items-center justify-center border border-blue-500 shadow-sm hover:bg-blue-700 transition-colors select-none">
                    {getUserDisplayName().charAt(0).toUpperCase()}
                  </div>
                )}
              </button>

              {/* Dropdown Popover Card */}
              {isDropdownOpen && (
                <div className="absolute right-0 mt-2.5 w-64 origin-top-right rounded-2xl border border-zinc-200/80 bg-white p-2.5 shadow-xl ring-1 ring-black/5 focus:outline-none animate-in fade-in slide-in-from-top-1 duration-100 z-50">
                  {/* User Profile Header in Dropdown */}
                  <div className="flex flex-col px-3.5 py-3 border-b border-zinc-100 mb-2">
                    <span className="text-sm font-black text-zinc-900 truncate">
                      {getUserDisplayName()}
                    </span>
                    {user?.email && (
                      <span className="text-xs font-semibold text-zinc-400 truncate mt-0.5">
                        {user.email}
                      </span>
                    )}
                  </div>

                  {/* Navigation Links */}
                  <div className="flex flex-col gap-1">
                    <Link
                      href="/mypage"
                      onClick={() => setIsDropdownOpen(false)}
                      className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-zinc-600 hover:text-blue-600 hover:bg-blue-50/40 text-xs font-bold transition-all group"
                    >
                      <IconSettings className="w-4 h-4 text-zinc-400 group-hover:text-blue-500 transition-colors" />
                      <span>마이페이지 관리</span>
                    </Link>
                    <Link
                      href={username ? `/${username}` : "#"}
                      onClick={() => setIsDropdownOpen(false)}
                      className={`flex items-center gap-2.5 px-3 py-2 rounded-xl hover:text-blue-600 hover:bg-blue-50/40 text-xs font-bold transition-all group ${
                        username ? "text-zinc-600" : "text-zinc-400 pointer-events-none opacity-55"
                      }`}
                    >
                      <IconUser className="w-4 h-4 text-zinc-400 group-hover:text-blue-500 transition-colors" />
                      <span>내 프로필 보기</span>
                      <IconExternalLink className="w-3 h-3 text-zinc-300 ml-auto" />
                    </Link>
                  </div>

                  {/* Separator */}
                  <div className="h-px bg-zinc-100 my-2" />

                  {/* Logout Action Button */}
                  <button
                    onClick={async () => {
                      setIsDropdownOpen(false);
                      await onLogout();
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-zinc-500 hover:text-red-600 hover:bg-red-50/50 text-xs font-bold transition-all text-left cursor-pointer"
                  >
                    <IconLogout className="w-4 h-4 text-zinc-400" />
                    <span>로그아웃</span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            // Logout state: show Google login button
            <Button
              onClick={onLogin}
              className="h-9 px-4 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold transition-all shadow-sm active:scale-95 cursor-pointer text-xs flex items-center justify-center"
            >
              <span>로그인</span>
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}


