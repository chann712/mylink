"use client";

import { db } from "@/lib/firebase";
import { doc, updateDoc, increment } from "firebase/firestore";
import { ReactNode } from "react";

interface TrackedLinkProps {
  userId: string;
  linkId: string;
  url: string;
  children: ReactNode;
}

export default function TrackedLink({ userId, linkId, url, children }: TrackedLinkProps) {
  const handleClick = async () => {
    try {
      const docRef = doc(db, "users", userId, "links", linkId);
      // clickCount 필드를 1 증가시킴 (보안 규칙에 의해 비로그인 상태에서도 이 필드만 수정 허용됨)
      await updateDoc(docRef, {
        clickCount: increment(1),
      });
    } catch (err) {
      console.error("클릭 카운트 증가 실패:", err);
    }
  };

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      onClick={handleClick}
      className="w-full block group outline-none"
    >
      {children}
    </a>
  );
}
