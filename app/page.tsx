"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { db } from "@/lib/firebase";
import { collection, addDoc, getDocs, query, orderBy, serverTimestamp } from "firebase/firestore";
import { type Link } from "@/data/links";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
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

// Zod 스키마 정의 - url 입력 시 자동으로 https:// 를 접두어로 추가(transform)하고 유효성 검사 수행
const linkSchema = z.object({
  title: z.string().trim().min(1, "제목을 입력해주세요").max(50, "제목은 50자 이내로 입력해주세요"),
  url: z
    .string()
    .min(1, "주소를 입력해주세요")
    .transform((val) => {
      let trimmed = val.trim();
      if (!trimmed.startsWith("http://") && !trimmed.startsWith("https://")) {
        trimmed = "https://" + trimmed;
      }
      return trimmed;
    })
    .pipe(
      z.string().url("올바른 URL 형식을 입력해주세요").refine(
        (val) => {
          try {
            const urlObj = new URL(val);
            // 최소한 도메인에 점(.)이 포함되어 있는지 확인하여 '아무거나' 입력을 방지
            return urlObj.hostname.includes('.');
          } catch {
            return false;
          }
        },
        { message: "올바른 URL 형식을 입력해주세요" }
      )
    ),
});

type LinkFormValues = z.infer<typeof linkSchema>;

export default function Page() {
  const [links, setLinks] = useState<Link[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // Firestore에서 링크 목록 가져오기
  useEffect(() => {
    const fetchLinks = async () => {
      try {
        const linksRef = collection(db, "users", "anonymous", "links");
        const q = query(linksRef, orderBy("createdAt", "desc"));
        const querySnapshot = await getDocs(q);
        const fetchedLinks: Link[] = [];
        querySnapshot.forEach((doc) => {
          const data = doc.data();
          let faviconUrl = "";
          try {
            const urlObj = new URL(data.url || "");
            faviconUrl = `https://www.google.com/s2/favicons?domain=${urlObj.hostname}&sz=64`;
          } catch {
            // URL 형식 오류 시 기본 빈 값 처리
          }

          fetchedLinks.push({
            id: doc.id,
            title: data.title || "",
            url: data.url || "",
            faviconUrl: faviconUrl,
            createdAt: data.createdAt?.toDate?.()?.toISOString() || new Date().toISOString(),
          });
        });
        // Firestore 데이터만 목록에 세팅 (더미 데이터 제거)
        setLinks(fetchedLinks);
      } catch (err) {
        console.error("Failed to fetch links:", err);
      }
    };

    fetchLinks();
  }, []);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isValid },
  } = useForm<LinkFormValues>({
    resolver: zodResolver(linkSchema),
    mode: "onChange",
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

  const onSubmit = async (data: LinkFormValues) => {
    try {
      const urlObj = new URL(data.url);
      const domain = urlObj.hostname;
      const faviconUrl = `https://www.google.com/s2/favicons?domain=${domain}&sz=64`;

      // Firestore에 데이터 저장 (요청에 따라 title, url, createdAt, updateAt 4개 필드만 저장)
      const linksRef = collection(db, "users", "anonymous", "links");
      const docRef = await addDoc(linksRef, {
        title: data.title.trim(),
        url: data.url,
        createdAt: serverTimestamp(),
        updateAt: serverTimestamp(),
      });

      const newLinkItem: Link = {
        id: docRef.id,
        title: data.title.trim(),
        url: data.url,
        faviconUrl,
        createdAt: new Date().toISOString(),
      };

      // 새로 추가된 링크를 리스트 최상단에 배치
      setLinks((prev) => [newLinkItem, ...prev]);
      handleOpenChange(false);
    } catch (err) {
      console.error("Link add error", err);
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
            <DialogTrigger className="w-full group flex items-center justify-center gap-3 py-4 rounded-2xl bg-primary text-primary-foreground shadow-lg shadow-primary/20 hover:opacity-95 transition-all duration-300 outline-none cursor-pointer border border-transparent">
              <div className="flex items-center justify-center w-6 h-6 rounded-full bg-white text-primary group-hover:scale-110 transition-transform duration-300">
                <IconPlus className="w-4 h-4" />
              </div>
              <span className="font-bold text-primary-foreground tracking-tight">새 링크 추가</span>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px] bg-white border-zinc-200 text-zinc-900 rounded-3xl shadow-2xl p-0 overflow-hidden">
              <form onSubmit={handleSubmit(onSubmit)}>
                <DialogHeader className="p-8 pb-4">
                  <DialogTitle className="text-2xl font-black text-zinc-900">새 링크 추가</DialogTitle>
                  <DialogDescription className="text-zinc-500 font-medium mt-1">
                    프로필에 표시할 링크 정보를 입력해 주세요. URL 입력 시 자동으로 형식이 검증됩니다.
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-6 p-8 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="title" className="text-xs font-black uppercase tracking-widest text-zinc-400 ml-1">
                      링크 제목
                    </Label>
                    <Input
                      id="title"
                      placeholder="예: 내 블로그, Instagram"
                      {...register("title")}
                      className={`h-13 rounded-2xl bg-zinc-50 border-zinc-200 focus-visible:ring-zinc-900 text-base font-bold ${errors.title ? "border-red-500 focus-visible:ring-red-500" : ""}`}
                    />
                    {errors.title && <p className="text-xs font-bold text-red-500 ml-1">{errors.title.message}</p>}
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="url" className="text-xs font-black uppercase tracking-widest text-zinc-400 ml-1">
                      링크 주소
                    </Label>
                    <Input
                      id="url"
                      placeholder="예: github.com/username 또는 https://..."
                      {...register("url")}
                      className={`h-13 rounded-2xl bg-zinc-50 border-zinc-200 focus-visible:ring-zinc-900 text-base font-bold ${errors.url ? "border-red-500 focus-visible:ring-red-500" : ""}`}
                      dir="ltr"
                    />
                    {errors.url && <p className="text-xs font-bold text-red-500 ml-1">{errors.url.message}</p>}
                  </div>
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
                    className="h-13 px-10 font-black rounded-2xl bg-primary hover:opacity-90 text-primary-foreground shadow-xl shadow-primary/20 transition-all active:scale-95 flex-1"
                  >
                    추가
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </section>

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
