"use client";

import { useState, useEffect, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { dummyLinks, type Link } from "@/data/links";
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
import {
  IconPlus,
  IconTrash,
  IconLock,
  IconDeviceMobile,
  IconEdit,
  IconExternalLink,
  IconCheck,
  IconArrowRight,
} from "@tabler/icons-react";

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

export default function MyPage() {
  const [links, setLinks] = useState<Link[]>(dummyLinks);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // 프로필 정보 상태
  const [displayName, setDisplayName] = useState("My Links");
  const [bio, setBio] = useState("안녕하세요. 모든 작업물과 소셜 미디어를 한곳에서 확인하실 수 있습니다.");

  // 프로필 인라인 편집 상태
  const [isEditingName, setIsEditingName] = useState(false);
  const [tempName, setTempName] = useState("");
  const [isEditingBio, setIsEditingBio] = useState(false);
  const [tempBio, setTempBio] = useState("");

  // 링크 인라인 편집 상태
  const [editingLinkId, setEditingLinkId] = useState<string | null>(null);
  const [editingField, setEditingField] = useState<"title" | "url" | null>(null);
  const [editingValue, setEditingValue] = useState("");

  const nameInputRef = useRef<HTMLInputElement>(null);
  const bioTextareaRef = useRef<HTMLTextAreaElement>(null);
  const linkInputRef = useRef<HTMLInputElement>(null);

  // 포커스 제어
  useEffect(() => {
    if (isEditingName && nameInputRef.current) {
      nameInputRef.current.focus();
      nameInputRef.current.select();
    }
  }, [isEditingName]);

  useEffect(() => {
    if (isEditingBio && bioTextareaRef.current) {
      bioTextareaRef.current.focus();
      bioTextareaRef.current.select();
    }
  }, [isEditingBio]);

  useEffect(() => {
    if (editingLinkId && linkInputRef.current) {
      linkInputRef.current.focus();
      linkInputRef.current.select();
    }
  }, [editingLinkId, editingField]);

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

  // 신규 링크 추가
  const onSubmit = (data: LinkFormValues) => {
    try {
      const urlObj = new URL(data.url);
      const domain = urlObj.hostname;
      const faviconUrl = `https://www.google.com/s2/favicons?domain=${domain}&sz=64`;

      const newLinkItem: Link = {
        id: `link-admin-${Date.now()}`,
        title: data.title.trim(),
        url: data.url,
        faviconUrl,
        createdAt: new Date().toISOString(),
      };

      setLinks((prev) => [newLinkItem, ...prev]);
      handleOpenChange(false);
    } catch (err) {
      console.error("URL parsing error", err);
    }
  };

  // 링크 삭제
  const handleDeleteLink = (id: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setLinks((prev) => prev.filter((link) => link.id !== id));
  };

  // 닉네임 편집 저장 및 롤백
  const handleNameSave = () => {
    const trimmed = tempName.trim();
    if (trimmed === "") {
      setTempName(displayName); // 무음 롤백
    } else {
      setDisplayName(trimmed);
    }
    setIsEditingName(false);
  };

  // 소개글 편집 저장 및 롤백
  const handleBioSave = () => {
    const trimmed = tempBio.trim();
    if (trimmed === "") {
      setTempBio(bio); // 무음 롤백
    } else if (trimmed.length > 80) {
      setTempBio(bio); // 글자수 제한 초과 시 롤백
    } else {
      setBio(trimmed);
    }
    setIsEditingBio(false);
  };

  // 링크 편집 저장 및 롤백
  const handleLinkSave = (id: string, field: "title" | "url") => {
    const trimmed = editingValue.trim();
    const originalLink = links.find((l) => l.id === id);

    if (!originalLink) {
      setEditingLinkId(null);
      setEditingField(null);
      return;
    }

    if (trimmed === "") {
      // 무음 롤백
      setEditingLinkId(null);
      setEditingField(null);
      return;
    }

    setLinks((prev) =>
      prev.map((link) => {
        if (link.id === id) {
          if (field === "title") {
            return { ...link, title: trimmed };
          } else {
            // URL인 경우 https:// 처리 및 파비콘 재생성
            let formattedUrl = trimmed;
            if (!formattedUrl.startsWith("http://") && !formattedUrl.startsWith("https://")) {
              formattedUrl = "https://" + formattedUrl;
            }
            try {
              const urlObj = new URL(formattedUrl);
              const domain = urlObj.hostname;
              const faviconUrl = `https://www.google.com/s2/favicons?domain=${domain}&sz=64`;
              return { ...link, url: formattedUrl, faviconUrl };
            } catch {
              // 유효하지 않은 URL인 경우 롤백
              return link;
            }
          }
        }
        return link;
      })
    );

    setEditingLinkId(null);
    setEditingField(null);
  };

  return (
    <main className="relative min-h-svh bg-zinc-50/50 text-zinc-950 font-sans px-4 py-8 selection:bg-zinc-200">
      {/* Background ambient lighting */}
      <div className="fixed top-[-10vw] left-[-10vw] w-[40vw] h-[40vw] rounded-full bg-zinc-200/50 blur-[120px] pointer-events-none z-0" />
      <div className="fixed bottom-[-10vw] right-[-10vw] w-[40vw] h-[40vw] rounded-full bg-slate-200/50 blur-[120px] pointer-events-none z-0" />

      {/* Admin Mode Badge */}
      <div className="fixed top-6 left-6 z-50 flex items-center gap-2 px-3 py-1.5 rounded-full bg-zinc-900 text-white text-[10px] font-black uppercase tracking-widest shadow-xl">
        <IconLock className="w-3.5 h-3.5 text-emerald-400" />
        Admin Mode
      </div>

      <div className="relative max-w-6xl mx-auto z-10 w-full mt-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* LEFT: Editing Panel (7 columns) */}
          <section className="lg:col-span-7 flex flex-col gap-6">
            
            {/* Header & Title */}
            <div className="flex flex-col gap-1 pb-4 border-b border-zinc-200/60">
              <h1 className="text-3xl font-black tracking-tight text-zinc-900">대시보드</h1>
              <p className="text-sm font-semibold text-zinc-500">프로필 정보와 링크들을 실시간으로 편집 관리하세요.</p>
            </div>

            {/* Profile Info Setup Card */}
            <Card className="bg-white border-zinc-200/60 shadow-sm rounded-2xl overflow-hidden p-6">
              <h2 className="text-sm font-black uppercase tracking-wider text-zinc-400 mb-6">프로필 설정</h2>
              
              <div className="flex flex-col gap-5">
                {/* Nickname (displayName) */}
                <div className="flex flex-col gap-2">
                  <Label className="text-xs font-bold text-zinc-500">닉네임</Label>
                  {isEditingName ? (
                    <div className="flex gap-2">
                      <Input
                        ref={nameInputRef}
                        value={tempName}
                        onChange={(e) => setTempName(e.target.value)}
                        onBlur={handleNameSave}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") handleNameSave();
                          if (e.key === "Escape") {
                            setTempName(displayName);
                            setIsEditingName(false);
                          }
                        }}
                        className="h-11 rounded-xl bg-zinc-50 border-zinc-200 font-bold focus-visible:ring-zinc-900"
                      />
                      <Button onClick={handleNameSave} size="icon" className="h-11 w-11 rounded-xl bg-zinc-900 text-white hover:bg-zinc-800 shrink-0">
                        <IconCheck className="w-4 h-4" />
                      </Button>
                    </div>
                  ) : (
                    <div
                      onClick={() => {
                        setTempName(displayName);
                        setIsEditingName(true);
                      }}
                      className="group flex items-center justify-between h-11 px-4 rounded-xl bg-zinc-50 hover:bg-zinc-100/80 border border-zinc-200/50 cursor-pointer transition-colors"
                    >
                      <span className="font-bold text-zinc-900">{displayName}</span>
                      <IconEdit className="w-4 h-4 text-zinc-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                  )}
                </div>

                {/* Bio (Introduction) */}
                <div className="flex flex-col gap-2">
                  <div className="flex justify-between items-center">
                    <Label className="text-xs font-bold text-zinc-500">소개글</Label>
                    <span className="text-[10px] font-bold text-zinc-400">
                      {isEditingBio ? tempBio.length : bio.length}/80자
                    </span>
                  </div>
                  {isEditingBio ? (
                    <div className="flex flex-col gap-2">
                      <textarea
                        ref={bioTextareaRef}
                        value={tempBio}
                        onChange={(e) => {
                          if (e.target.value.length <= 80) {
                            setTempBio(e.target.value);
                          }
                        }}
                        onBlur={handleBioSave}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" && !e.shiftKey) {
                            e.preventDefault();
                            handleBioSave();
                          }
                          if (e.key === "Escape") {
                            setTempBio(bio);
                            setIsEditingBio(false);
                          }
                        }}
                        placeholder="소개글을 입력해주세요 (최대 80자)"
                        className="flex min-h-[80px] w-full rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-2 text-sm font-semibold text-zinc-700 placeholder:text-zinc-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-950 disabled:cursor-not-allowed disabled:opacity-50 resize-none"
                      />
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          onClick={() => {
                            setTempBio(bio);
                            setIsEditingBio(false);
                          }}
                          className="h-9 px-4 text-zinc-500 font-bold rounded-lg hover:bg-zinc-100"
                        >
                          취소
                        </Button>
                        <Button onClick={handleBioSave} className="h-9 px-4 bg-zinc-900 text-white hover:bg-zinc-800 font-bold rounded-lg">
                          저장
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div
                      onClick={() => {
                        setTempBio(bio);
                        setIsEditingBio(true);
                      }}
                      className="group flex items-start justify-between min-h-[72px] p-4 rounded-xl bg-zinc-50 hover:bg-zinc-100/80 border border-zinc-200/50 cursor-pointer transition-colors"
                    >
                      <span className="font-semibold text-zinc-700 text-sm leading-relaxed whitespace-pre-wrap">{bio}</span>
                      <IconEdit className="w-4 h-4 text-zinc-400 opacity-0 group-hover:opacity-100 transition-opacity shrink-0 ml-2 mt-0.5" />
                    </div>
                  )}
                </div>
              </div>
            </Card>

            {/* Links Management Area */}
            <div className="flex flex-col gap-4">
              <div className="flex justify-between items-center">
                <h2 className="text-sm font-black uppercase tracking-wider text-zinc-400">링크 관리</h2>
                
                {/* Add Link Dialog */}
                <Dialog open={isDialogOpen} onOpenChange={handleOpenChange}>
                  <DialogTrigger className="inline-flex items-center justify-center h-10 px-4 gap-2 font-black text-sm rounded-xl bg-primary text-primary-foreground hover:opacity-90 shadow-lg shadow-primary/10 transition-all active:scale-95 cursor-pointer">
                    <IconPlus className="w-4 h-4" />
                    새 링크 추가
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[425px] bg-white border-zinc-200 text-zinc-900 rounded-3xl shadow-2xl p-0 overflow-hidden">
                    <form onSubmit={handleSubmit(onSubmit)}>
                      <DialogHeader className="p-8 pb-4">
                        <DialogTitle className="text-2xl font-black text-zinc-900">새 링크 추가</DialogTitle>
                        <DialogDescription className="text-zinc-500 font-medium mt-1">
                          프로필에 표시할 링크 정보를 입력해 주세요. URL 입력 시 주소창 형식을 입력하시면 자동으로 검증 처리됩니다.
                        </DialogDescription>
                      </DialogHeader>
                      <div className="grid gap-6 p-8 py-4">
                        <div className="grid gap-2">
                          <Label htmlFor="title" className="text-xs font-black uppercase tracking-widest text-zinc-400 ml-1">
                            링크 제목
                          </Label>
                          <Input
                            id="title"
                            placeholder="예: 내 포트폴리오, Instagram"
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
              </div>

              {/* Editable Link List */}
              <div className="flex flex-col gap-3">
                {links.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-16 px-4 rounded-2xl border border-dashed border-zinc-200 bg-white text-center">
                    <span className="text-4xl mb-3">📁</span>
                    <p className="text-sm font-bold text-zinc-400">아직 등록된 링크가 없습니다.</p>
                  </div>
                ) : (
                  links.map((link) => (
                    <Card key={link.id} className="relative group bg-white border-zinc-200/60 shadow-sm hover:shadow-md transition-all rounded-2xl overflow-hidden p-4">
                      <div className="flex gap-4 items-center w-full pr-10">
                        {/* Favicon Icon Box */}
                        <div className="flex shrink-0 items-center justify-center w-12 h-12 rounded-2xl bg-zinc-50 border border-zinc-100 shadow-sm">
                          {link.faviconUrl ? (
                            <img
                              src={link.faviconUrl}
                              alt={link.title}
                              className="w-6 h-6 object-contain"
                            />
                          ) : (
                            <span className="text-zinc-300 text-xs font-black">Link</span>
                          )}
                        </div>

                        {/* Title and URL Edit Box */}
                        <div className="flex-1 flex flex-col gap-1.5 min-w-0">
                          {/* Inline Title Edit */}
                          {editingLinkId === link.id && editingField === "title" ? (
                            <input
                              ref={linkInputRef}
                              value={editingValue}
                              onChange={(e) => setEditingValue(e.target.value)}
                              onBlur={() => handleLinkSave(link.id, "title")}
                              onKeyDown={(e) => {
                                if (e.key === "Enter") handleLinkSave(link.id, "title");
                                if (e.key === "Escape") setEditingLinkId(null);
                              }}
                              className="h-8 w-full bg-zinc-50 border border-zinc-200 rounded-lg px-2 text-[15px] font-bold text-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-900"
                            />
                          ) : (
                            <div
                              onClick={() => {
                                setEditingLinkId(link.id);
                                setEditingField("title");
                                setEditingValue(link.title);
                              }}
                              className="group/item flex items-center gap-1.5 cursor-pointer max-w-fit"
                            >
                              <span className="text-[15px] font-extrabold text-zinc-800 group-hover/item:text-zinc-950 truncate">
                                {link.title}
                              </span>
                              <IconEdit className="w-3.5 h-3.5 text-zinc-400 opacity-0 group-hover/item:opacity-100 transition-opacity" />
                            </div>
                          )}

                          {/* Inline URL Edit */}
                          {editingLinkId === link.id && editingField === "url" ? (
                            <input
                              ref={linkInputRef}
                              value={editingValue}
                              onChange={(e) => setEditingValue(e.target.value)}
                              onBlur={() => handleLinkSave(link.id, "url")}
                              onKeyDown={(e) => {
                                if (e.key === "Enter") handleLinkSave(link.id, "url");
                                if (e.key === "Escape") setEditingLinkId(null);
                              }}
                              className="h-7 w-full bg-zinc-50 border border-zinc-200 rounded-lg px-2 text-xs font-semibold text-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-900"
                            />
                          ) : (
                            <div
                              onClick={() => {
                                setEditingLinkId(link.id);
                                setEditingField("url");
                                setEditingValue(link.url);
                              }}
                              className="group/item flex items-center gap-1.5 cursor-pointer max-w-fit"
                            >
                              <span className="text-xs font-semibold text-zinc-400 group-hover/item:text-zinc-600 truncate max-w-[280px]">
                                {link.url}
                              </span>
                              <IconEdit className="w-3.5 h-3.5 text-zinc-400 opacity-0 group-hover/item:opacity-100 transition-opacity" />
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Delete Button (pinned to the right) */}
                      <button
                        onClick={(e) => handleDeleteLink(link.id, e)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 p-2.5 text-zinc-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                        title="삭제"
                      >
                        <IconTrash className="w-5 h-5" />
                      </button>
                    </Card>
                  ))
                )}
              </div>
            </div>
          </section>

          {/* RIGHT: Live Preview Pane (5 columns) */}
          <section className="lg:col-span-5 flex flex-col items-center lg:sticky lg:top-10 py-6 lg:py-0">
            <div className="flex items-center gap-2 mb-4 font-bold text-xs text-zinc-500">
              <IconDeviceMobile className="w-4 h-4" />
              <span>실시간 모바일 미리보기</span>
            </div>

            {/* SmartPhone Mockup Shell */}
            <div className="relative w-full max-w-[340px] aspect-[9/19] rounded-[48px] border-[12px] border-zinc-950 bg-white shadow-2xl overflow-hidden flex flex-col z-10 ring-8 ring-zinc-200/50">
              
              {/* Phone Camera Notch */}
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-6 bg-zinc-950 rounded-b-2xl z-30 flex items-center justify-center">
                <div className="w-2.5 h-2.5 rounded-full bg-zinc-800" />
              </div>

              {/* Preview Content Inside */}
              <div className="flex-1 flex flex-col overflow-y-auto px-5 py-12 bg-zinc-50/70 select-none ltr-content relative">
                
                {/* Soft ambient blur in mobile screen */}
                <div className="absolute top-[-20%] left-[-20%] w-[80%] h-[80%] rounded-full bg-zinc-200/30 blur-[40px] pointer-events-none" />
                <div className="absolute bottom-[-20%] right-[-20%] w-[80%] h-[80%] rounded-full bg-slate-200/30 blur-[40px] pointer-events-none" />
                
                {/* Header */}
                <header className="mb-8 w-full flex flex-col items-center text-center mt-4 z-10">
                  <div className="mb-4 inline-flex items-center justify-center rounded-full bg-white px-6 py-2 border border-zinc-200/80 shadow-sm">
                    <h3 className="text-xl font-extrabold tracking-tight text-zinc-900 break-all">
                      {displayName}
                    </h3>
                  </div>
                  <p className="text-xs text-zinc-500 font-semibold leading-relaxed tracking-wide max-w-[220px] break-words">
                    {bio}
                  </p>
                </header>

                {/* Links list wrapper */}
                <div className="w-full flex flex-col gap-2.5 z-10 flex-1">
                  {links.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-10 px-4 rounded-xl border border-dashed border-zinc-200 bg-white/80 text-center my-auto">
                      <span className="text-2xl mb-1">📁</span>
                      <p className="text-[11px] font-bold text-zinc-400">아직 등록된 링크가 없습니다.</p>
                    </div>
                  ) : (
                    links.map((link) => (
                      <a
                        key={link.id}
                        href={link.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full outline-none group cursor-pointer"
                      >
                        <Card className="w-full bg-white border-zinc-100/80 shadow-sm hover:shadow-md hover:border-zinc-200 transition-all duration-200 rounded-xl overflow-hidden p-0">
                          <CardContent className="p-3.5 flex items-center relative min-h-[56px] w-full">
                            
                            {/* Left Favicon Area */}
                            {link.faviconUrl ? (
                              <div className="absolute left-3 flex shrink-0 items-center justify-center w-8 h-8 rounded-lg bg-zinc-50 border border-zinc-100 shadow-sm group-hover:bg-white transition-colors">
                                <img
                                  src={link.faviconUrl}
                                  alt={link.title}
                                  className="w-4 h-4 object-contain"
                                />
                              </div>
                            ) : (
                              <div className="absolute left-3 flex shrink-0 items-center justify-center w-8 h-8 rounded-lg bg-zinc-50 border border-zinc-100" />
                            )}
                            
                            {/* Center Text Area */}
                            <div className="flex-1 text-center px-10">
                              <span className="text-[13px] font-extrabold tracking-tight text-zinc-800 group-hover:text-zinc-950 transition-colors">
                                {link.title}
                              </span>
                            </div>

                            {/* Right Arrow */}
                            <div className="absolute right-4 text-zinc-300 group-hover:text-zinc-400 group-hover:translate-x-0.5 transition-all">
                              <IconArrowRight className="w-3.5 h-3.5 stroke-[3]" />
                            </div>
                          </CardContent>
                        </Card>
                      </a>
                    ))
                  )}
                </div>

                {/* Footer branding logo */}
                <footer className="mt-8 mb-2 shrink-0 z-10">
                  <div className="flex items-center justify-center gap-1.5 opacity-30 hover:opacity-100 transition-opacity cursor-default">
                    <span className="text-[8px] font-black tracking-[0.2em] uppercase text-zinc-900">
                      Powered by MyLink
                    </span>
                  </div>
                </footer>
              </div>
            </div>
          </section>

        </div>
      </div>
    </main>
  );
}
