"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { linkSchema, type LinkFormValues } from "@/lib/schemas";
import { type Link } from "@/data/links";
import { db } from "@/lib/firebase";
import { doc, updateDoc, serverTimestamp } from "firebase/firestore";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { IconPencil, IconTrash, IconLoader2 } from "@tabler/icons-react";

interface LinkCardProps {
  link: Link;
  onUpdate: (updatedLink: Link) => void;
  onDeleteClick: (link: Link) => void;
}

export default function LinkCard({ link, onUpdate, onDeleteClick }: LinkCardProps) {
  const [isEditing, setIsEditing] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<LinkFormValues>({
    resolver: zodResolver(linkSchema),
    mode: "onChange",
    defaultValues: {
      title: link.title,
      url: link.url,
    },
  });

  const onSave = async (data: LinkFormValues) => {
    try {
      const urlObj = new URL(data.url);
      const domain = urlObj.hostname;
      const faviconUrl = `https://www.google.com/s2/favicons?domain=${domain}&sz=64`;

      // Firebase Firestore의 문서 업데이트
      const docRef = doc(db, "users", "anonymous", "links", link.id);
      await updateDoc(docRef, {
        title: data.title.trim(),
        url: data.url,
        updateAt: serverTimestamp(),
      });

      // 부모 컴포넌트의 상태 업데이트
      onUpdate({
        ...link,
        title: data.title.trim(),
        url: data.url,
        faviconUrl,
      });

      setIsEditing(false);
    } catch (err) {
      console.error("Failed to update link:", err);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    reset({
      title: link.title,
      url: link.url,
    });
  };

  if (isEditing) {
    return (
      <Card className="w-full bg-white border-zinc-200 shadow-md p-5 rounded-2xl transition-all duration-300">
        <form onSubmit={handleSubmit(onSave)} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <Label
              htmlFor={`edit-title-${link.id}`}
              className="text-xs font-black uppercase tracking-widest text-zinc-400 ml-1"
            >
              링크 제목
            </Label>
            <Input
              id={`edit-title-${link.id}`}
              placeholder="예: 내 블로그, Instagram"
              {...register("title")}
              disabled={isSubmitting}
              className={`h-11 rounded-xl bg-zinc-50 border-zinc-200 focus-visible:ring-zinc-900 text-sm font-bold ${
                errors.title ? "border-red-500 focus-visible:ring-red-500" : ""
              }`}
            />
            {errors.title && <p className="text-xs font-bold text-red-500 ml-1">{errors.title.message}</p>}
          </div>

          <div className="flex flex-col gap-1.5">
            <Label
              htmlFor={`edit-url-${link.id}`}
              className="text-xs font-black uppercase tracking-widest text-zinc-400 ml-1"
            >
              링크 주소
            </Label>
            <Input
              id={`edit-url-${link.id}`}
              placeholder="예: github.com/username 또는 https://..."
              {...register("url")}
              disabled={isSubmitting}
              className={`h-11 rounded-xl bg-zinc-50 border-zinc-200 focus-visible:ring-zinc-900 text-sm font-bold ${
                errors.url ? "border-red-500 focus-visible:ring-red-500" : ""
              }`}
              dir="ltr"
            />
            {errors.url && <p className="text-xs font-bold text-red-500 ml-1">{errors.url.message}</p>}
          </div>

          <div className="flex items-center justify-end gap-2 pt-1 border-t border-zinc-100">
            <Button
              type="button"
              variant="ghost"
              onClick={handleCancel}
              className="h-9 px-4 hover:bg-zinc-100 text-zinc-500 font-bold rounded-xl text-xs"
              disabled={isSubmitting}
            >
              취소
            </Button>
            <Button
              type="submit"
              className="h-9 px-5 font-black rounded-xl bg-primary hover:opacity-90 text-primary-foreground shadow-sm transition-all active:scale-95 text-xs flex items-center justify-center gap-1.5"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <IconLoader2 className="animate-spin w-4 h-4" />
                  <span>저장 중...</span>
                </>
              ) : (
                "저장"
              )}
            </Button>
          </div>
        </form>
      </Card>
    );
  }

  return (
    <div className="relative w-full group">
      {/* 카드 전체 영역: 카드 내부를 클릭하면 링크가 열림 */}
      <a
        href={link.url}
        target="_blank"
        rel="noopener noreferrer"
        className="w-full outline-none block"
      >
        <Card className="w-full bg-white border-zinc-100 shadow-sm hover:shadow-xl hover:shadow-zinc-200/50 hover:border-zinc-200 transition-all duration-300 ease-out hover:-translate-y-1 group-focus-visible:ring-2 ring-zinc-900 ring-offset-2 ring-offset-white overflow-hidden relative p-0 rounded-2xl">
          <CardContent className="p-4 flex items-center justify-between relative min-h-[72px] w-full">
            
            {/* 좌측 아이콘 & 중앙 타이틀 영역 */}
            <div className="flex items-center flex-1 pr-24">
              {link.faviconUrl ? (
                <div className="flex shrink-0 items-center justify-center w-12 h-12 rounded-2xl bg-zinc-50 border border-zinc-100 shadow-sm transition-all duration-300">
                  <img
                    src={link.faviconUrl}
                    alt={`${link.title} 아이콘`}
                    className="w-6 h-6 object-contain"
                  />
                </div>
              ) : (
                <div className="flex shrink-0 items-center justify-center w-12 h-12 rounded-2xl bg-zinc-50 border border-zinc-100" />
              )}
              
              <div className="flex-1 text-center">
                <span className="text-[16px] font-bold tracking-tight text-zinc-800 transition-colors duration-300">
                  {link.title}
                </span>
              </div>
            </div>

          </CardContent>
        </Card>
      </a>

      {/* 우측 관리용 버튼 영역 (a 태그 외부에 두어 링크 이동을 방지) */}
      <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-1.5 z-10">
        <Button
          variant="ghost"
          size="icon"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setIsEditing(true);
          }}
          className="w-9 h-9 rounded-xl hover:bg-zinc-100 text-zinc-500 hover:text-zinc-900 transition-colors cursor-pointer"
          title="수정"
        >
          <IconPencil className="w-4.5 h-4.5" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onDeleteClick(link);
          }}
          className="w-9 h-9 rounded-xl hover:bg-red-50 text-zinc-500 hover:text-red-600 transition-colors cursor-pointer"
          title="삭제"
        >
          <IconTrash className="w-4.5 h-4.5" />
        </Button>
      </div>
    </div>
  );
}
