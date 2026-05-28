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
import { IconPlus, IconTrash, IconDeviceMobile, IconLock } from "@tabler/icons-react";

export default function MyPage() {
  const [links, setLinks] = useState<Link[]>(dummyLinks);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  
  // Form State
  const [newTitle, setNewTitle] = useState("");
  const [newUrl, setNewUrl] = useState("");
  const [error, setError] = useState("");

  const handleOpenChange = (open: boolean) => {
    setIsDialogOpen(open);
    if (!open) {
      setNewTitle("");
      setNewUrl("");
      setError("");
    }
  };

  const handleAddLink = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!newTitle.trim()) {
      alert("제목을 입력해주세요");
      return;
    }

    if (!newUrl.trim()) {
      alert("주소를 입력해주세요");
      return;
    }

    let formattedUrl = newUrl.trim();
    if (!formattedUrl.startsWith("http://") && !formattedUrl.startsWith("https://")) {
      formattedUrl = "https://" + formattedUrl;
    }

    try {
      const urlObj = new URL(formattedUrl);
      const domain = urlObj.hostname;
      const faviconUrl = `https://www.google.com/s2/favicons?domain=${domain}&sz=64`;

      const newLinkItem: Link = {
        id: `link-admin-${Date.now()}`,
        title: newTitle.trim(),
        url: formattedUrl,
        faviconUrl,
        createdAt: new Date().toISOString(),
      };

      setLinks((prev) => [newLinkItem, ...prev]);
      handleOpenChange(false);
    } catch (err) {
      setError("올바른 URL 형식을 입력해주세요.");
    }
  };

  const handleDeleteLink = (id: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setLinks((prev) => prev.filter((link) => link.id !== id));
  };

  return (
    <main className="relative flex min-h-svh flex-col items-center justify-center overflow-hidden bg-zinc-50 px-4 py-8 selection:bg-zinc-200 text-zinc-900 font-sans">
      
      {/* 관리자 모드 표시 배지 */}
      <div className="fixed top-6 left-6 z-50 flex items-center gap-2 px-3 py-1.5 rounded-full bg-zinc-900 text-white text-[10px] font-black uppercase tracking-widest shadow-xl">
        <IconLock className="w-3 h-3" />
        Admin Mode
      </div>

      <div className="fixed top-[-10%] left-[-10%] w-[50vw] h-[50vw] rounded-full bg-zinc-200/40 blur-[100px] pointer-events-none" />
      <div className="fixed bottom-[-10%] right-[-10%] w-[50vw] h-[50vw] rounded-full bg-slate-200/40 blur-[100px] pointer-events-none" />
      
      <div className="relative w-full max-w-[480px] flex flex-col items-center z-10 my-auto">
        {/* Profile Header (Public과 동일) */}
        <header className="mb-10 w-full flex flex-col items-center text-center">
          <div className="mb-5 inline-flex items-center justify-center rounded-full bg-white px-8 py-3 border border-zinc-200 shadow-sm transition-shadow">
            <h1 className="text-3xl font-extrabold tracking-tight text-zinc-900">
              My Links
            </h1>
          </div>
          <p className="text-sm text-zinc-500 font-medium tracking-wide max-w-[280px] leading-relaxed">
             안녕하세요. 모든 작업물과 소셜 미디어를 한곳에서 확인하실 수 있습니다.
          </p>
        </header>

        {/* Action Area: Add Link Button (Public과 동일한 스타일) */}
        <section className="w-full mb-6 relative">
          <Dialog open={isDialogOpen} onOpenChange={handleOpenChange}>
            <DialogTrigger asChild>
              <button className="w-full group flex items-center justify-center gap-3 py-4 rounded-2xl bg-white border border-zinc-200 shadow-sm hover:shadow-md hover:border-zinc-300 transition-all duration-300 outline-none focus-visible:ring-2 ring-zinc-200">
                <div className="flex items-center justify-center w-6 h-6 rounded-full bg-primary text-primary-foreground group-hover:scale-110 transition-transform duration-300">
                  <IconPlus className="w-4 h-4" />
                </div>
                <span className="font-bold text-zinc-900 tracking-tight">새 링크 추가</span>
              </button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px] bg-white border-zinc-200 text-zinc-900 rounded-3xl shadow-2xl p-0 overflow-hidden">
              <form onSubmit={handleAddLink}>
                <DialogHeader className="p-8 pb-4">
                  <DialogTitle className="text-2xl font-black text-zinc-900">새 링크 추가</DialogTitle>
                  <DialogDescription className="text-zinc-500 font-medium mt-1">
                    프로필에 표시할 링크 정보를 입력해 주세요.
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-6 p-8 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="title" className="text-xs font-black uppercase tracking-widest text-zinc-400 ml-1">
                      링크 제목
                    </Label>
                    <Input
                      id="title"
                      placeholder="링크 제목 입력"
                      value={newTitle}
                      onChange={(e) => setNewTitle(e.target.value)}
                      className="h-13 rounded-2xl bg-zinc-50 border-zinc-200 focus-visible:ring-primary text-base font-bold"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="url" className="text-xs font-black uppercase tracking-widest text-zinc-400 ml-1">
                      링크 주소
                    </Label>
                    <Input
                      id="url"
                      placeholder="https://..."
                      value={newUrl}
                      onChange={(e) => setNewUrl(e.target.value)}
                      className="h-13 rounded-2xl bg-zinc-50 border-zinc-200 focus-visible:ring-primary text-base font-bold"
                      dir="ltr"
                    />
                  </div>
                  {error && <p className="text-sm font-bold text-red-500 ml-1">{error}</p>}
                </div>
                <DialogFooter className="p-8 pt-4 flex-col sm:flex-row gap-3">
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => handleOpenChange(false)}
                    className="h-13 px-6 hover:bg-zinc-100 text-zinc-500 font-bold rounded-2xl flex-1"
                  >
                    취소
                  </Button>
                  <Button
                    type="submit"
                    className="h-13 px-10 font-black rounded-2xl bg-primary text-primary-foreground shadow-xl shadow-primary/20 transition-all active:scale-95 flex-1"
                  >
                    추가
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </section>

        {/* Link List (Public과 동일한 카드 디자인에 삭제 버튼 추가) */}
        <section className="w-full flex flex-col gap-3">
          {links.map((link) => (
            <div
              key={link.id}
              className="w-full relative group"
            >
              <Card className="w-full bg-white border-zinc-100 shadow-sm hover:shadow-xl hover:shadow-zinc-200/50 hover:border-zinc-200 transition-all duration-300 ease-out hover:-translate-y-1 overflow-hidden p-0 rounded-2xl">
                <CardContent className="p-4 flex items-center relative min-h-[72px] w-full">
                  
                  {/* Left Icon Area */}
                  <div className="absolute left-4 flex shrink-0 items-center justify-center w-12 h-12 rounded-2xl bg-zinc-50 border border-zinc-100 shadow-sm group-hover:bg-white transition-all duration-300">
                    {link.faviconUrl ? (
                      <img
                        src={link.faviconUrl}
                        alt={link.title}
                        className="w-6 h-6 object-contain"
                      />
                    ) : (
                      <IconPlus className="w-5 h-5 text-zinc-300 rotate-45" />
                    )}
                  </div>
                  
                  {/* Center Text Area */}
                  <div className="flex-1 text-center">
                    <span className="text-[16px] font-bold tracking-tight text-zinc-800 group-hover:text-zinc-900 transition-colors duration-300">
                      {link.title}
                    </span>
                  </div>

                  {/* Right Action: Delete Button */}
                  <button
                    onClick={(e) => handleDeleteLink(link.id, e)}
                    className="absolute right-4 p-2.5 text-zinc-200 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                    title="삭제"
                  >
                    <IconTrash className="w-5 h-5" />
                  </button>
                </CardContent>
              </Card>
            </div>
          ))}
        </section>

        {/* Footer Branding */}
        <footer className="mt-14 mb-4">
          <div className="flex items-center justify-center gap-2 opacity-30 hover:opacity-100 transition-all duration-500 cursor-default font-black text-[10px] uppercase text-zinc-900 tracking-[0.2em]">
            Admin View
          </div>
        </footer>
      </div>
    </main>
  );
}
