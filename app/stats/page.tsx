"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import NextLink from "next/link";
import { auth, db } from "@/lib/firebase";
import {
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
  onAuthStateChanged,
  type User,
} from "firebase/auth";
import {
  collection,
  getDocs,
  query,
  orderBy,
  doc,
  getDoc,
} from "firebase/firestore";
import { type Link as LinkData } from "@/data/links";
import { useQuery } from "@tanstack/react-query";
import Header from "@/components/Header";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts";
import {
  IconLoader2,
  IconArrowLeft,
  IconClick,
  IconLink,
  IconCrown,
  IconMathAvg,
  IconChartBar,
  IconInfoCircle,
} from "@tabler/icons-react";

export default function StatsPage() {
  const router = useRouter();

  // Auth 및 Firestore 연동 상태
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);

  // Auth 상태 구독
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setAuthLoading(false);
      
      // 비로그인 상태일 때 메인 페이지로 리다이렉트
      if (!currentUser && !authLoading) {
        router.push("/");
      }
    });
    return () => unsubscribe();
  }, [router, authLoading]);

  // 비로그인 시 강제 리다이렉션 (useEffect 백업)
  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/");
    }
  }, [user, authLoading, router]);

  // 1. 프로필 정보 쿼리 (헤더 전달용)
  const { data: profile = { username: "", name: "", bio: "" } } = useQuery({
    queryKey: ["profile", user?.uid],
    queryFn: async () => {
      if (!user) throw new Error("Not authenticated");
      const userDocRef = doc(db, "users", user.uid);
      const userDocSnap = await getDoc(userDocRef);
      const emailPrefix = user.email?.split("@")[0] || "user";

      if (userDocSnap.exists()) {
        const userData = userDocSnap.data();
        if (userData.profile) {
          return {
            username: userData.profile.username || emailPrefix,
            name: userData.profile.name || user.displayName || emailPrefix,
            bio: userData.profile.bio || "",
          };
        }
      }
      return {
        username: emailPrefix,
        name: user.displayName || emailPrefix,
        bio: "",
      };
    },
    enabled: !!user,
  });

  // 2. 링크 목록 쿼리
  const { data: links = [], isLoading: isLinksLoading } = useQuery({
    queryKey: ["links", user?.uid],
    queryFn: async () => {
      if (!user) return [];
      const linksRef = collection(db, "users", user.uid, "links");
      const q = query(linksRef, orderBy("createdAt", "desc"));
      const querySnapshot = await getDocs(q);
      const fetchedLinks: LinkData[] = [];

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
          clickCount: data.clickCount || 0,
        });
      });
      return fetchedLinks;
    },
    enabled: !!user,
  });

  // 구글 로그인 처리
  const handleLogin = async () => {
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
    } catch (err) {
      console.error("Login failed:", err);
    }
  };

  // 로그아웃 처리
  const handleLogout = async () => {
    try {
      await signOut(auth);
      router.push("/");
    } catch (err) {
      console.error("Logout failed:", err);
    }
  };

  // 통계 계산
  const totalClicks = links.reduce((sum, link) => sum + (link.clickCount || 0), 0);
  const linkCount = links.length;
  const averageClicks = linkCount > 0 ? (totalClicks / linkCount).toFixed(1) : "0.0";
  
  // 최고 인기 링크 추출
  const topLink = links.length > 0 
    ? [...links].sort((a, b) => (b.clickCount || 0) - (a.clickCount || 0))[0] 
    : null;

  // 차트 데이터 변환 (가독성을 위해 클릭 수 내림차순 정렬하여 보여줌)
  const chartData = [...links]
    .sort((a, b) => (b.clickCount || 0) - (a.clickCount || 0))
    .map((link) => ({
      name: link.title.length > 15 ? link.title.substring(0, 15) + "..." : link.title,
      clicks: link.clickCount || 0,
      fullTitle: link.title,
    }));

  // 차트 설정
  const chartConfig = {
    clicks: {
      label: "클릭 수",
      color: "hsl(var(--primary, 221.2 83.2% 53.3%))", // 기본 블루 계열 색상 매핑
    },
  } satisfies ChartConfig;

  // 로딩 상태 처리
  if (authLoading) {
    return (
      <div className="min-h-svh bg-zinc-50/50 flex flex-col items-center justify-center">
        <IconLoader2 className="w-10 h-10 animate-spin text-zinc-800" />
        <p className="text-sm font-bold text-zinc-500 mt-3">사용자 권한을 확인하고 있습니다...</p>
      </div>
    );
  }

  // 비로그인 상태일 때는 리다이렉트되므로 빈 화면 또는 로딩 표시
  if (!user) {
    return (
      <div className="min-h-svh bg-zinc-50/50 flex flex-col items-center justify-center">
        <IconLoader2 className="w-10 h-10 animate-spin text-zinc-800" />
        <p className="text-sm font-bold text-zinc-500 mt-3">로그인 페이지로 이동 중...</p>
      </div>
    );
  }

  return (
    <div className="min-h-svh bg-zinc-50/50 flex flex-col">
      <Header
        user={user}
        displayName={profile.name}
        username={profile.username}
        onLogin={handleLogin}
        onLogout={handleLogout}
        isLoading={authLoading}
      />

      <main className="relative flex-1 text-zinc-950 font-sans px-4 py-8 sm:px-6 max-w-5xl w-full mx-auto selection:bg-zinc-200">
        {/* Background ambient lighting */}
        <div className="fixed top-[-10vw] left-[-10vw] w-[40vw] h-[40vw] rounded-full bg-zinc-200/50 blur-[120px] pointer-events-none z-0" />
        <div className="fixed bottom-[-10vw] right-[-10vw] w-[40vw] h-[40vw] rounded-full bg-slate-200/50 blur-[120px] pointer-events-none z-0" />

        {/* Top Navigation Row */}
        <div className="relative z-10 flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <Button
              asChild
              variant="ghost"
              className="h-10 w-10 p-0 rounded-full border border-zinc-200/60 bg-white hover:bg-zinc-100 hover:border-zinc-300 shadow-sm transition-all"
            >
              <NextLink href="/mypage">
                <IconArrowLeft className="w-5 h-5 text-zinc-600" />
              </NextLink>
            </Button>
            <div>
              <h1 className="text-2xl font-black text-zinc-900 tracking-tight flex items-center gap-2">
                <IconChartBar className="w-6 h-6 text-blue-600" />
                링크 통계 대시보드
              </h1>
              <p className="text-xs font-semibold text-zinc-400 mt-0.5">
                내 프로필 링크의 실시간 누적 클릭 현황입니다.
              </p>
            </div>
          </div>
        </div>

        {isLinksLoading ? (
          <div className="relative z-10 flex flex-col items-center justify-center py-24 bg-white border border-zinc-200/80 rounded-3xl shadow-sm">
            <IconLoader2 className="w-8 h-8 animate-spin text-blue-600 mb-3" />
            <p className="text-sm font-bold text-zinc-400">통계 데이터를 로딩 중입니다...</p>
          </div>
        ) : (
          <div className="relative z-10 grid gap-6">
            
            {/* 1. 요약 카드 Grid */}
            <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
              
              {/* 총 클릭 수 */}
              <Card className="bg-white border-zinc-200/80 shadow-sm hover:shadow-md transition-shadow rounded-2xl overflow-hidden relative">
                <div className="absolute top-0 right-0 p-3 opacity-10">
                  <IconClick className="w-12 h-12 text-blue-600" />
                </div>
                <CardHeader className="p-4 pb-2">
                  <CardDescription className="text-xs font-black uppercase tracking-wider text-zinc-400">
                    총 클릭 수
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-4 pt-0">
                  <div className="text-3xl font-black text-zinc-900 tracking-tight">
                    {totalClicks.toLocaleString()}
                  </div>
                  <p className="text-[10px] font-bold text-zinc-400 mt-1">
                    모든 링크 클릭수의 총합
                  </p>
                </CardContent>
              </Card>

              {/* 등록된 링크 수 */}
              <Card className="bg-white border-zinc-200/80 shadow-sm hover:shadow-md transition-shadow rounded-2xl overflow-hidden relative">
                <div className="absolute top-0 right-0 p-3 opacity-10">
                  <IconLink className="w-12 h-12 text-emerald-600" />
                </div>
                <CardHeader className="p-4 pb-2">
                  <CardDescription className="text-xs font-black uppercase tracking-wider text-zinc-400">
                    등록된 링크 수
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-4 pt-0">
                  <div className="text-3xl font-black text-zinc-900 tracking-tight">
                    {linkCount}개
                  </div>
                  <p className="text-[10px] font-bold text-zinc-400 mt-1">
                    현재 생성된 전체 링크 개수
                  </p>
                </CardContent>
              </Card>

              {/* 평균 클릭 수 */}
              <Card className="bg-white border-zinc-200/80 shadow-sm hover:shadow-md transition-shadow rounded-2xl overflow-hidden relative">
                <div className="absolute top-0 right-0 p-3 opacity-10">
                  <IconMathAvg className="w-12 h-12 text-purple-600" />
                </div>
                <CardHeader className="p-4 pb-2">
                  <CardDescription className="text-xs font-black uppercase tracking-wider text-zinc-400">
                    평균 클릭 수
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-4 pt-0">
                  <div className="text-3xl font-black text-zinc-900 tracking-tight">
                    {averageClicks}회
                  </div>
                  <p className="text-[10px] font-bold text-zinc-400 mt-1">
                    링크 1개당 평균 클릭 발생률
                  </p>
                </CardContent>
              </Card>

              {/* 최고 인기 링크 */}
              <Card className="bg-white border-zinc-200/80 shadow-sm hover:shadow-md transition-shadow rounded-2xl overflow-hidden relative">
                <div className="absolute top-0 right-0 p-3 opacity-10">
                  <IconCrown className="w-12 h-12 text-amber-500" />
                </div>
                <CardHeader className="p-4 pb-2">
                  <CardDescription className="text-xs font-black uppercase tracking-wider text-zinc-400">
                    최고 인기 링크
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-4 pt-0">
                  <div className="text-lg font-black text-zinc-900 tracking-tight truncate leading-7">
                    {topLink && (topLink.clickCount ?? 0) > 0 ? topLink.title : "-"}
                  </div>
                  <p className="text-[10px] font-bold text-zinc-400 mt-1">
                    {topLink && (topLink.clickCount ?? 0) > 0 
                      ? `${(topLink.clickCount ?? 0).toLocaleString()}회 클릭됨` 
                      : "클릭 기록이 존재하지 않음"}
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* 2. 차트 영역 및 빈 상태 처리 */}
            {links.length === 0 ? (
              <Card className="bg-white border-zinc-200/80 shadow-sm rounded-3xl p-12 text-center">
                <CardContent className="flex flex-col items-center justify-center p-0">
                  <div className="w-16 h-16 bg-zinc-50 border border-zinc-100 rounded-2xl flex items-center justify-center shadow-inner text-zinc-300 text-3xl mb-4">
                    📊
                  </div>
                  <h3 className="text-lg font-extrabold text-zinc-800 mb-1">표시할 데이터가 없습니다.</h3>
                  <p className="text-sm font-semibold text-zinc-400 max-w-sm leading-relaxed mb-6">
                    아직 등록된 링크가 없습니다. 마이페이지 관리 화면에서 나만의 첫 링크를 추가하고 클릭을 유도해 보세요!
                  </p>
                  <Button asChild className="rounded-xl font-bold bg-blue-600 hover:bg-blue-700 text-white transition-all shadow-md active:scale-95 cursor-pointer">
                    <NextLink href="/mypage">링크 추가하러 가기</NextLink>
                  </Button>
                </CardContent>
              </Card>
            ) : totalClicks === 0 ? (
              <Card className="bg-white border-zinc-200/80 shadow-sm rounded-3xl p-12 text-center">
                <CardContent className="flex flex-col items-center justify-center p-0">
                  <div className="w-16 h-16 bg-blue-50 border border-blue-100 rounded-2xl flex items-center justify-center shadow-inner text-blue-400 text-3xl mb-4">
                    📈
                  </div>
                  <h3 className="text-lg font-extrabold text-zinc-800 mb-1">아직 클릭 기록이 존재하지 않습니다.</h3>
                  <p className="text-sm font-semibold text-zinc-400 max-w-sm leading-relaxed mb-6">
                    등록된 링크는 있으나 아직 방문자의 클릭이 발생하지 않았습니다. 프로필 주소를 널리 공유해 클릭을 모아보세요!
                  </p>
                  <Button asChild variant="outline" className="rounded-xl font-bold border-zinc-200 hover:bg-zinc-50 text-zinc-700 transition-all active:scale-95 cursor-pointer">
                    <NextLink href={profile.username ? `/${profile.username}` : "/mypage"}>내 프로필 구경하기</NextLink>
                  </Button>
                </CardContent>
              </Card>
            ) : (
              /* 차트 렌더링 */
              <Card className="bg-white border-zinc-200/80 shadow-sm rounded-3xl overflow-hidden">
                <CardHeader className="p-6 pb-4 border-b border-zinc-100 flex flex-row items-center justify-between">
                  <div>
                    <CardTitle className="text-lg font-black text-zinc-900 flex items-center gap-2">
                      링크별 클릭 분포도
                    </CardTitle>
                    <CardDescription className="text-xs font-semibold text-zinc-400 mt-1">
                      어떤 링크가 가장 방문자에게 관심을 많이 받았는지 한눈에 비교합니다.
                    </CardDescription>
                  </div>
                  <div className="flex items-center gap-1 bg-zinc-50 border border-zinc-100 px-3 py-1 rounded-full text-zinc-400 shrink-0 text-[10px] font-bold">
                    <IconInfoCircle className="w-3.5 h-3.5" />
                    <span>클릭수 기준 내림차순</span>
                  </div>
                </CardHeader>
                <CardContent className="p-6">
                  {/* shadcn Chart Container 도입 */}
                  <ChartContainer config={chartConfig} className="w-full min-h-[300px] h-[350px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={chartData}
                        margin={{ top: 20, right: 30, left: 10, bottom: 20 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border, 240 5.9% 90%))" />
                        <XAxis
                          dataKey="name"
                          tickLine={false}
                          axisLine={false}
                          tickMargin={8}
                          tick={{ fill: "hsl(var(--muted-foreground, 240 3.8% 46.1%))", fontWeight: 700 }}
                        />
                        <YAxis
                          tickLine={false}
                          axisLine={false}
                          tickMargin={8}
                          tick={{ fill: "hsl(var(--muted-foreground, 240 3.8% 46.1%))", fontWeight: 700 }}
                          allowDecimals={false}
                        />
                        <ChartTooltip
                          cursor={{ fill: "rgba(0, 0, 0, 0.02)" }}
                          content={<ChartTooltipContent hideLabel={false} nameKey="clicks" />}
                        />
                        <Bar
                          dataKey="clicks"
                          fill="var(--color-clicks)"
                          radius={[6, 6, 0, 0]}
                          maxBarSize={50}
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  </ChartContainer>
                </CardContent>
              </Card>
            )}

            {/* 3. 개별 링크 상세 통계 목록 (표 형식) */}
            {links.length > 0 && totalClicks > 0 && (
              <Card className="bg-white border-zinc-200/80 shadow-sm rounded-3xl overflow-hidden">
                <CardHeader className="p-6 pb-4 border-b border-zinc-100">
                  <CardTitle className="text-lg font-black text-zinc-900">
                    상세 리포트
                  </CardTitle>
                  <CardDescription className="text-xs font-semibold text-zinc-400 mt-1">
                    각 개별 링크의 상세 통계 수치를 표 형태로 확인합니다.
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-zinc-50/50 border-b border-zinc-100">
                          <th className="p-4 text-xs font-black text-zinc-400 tracking-wider">링크 타이틀</th>
                          <th className="p-4 text-xs font-black text-zinc-400 tracking-wider">대상 URL</th>
                          <th className="p-4 text-xs font-black text-zinc-400 tracking-wider text-right">클릭 수</th>
                          <th className="p-4 text-xs font-black text-zinc-400 tracking-wider text-right">클릭 비율</th>
                        </tr>
                      </thead>
                      <tbody>
                        {links
                          .sort((a, b) => (b.clickCount || 0) - (a.clickCount || 0))
                          .map((link) => {
                            const ratio = totalClicks > 0 
                              ? ((link.clickCount || 0) / totalClicks * 100).toFixed(1)
                              : "0.0";
                            return (
                              <tr key={link.id} className="border-b border-zinc-100 hover:bg-zinc-50/30 transition-colors">
                                <td className="p-4 text-sm font-extrabold text-zinc-800 flex items-center gap-2">
                                  {link.faviconUrl && (
                                    <img
                                      src={link.faviconUrl}
                                      alt="favicon"
                                      className="w-4 h-4 rounded-sm object-contain"
                                      onError={(e) => {
                                        e.currentTarget.style.display = "none";
                                      }}
                                    />
                                  )}
                                  <span>{link.title}</span>
                                </td>
                                <td className="p-4 text-xs font-bold text-zinc-400 font-mono truncate max-w-[200px]">
                                  <a href={link.url} target="_blank" rel="noopener noreferrer" className="hover:underline">
                                    {link.url}
                                  </a>
                                </td>
                                <td className="p-4 text-sm font-extrabold text-zinc-800 text-right font-mono">
                                  {(link.clickCount || 0).toLocaleString()}회
                                </td>
                                <td className="p-4 text-xs font-bold text-zinc-500 text-right font-mono">
                                  {ratio}%
                                </td>
                              </tr>
                            );
                          })}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            )}

          </div>
        )}
      </main>
    </div>
  );
}
