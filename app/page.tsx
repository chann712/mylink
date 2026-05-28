"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { db } from "@/lib/firebase";
import { collection, addDoc, getDocs, query, orderBy, serverTimestamp, doc, deleteDoc } from "firebase/firestore";
import { type Link } from "@/data/links";
import { linkSchema, type LinkFormValues } from "@/lib/schemas";
import LinkCard from "@/components/LinkCard";
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

export default function Page() {
  const [links, setLinks] = useState<Link[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [deletingLink, setDeletingLink] = useState<Link | null>(null);

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
    formState: { errors },
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

      setLinks((prev) => [newLinkItem, ...prev]);
      handleOpenChange(false);
    } catch (err) {
      console.error("Link add error", err);
    }
  };

  const handleUpdateLink = (updatedLink: Link) => {
    setLinks((prev) => prev.map((l) => (l.id === updatedLink.id ? updatedLink : l)));
  };

  const handleDeleteConfirm = async () => {
    if (!deletingLink) return;
    try {
      const docRef = doc(db, "users", "anonymous", "links", deletingLink.id);
      await deleteDoc(docRef);
      setLinks((prev) => prev.filter((l) => l.id !== deletingLink.id));
      setDeletingLink(null);
    } catch (err) {
      console.error("Failed to delete link:", err);
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
              <LinkCard
                key={link.id}
                link={link}
                onUpdate={handleUpdateLink}
                onDeleteClick={setDeletingLink}
              />
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

      {/* 삭제 확인 모달 */}
      <Dialog open={!!deletingLink} onOpenChange={(open) => { if (!open) setDeletingLink(null); }}>
        <DialogContent className="sm:max-w-[425px] bg-white border-zinc-200 text-zinc-900 rounded-3xl shadow-2xl p-0 overflow-hidden">
          <DialogHeader className="p-8 pb-4">
            <DialogTitle className="text-2xl font-black text-zinc-900">정말 삭제하시겠습니까?</DialogTitle>
            <DialogDescription className="text-zinc-500 font-medium mt-1">
              선택한 링크가 영구적으로 삭제됩니다.
            </DialogDescription>
          </DialogHeader>
          <div className="p-8 py-4 flex flex-col gap-3">
            <div className="rounded-2xl bg-zinc-50 border border-zinc-100 p-4">
              <span className="text-xs font-black uppercase tracking-widest text-zinc-400 block mb-1">
                링크 이름
              </span>
              <span className="text-base font-bold text-zinc-800">
                {deletingLink?.title}
              </span>
            </div>
            <p className="text-xs font-bold text-red-500 ml-1">
              이 작업은 되돌릴 수 없습니다.
            </p>
          </div>
          <DialogFooter className="p-8 pt-4 flex gap-3">
            <Button
              type="button"
              variant="ghost"
              onClick={() => setDeletingLink(null)}
              className="h-13 px-6 hover:bg-zinc-100 text-zinc-500 font-bold rounded-2xl flex-1"
            >
              취소
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={handleDeleteConfirm}
              className="h-13 px-6 font-black rounded-2xl transition-all active:scale-95 flex-1"
            >
              삭제하기
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </main>
  );
}
