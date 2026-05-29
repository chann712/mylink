"use client";

import { useState } from "react";
import { IconLink } from "@tabler/icons-react";

interface FaviconProps {
  url: string;
  title: string;
}

export default function Favicon({ url, title }: FaviconProps) {
  const [isError, setIsError] = useState(false);

  // 도메인 추출을 안전하게 처리
  let faviconUrl = "";
  try {
    const urlObj = new URL(url || "");
    faviconUrl = `https://www.google.com/s2/favicons?domain=${urlObj.hostname}&sz=64`;
  } catch {
    // 잘못된 URL 형태인 경우 에러 처리
  }

  if (isError || !faviconUrl) {
    return (
      <div className="flex shrink-0 items-center justify-center w-11 h-11 rounded-xl bg-zinc-50 border border-zinc-100 shadow-sm">
        <IconLink className="w-4.5 h-4.5 text-zinc-400" />
      </div>
    );
  }

  return (
    <div className="flex shrink-0 items-center justify-center w-11 h-11 rounded-xl bg-zinc-50 border border-zinc-100 shadow-sm group-hover:scale-[1.03] transition-transform overflow-hidden">
      <img
        src={faviconUrl}
        alt={`${title} favicon`}
        className="w-5 h-5 object-contain"
        onError={() => setIsError(true)}
      />
    </div>
  );
}
