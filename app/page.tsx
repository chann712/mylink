"use client";

import { useState } from "react";
import { dummyLinks, type Link } from "@/data/links";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { IconPlus } from "@tabler/icons-react";

export default function Page() {
  const [links, setLinks] = useState<Link[]>(dummyLinks);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  
  // Form State
  const [newTitle, setNewTitle] = useState("");
  const [newUrl, setNewUrl] = useState("");
  const [titleError, setTitleError] = useState("");
  const [urlError, setUrlError] = useState("");

  const handleOpenChange = (open: boolean) => {
    setIsDialogOpen(open);
    if (!open) {
      setNewTitle("");
      setNewUrl("");
      setTitleError("");
      setUrlError("");
    }
  };

  const handleAddLink = (e: React.FormEvent) => {
    e.preventDefault();
    setTitleError("");
    setUrlError("");

    let isValid = true;
    if (!newTitle.trim()) {
      setTitleError("제목을 입력해주세요.");
      isValid = false;
    } else if (newTitle.trim().length > 50) {
      setTitleError("제목은 50자를 초과할 수 없습니다.");
      isValid = false;
    }

    let formattedUrl = newUrl.trim();
    if (!formattedUrl.trim()) {
      setUrlError("URL을 입력해주세요.");
      isValid = false;
    } else {
      if (!formattedUrl.startsWith("http://") && !formattedUrl.startsWith("https://")) {
        formattedUrl = "https://" + formattedUrl;
      }
      try {
        const urlObj = new URL(formattedUrl);
        if (!urlObj.hostname.includes(".")) {
          setUrlError("올바른 도메인 주소(예: example.com)를 입력해주세요.");
          isValid = false;
        }
      } catch (err) {
        setUrlError("올바른 URL 형식이 아닙니다.");
        isValid = false;
      }
    }

    if (!isValid) return;

    let domain = "";
    try {
      const urlObj = new URL(formattedUrl);
      domain = urlObj.hostname;
    } catch (error) {
      // url 파싱 실패 시 원본 문자열 기반으로 시도
      domain = formattedUrl.replace(/^https?:\/\//, "").split("/")[0];
    }

    const faviconUrl = `https://www.google.com/s2/favicons?domain=${domain}&sz=64`;

    const newLinkItem: Link = {
      id: `link-temp-${Date.now()}`,
      title: newTitle.trim(),
      url: formattedUrl,
      faviconUrl,
      createdAt: new Date().toISOString(),
    };

    setLinks((prev) => [...prev, newLinkItem]);
    
    // Reset and close
    handleOpenChange(false);
  };

  return (
    <main className="relative flex min-h-svh flex-col items-center justify-center overflow-hidden bg-[#0c0a09] px-4 py-8 selection:bg-purple-500/30 text-white font-sans">
      {/* Background ambient lighting (Mesh Gradient effect) */}
      <div className="fixed top-[-10%] left-[-10%] w-[50vw] h-[50vw] rounded-full bg-violet-600/15 blur-[120px] pointer-events-none" />
      <div className="fixed bottom-[-10%] right-[-10%] w-[50vw] h-[50vw] rounded-full bg-fuchsia-600/15 blur-[120px] pointer-events-none" />
      
      <div className="relative w-full max-w-[480px] flex flex-col items-center z-10 my-auto">
        {/* Profile Header */}
        <header className="mb-10 w-full flex flex-col items-center text-center">
          <div className="mb-5 inline-flex items-center justify-center rounded-full bg-white/5 px-8 py-2.5 backdrop-blur-md border border-white/10 shadow-[0_4px_24px_-8px_rgba(0,0,0,0.5)]">
            <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-br from-white via-white to-white/40 bg-clip-text text-transparent">
              My Links
            </h1>
          </div>
          <p className="text-sm text-zinc-400 font-medium tracking-wide max-w-[280px] leading-relaxed">
             안녕하세요. 모든 작업물과 소셜 미디어를 한곳에서 확인하실 수 있습니다.
          </p>
        </header>

        {/* Link List */}
        <section className="w-full flex items-center flex-col gap-4">
          {links.map((link) => (
            <a
              key={link.id}
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full outline-none group"
            >
              {/* Card component acts as the Glassmorphism button */}
              <Card className="w-full bg-white/[0.04] border-white/10 backdrop-blur-xl hover:bg-white/[0.08] transition-all duration-300 ease-out hover:-translate-y-1 hover:shadow-[0_10px_40px_-10px_rgba(168,85,247,0.3)] hover:border-white/20 group-focus-visible:ring-2 ring-purple-500 ring-offset-2 ring-offset-[#0c0a09] overflow-hidden relative p-0 py-0 ring-0 text-white rounded-2xl">
                {/* Hover shine reflection inside card */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-[100%] group-hover:translate-x-[100%] transition-transform duration-700 pointer-events-none" />
                
                <CardContent className="p-4 flex items-center relative min-h-[72px] w-full">
                  
                  {/* Left Icon Area */}
                  {link.faviconUrl ? (
                    <div className="absolute left-4 flex shrink-0 items-center justify-center w-12 h-12 rounded-[14px] bg-white/10 shadow-inner border border-white/5 group-hover:scale-110 group-hover:bg-white/20 transition-all duration-300">
                      <img
                        src={link.faviconUrl}
                        alt={`${link.title} 아이콘`}
                        className="w-6 h-6 object-contain drop-shadow-md"
                      />
                    </div>
                  ) : (
                    <div className="absolute left-4 flex shrink-0 items-center justify-center w-12 h-12 rounded-[14px] bg-white/10 shadow-inner border border-white/5 group-hover:scale-110 transition-all duration-300" />
                  )}
                  
                  {/* Center Text Area */}
                  <div className="flex-1 text-center px-18">
                    <span className="text-[16px] font-bold tracking-wide text-zinc-100 group-hover:text-white transition-colors duration-300">
                      {link.title}
                    </span>
                  </div>

                  {/* Right Arrow Area (Fades in & slides right on hover) */}
                  <div className="absolute right-6 opacity-0 group-hover:opacity-100 -translate-x-3 group-hover:translate-x-0 transition-all duration-300 text-zinc-400 group-hover:text-white">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M5 12h14" />
                      <path d="m12 5 7 7-7 7" />
                    </svg>
                  </div>
                </CardContent>
              </Card>
            </a>
          ))}

          {/* Add Link Dialog */}
          <Dialog open={isDialogOpen} onOpenChange={handleOpenChange}>
            <DialogTrigger asChild>
              <button className="mt-4 w-full flex items-center justify-center gap-2 py-4 rounded-2xl border border-dashed border-white/20 text-zinc-400 hover:text-white hover:bg-white/5 hover:border-white/40 transition-all duration-300 outline-none focus-visible:ring-2 ring-purple-500 ring-offset-2 ring-offset-[#0c0a09]">
                <IconPlus className="w-5 h-5" />
                <span className="font-semibold tracking-wide">새 링크 추가</span>
              </button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px] bg-[#1a1818] border-white/10 text-white rounded-2xl">
              <form onSubmit={handleAddLink}>
                <DialogHeader>
                  <DialogTitle className="text-xl font-bold">새 링크 추가</DialogTitle>
                  <DialogDescription className="text-zinc-400">
                    프로필에 표시할 링크의 제목과 목적지 URL을 입력해주세요.
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-6 py-6">
                  <div className="grid gap-2">
                    <Label htmlFor="title" className="text-sm font-medium text-zinc-300">
                      제목
                    </Label>
                    <Input
                      id="title"
                      placeholder="예: 내 블로그, Instagram"
                      value={newTitle}
                      onChange={(e) => {
                        setNewTitle(e.target.value);
                        if (titleError) setTitleError("");
                      }}
                      className={`h-11 rounded-lg bg-black/50 text-white focus-visible:ring-purple-500 ${titleError ? "border-red-500" : "border-white/10"}`}
                    />
                    {titleError && <p className="text-xs text-red-500">{titleError}</p>}
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="url" className="text-sm font-medium text-zinc-300">
                      URL
                    </Label>
                    <Input
                      id="url"
                      placeholder="https://example.com"
                      value={newUrl}
                      onChange={(e) => {
                        setNewUrl(e.target.value);
                        if (urlError) setUrlError("");
                      }}
                      className={`relative flex h-11 w-full rounded-lg bg-black/50 px-3 py-2 text-base text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-500 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm ${urlError ? "border-red-500 border-2" : "border border-white/10"}`}
                      dir="ltr"
                    />
                    {urlError && <p className="text-xs text-red-500">{urlError}</p>}
                  </div>
                </div>
                <DialogFooter>
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => handleOpenChange(false)}
                    className="hover:bg-white/10 text-zinc-300 hover:text-white rounded-lg"
                  >
                    취소
                  </Button>
                  <Button
                    type="submit"
                    className="bg-purple-600 hover:bg-purple-700 text-white rounded-lg"
                  >
                    추가하기
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </section>

        {/* Footer Branding */}
        <footer className="mt-14 mb-4">
          <div className="flex items-center justify-center gap-2 opacity-40 hover:opacity-80 transition-opacity cursor-default">
            <span className="text-[10px] font-bold tracking-[0.25em] uppercase text-zinc-300">
              Powered by MyLink
            </span>
          </div>
        </footer>
      </div>
    </main>
  );
}
