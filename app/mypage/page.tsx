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
import { IconExternalLink, IconTrash, IconPlus } from "@tabler/icons-react";

export default function MyPage() {
  const [links, setLinks] = useState<Link[]>(dummyLinks);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
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

    if (!newTitle.trim() || !newUrl.trim()) {
      setError("제목과 주소를 모두 입력해주세요.");
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
        id: `link-${Date.now()}`,
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

  const handleDeleteLink = (id: string) => {
    setLinks((prev) => prev.filter((link) => link.id !== id));
  };

  return (
    <main className="min-h-svh bg-zinc-50 font-sans text-zinc-900 selection:bg-zinc-200 px-4 py-12">
      <div className="mx-auto max-w-[540px]">
        
        {/* 상단: 제목 섹션 */}
        <header className="mb-10">
          <h1 className="text-3xl font-black tracking-tight text-zinc-900 mb-2">
            내 링크 관리
          </h1>
          <p className="text-zinc-500 font-medium">
            프로필에 표시될 링크를 자유롭게 추가하고 관리하세요.
          </p>
        </header>

        {/* 중간: 링크 추가 버튼 및 다이얼로그 */}
        <section className="mb-12">
          <Dialog open={isDialogOpen} onOpenChange={handleOpenChange}>
            <DialogTrigger asChild>
              <button className="w-full group flex items-center justify-center gap-3 py-5 rounded-2xl bg-white border border-dashed border-zinc-300 text-zinc-400 hover:text-zinc-900 hover:border-zinc-900 hover:bg-zinc-50 transition-all duration-300 outline-none focus-visible:ring-2 ring-zinc-900">
                <div className="flex items-center justify-center w-6 h-6 rounded-full bg-zinc-100 text-zinc-400 group-hover:bg-zinc-900 group-hover:text-white transition-all duration-300">
                  <IconPlus className="w-4 h-4" />
                </div>
                <span className="font-bold tracking-tight">새 링크 추가</span>
              </button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px] bg-white border-zinc-200 text-zinc-900 rounded-3xl shadow-2xl p-0 overflow-hidden">
              <form onSubmit={handleAddLink}>
                <DialogHeader className="p-8 pb-4">
                  <DialogTitle className="text-2xl font-black text-zinc-900">새 링크 추가</DialogTitle>
                  <DialogDescription className="text-zinc-500 font-medium mt-1">
                    추가할 링크의 정보를 입력해 주세요.
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
                      className="h-13 rounded-2xl bg-zinc-50 border-zinc-200 focus-visible:ring-zinc-900 text-base font-bold"
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
                      className="h-13 rounded-2xl bg-zinc-50 border-zinc-200 focus-visible:ring-zinc-900 text-base font-bold"
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
                    className="h-13 px-10 font-black rounded-2xl shadow-xl shadow-indigo-100 transition-all active:scale-95 flex-1"
                    style={{ backgroundColor: "#5B5FC7", color: "#FFFFFF" }}
                  >
                    추가
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </section>

        {/* 하단: 링크 목록 */}
        <section className="space-y-4">
          <div className="flex items-center justify-between mb-4 px-1">
            <h2 className="text-lg font-bold text-zinc-800">등록된 링크</h2>
            <span className="text-xs font-bold text-zinc-400 uppercase tracking-widest">
              {links.length} Links
            </span>
          </div>
          
          <div className="grid gap-3">
            {links.map((link) => (
              <div
                key={link.id}
                className="group flex items-center gap-3 p-3 bg-white border border-zinc-200 rounded-2xl shadow-sm hover:shadow-md transition-all duration-300"
              >
                {/* 파비콘 */}
                <div className="flex shrink-0 items-center justify-center w-12 h-12 rounded-xl bg-zinc-50 border border-zinc-100 group-hover:bg-white transition-colors">
                  {link.faviconUrl ? (
                    <img
                      src={link.faviconUrl}
                      alt={link.title}
                      className="w-6 h-6 object-contain"
                    />
                  ) : (
                    <IconExternalLink className="w-5 h-5 text-zinc-300" />
                  )}
                </div>

                {/* 링크 정보 */}
                <div className="flex-1 min-w-0">
                  <h3 className="text-[15px] font-bold text-zinc-800 truncate mb-0.5">
                    {link.title}
                  </h3>
                  <p className="text-xs text-zinc-400 truncate" dir="ltr">
                    {link.url}
                  </p>
                </div>

                {/* 관리 버튼 (삭제) */}
                <button
                  onClick={() => handleDeleteLink(link.id)}
                  className="p-2.5 text-zinc-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all active:scale-90"
                  title="삭제"
                >
                  <IconTrash className="w-5 h-5" />
                </button>
              </div>
            ))}

            {links.length === 0 && (
              <div className="text-center py-12 border-2 border-dashed border-zinc-200 rounded-3xl">
                <p className="text-zinc-400 font-medium">등록된 링크가 없습니다.</p>
              </div>
            )}
          </div>
        </section>

        {/* 푸터 */}
        <footer className="mt-20 py-8 text-center border-t border-zinc-100">
          <p className="text-[10px] font-black text-zinc-300 tracking-[0.3em] uppercase">
            MyLink Admin Dashboard
          </p>
        </footer>
      </div>
    </main>
  );
}
