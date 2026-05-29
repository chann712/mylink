import { db } from "@/lib/firebase";
import { collection, query, where, getDocs, orderBy } from "firebase/firestore";
import { notFound } from "next/navigation";
import Link from "next/link";
import { IconArrowUpRight, IconLink } from "@tabler/icons-react";

export const dynamic = "force-dynamic";

interface ProfilePageProps {
  params: Promise<{
    username: string;
  }>;
}

export default async function ProfilePage({ params }: ProfilePageProps) {
  const { username } = await params;
  
  // URL에서 인코딩된 문자열 디코딩 및 소문자 정규화
  const decodedUsername = decodeURIComponent(username).toLowerCase();

  // 1. username이 일치하는 유저 문서 검색
  const usersRef = collection(db, "users");
  const userQuery = query(usersRef, where("profile.username", "==", decodedUsername));
  const userSnapshot = await getDocs(userQuery);

  if (userSnapshot.empty) {
    notFound();
  }

  const userDoc = userSnapshot.docs[0];
  const userId = userDoc.id;
  const userData = userDoc.data();
  const profile = userData.profile || { username: "", name: "", bio: "" };

  // 2. 해당 유저의 링크 목록 조회 (생성일 역순)
  const linksRef = collection(db, "users", userId, "links");
  const linksQuery = query(linksRef, orderBy("createdAt", "desc"));
  const linksSnapshot = await getDocs(linksQuery);

  const links = linksSnapshot.docs.map((doc) => {
    const data = doc.data();
    let faviconUrl = "";
    try {
      const urlObj = new URL(data.url || "");
      faviconUrl = `https://www.google.com/s2/favicons?domain=${urlObj.hostname}&sz=64`;
    } catch {
      // URL 형식 오류 시 처리하지 않음
    }

    return {
      id: doc.id,
      title: data.title || "",
      url: data.url || "",
      faviconUrl: faviconUrl,
    };
  });

  // 유저의 구글 프로필 사진 조회
  // 만약 Firestore에 photoURL을 따로 저장하지 않았다면, 기본 이니셜로 대체합니다.
  // 실제 photoURL은 Auth 객체에만 있으므로 Firestore에 profile 저장 시에는 photoURL이 들어가지 않았을 수 있습니다.
  // 마이페이지 코드상 Firestore에 setDoc 시 `profile` 맵 내에 photoURL을 명시적으로 넣진 않았습니다.
  // 하지만 구글 로그인 상태에서 가입할 때 photoURL을 넣도록 나중에 개선할 수도 있으므로,
  // 우선 userData에 photoURL이나 profile.photoURL이 있는지 체크하고 없으면 이니셜 아바타를 띄웁니다.
  const photoURL = userData.photoURL || profile.photoURL || "";

  return (
    <div className="min-h-svh bg-zinc-50/50 flex flex-col justify-between items-center px-4 py-16 relative overflow-hidden selection:bg-zinc-200">
      {/* Background ambient lighting */}
      <div className="fixed top-[-10vw] left-[-10vw] w-[45vw] h-[45vw] rounded-full bg-zinc-200/40 blur-[130px] pointer-events-none z-0" />
      <div className="fixed bottom-[-10vw] right-[-10vw] w-[45vw] h-[45vw] rounded-full bg-slate-200/40 blur-[130px] pointer-events-none z-0" />

      <main className="relative max-w-[480px] w-full z-10 flex flex-col items-center flex-1">
        {/* 1. 프로필 아바타 */}
        <div className="mb-6 select-none">
          {photoURL ? (
            <img
              src={photoURL}
              alt={`${profile.name} 프로필 이미지`}
              className="w-24 h-24 rounded-full object-cover border-4 border-white shadow-xl ring-4 ring-zinc-100/50"
              referrerPolicy="no-referrer"
            />
          ) : (
            <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 text-white font-black text-2xl flex items-center justify-center border-4 border-white shadow-xl ring-4 ring-zinc-100/50">
              {profile.name ? profile.name.charAt(0).toUpperCase() : decodedUsername.charAt(0).toUpperCase()}
            </div>
          )}
        </div>

        {/* 2. 유저 이름 */}
        <h1 className="text-2xl font-black text-zinc-900 tracking-tight mb-1">
          {profile.name || decodedUsername}
        </h1>

        {/* 3. 유저 고유 닉네임 (username) */}
        <p className="font-mono text-xs text-zinc-400 font-bold mb-5">
          @{profile.username || decodedUsername}
        </p>

        {/* 4. 자기소개 */}
        {profile.bio && (
          <div className="mb-10 max-w-[340px] text-center bg-white/60 border border-zinc-200/60 shadow-sm backdrop-blur-md px-5 py-2.5 rounded-2xl">
            <p className="font-semibold text-zinc-600 text-xs leading-relaxed break-all">
              {profile.bio}
            </p>
          </div>
        )}

        {/* 5. 등록된 링크 목록 */}
        <div className="w-full flex flex-col gap-3.5 mb-16">
          {links.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 px-4 rounded-3xl border border-dashed border-zinc-200 bg-white/40 backdrop-blur-sm text-center">
              <span className="text-4xl mb-3 select-none">📁</span>
              <p className="text-sm font-bold text-zinc-400">아직 등록된 링크가 없습니다.</p>
            </div>
          ) : (
            links.map((link) => (
              <a
                key={link.id}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full block group outline-none"
              >
                <div className="w-full bg-white border border-zinc-100 hover:border-zinc-200 shadow-sm hover:shadow-xl hover:shadow-zinc-200/40 transition-all duration-300 ease-out hover:-translate-y-1 group-focus-visible:ring-2 ring-zinc-950 ring-offset-2 ring-offset-zinc-50 rounded-2xl p-4 flex items-center justify-between min-h-[72px]">
                  <div className="flex items-center gap-4 flex-1 min-w-0 pr-4">
                    {link.faviconUrl ? (
                      <div className="flex shrink-0 items-center justify-center w-11 h-11 rounded-xl bg-zinc-50 border border-zinc-100 shadow-sm group-hover:scale-[1.03] transition-transform">
                        <img
                          src={link.faviconUrl}
                          alt=""
                          className="w-5 h-5 object-contain"
                          onError={(e) => {
                            // 이미지 로드 실패 시 디폴트 링크 아이콘으로 대체
                            (e.target as HTMLElement).style.display = "none";
                          }}
                        />
                      </div>
                    ) : (
                      <div className="flex shrink-0 items-center justify-center w-11 h-11 rounded-xl bg-zinc-50 border border-zinc-100 shadow-sm">
                        <IconLink className="w-4 h-4 text-zinc-400" />
                      </div>
                    )}
                    <span className="text-[15px] font-bold tracking-tight text-zinc-800 truncate">
                      {link.title}
                    </span>
                  </div>
                  <IconArrowUpRight className="w-4 h-4 text-zinc-300 group-hover:text-zinc-600 transition-colors shrink-0 stroke-[2.5]" />
                </div>
              </a>
            ))
          )}
        </div>
      </main>

      {/* 6. 하단 브랜딩 워터마크 */}
      <footer className="relative z-10 w-full flex justify-center mt-auto select-none">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full border border-zinc-200/80 bg-white/80 shadow-md text-xs font-black text-zinc-500 hover:text-zinc-900 transition-all active:scale-95 cursor-pointer backdrop-blur-sm"
        >
          <span className="text-[10px] tracking-wide text-zinc-400">Powered by</span>
          <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent font-black">
            MyLink
          </span>
        </Link>
      </footer>
    </div>
  );
}
