"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
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

// Zod 스키마 정의
const linkSchema = z.object({
  title: z.string().min(1, "제목을 입력해주세요").max(50, "제목은 50자 이내로 입력해주세요"),
  url: z.string().min(1, "주소를 입력해주세요").refine((val) => {
    let url = val.trim();
    if (!url.startsWith("http://") && !url.startsWith("https://")) {
      url = "https://" + url;
    }
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  }, { message: "올바른 URL 형식을 입력해주세요" }),
});

type LinkFormValues = z.infer<typeof linkSchema>;

export default function Page() {
  const [links, setLinks] = useState<Link[]>(dummyLinks);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<LinkFormValues>({
    resolver: zodResolver(linkSchema),
    defaultValues: {
      title: "",
      url: "",
    },
  });

  const handleOpenChange = (open: boolean) => {
    setIsDialogOpen(open);
    if (!open) {
      reset();
    }
  };

  const onSubmit = (data: LinkFormValues) => {
    let formattedUrl = data.url.trim();
    if (!formattedUrl.startsWith("http://") && !formattedUrl.startsWith("https://")) {
      formattedUrl = "https://" + formattedUrl;
    }

    try {
      const urlObj = new URL(formattedUrl);
      const domain = urlObj.hostname;
      const faviconUrl = `https://www.google.com/s2/favicons?domain=${domain}&sz=64`;

      const newLinkItem: Link = {
        id: `link-temp-${Date.now()}`,
        title: data.title.trim(),
        url: formattedUrl,
        faviconUrl,
        createdAt: new Date().toISOString(),
      };

      setLinks((prev) => [...prev, newLinkItem]);
      handleOpenChange(false);
    } catch (err) {
      console.error("URL parsing error", err);
    }
  };

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

        {/* Action Area: Add Link Button */}
        <section className="w-full mb-6 relative">
          <Dialog open={isDialogOpen} onOpenChange={handleOpenChange}>
            <DialogTrigger asChild>
              <button className="w-full group flex items-center justify-center gap-3 py-4 rounded-2xl bg-white border border-zinc-200 shadow-sm hover:shadow-md hover:border-zinc-300 hover:bg-zinc-50 transition-all duration-300 outline-none focus-visible:ring-2 ring-zinc-200">
                <div className="flex items-center justify-center w-6 h-6 rounded-full bg-primary text-primary-foreground group-hover:scale-110 transition-transform duration-300">
                  <IconPlus className="w-4 h-4" />
                </div>
                <span className="font-bold text-zinc-900 tracking-tight">새 링크 추가</span>
              </button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px] bg-white border-zinc-200 text-zinc-900 rounded-2xl shadow-2xl">
              <form onSubmit={handleSubmit(onSubmit)}>
                <DialogHeader>
                  <DialogTitle className="text-xl font-bold text-zinc-900">새 링크 추가</DialogTitle>
                  <DialogDescription className="text-zinc-500 mt-1">
                    프로필에 표시할 링크의 제목과 목적지 URL을 입력해주세요.
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-6 py-6">
                  <div className="grid gap-2">
                    <Label htmlFor="title" className="text-sm font-semibold text-zinc-700">
                      제목
                    </Label>
                    <input
                      id="title"
                      placeholder="예: 내 블로그, Instagram"
                      {...register("title")}
                      className={`flex h-12 w-full rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-2 text-sm font-bold text-zinc-900 ring-offset-white file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-zinc-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${errors.title ? "border-red-500 focus-visible:ring-red-500" : ""}`}
                    />
                    {errors.title && <p className="text-xs font-medium text-red-500 mt-1">{errors.title.message}</p>}
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="url" className="text-sm font-semibold text-zinc-700">
                      URL
                    </Label>
                    <input
                      id="url"
                      placeholder="https://example.com"
                      {...register("url")}
                      className={`flex h-12 w-full rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-2 text-sm font-bold text-zinc-900 ring-offset-white file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-zinc-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${errors.url ? "border-red-500 focus-visible:ring-red-500" : ""}`}
                      dir="ltr"
                    />
                    {errors.url && <p className="text-xs font-medium text-red-500 mt-1">{errors.url.message}</p>}
                  </div>
                </div>
                <DialogFooter className="gap-2">
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => handleOpenChange(false)}
                    className="h-11 px-6 hover:bg-zinc-100 text-zinc-600 font-semibold rounded-xl"
                  >
                    취소
                  </Button>
                  <Button
                    type="submit"
                    className="h-11 px-8 bg-primary hover:opacity-90 text-primary-foreground font-bold rounded-xl shadow-lg shadow-primary/20 transition-all active:scale-95"
                  >
                    추가하기
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </section>

        {/* Link List */}
        <section className="w-full flex flex-col gap-3">
          {links.map((link) => (
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
          ))}
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
