"use client";

import { useState, useEffect, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
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
  addDoc,
  getDocs,
  query,
  orderBy,
  serverTimestamp,
  doc,
  deleteDoc,
  getDoc,
  setDoc,
  where,
} from "firebase/firestore";
import { type Link } from "@/data/links";
import { linkSchema, type LinkFormValues } from "@/lib/schemas";
import LinkCard from "@/components/LinkCard";
import Header from "@/components/Header";
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
  IconLock,
  IconDeviceMobile,
  IconEdit,
  IconCheck,
  IconArrowRight,
  IconLoader2,
  IconBrandGoogle,
} from "@tabler/icons-react";

export default function MyPage() {
  const [links, setLinks] = useState<Link[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [deletingLink, setDeletingLink] = useState<Link | null>(null);

  // 로딩 및 제출 상태 관리
  const [isLoading, setIsLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Auth 및 Firestore 연동 상태
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);

  // 프로필 정보 상태
  const [profile, setProfile] = useState({
    username: "",
    name: "",
    bio: "",
  });

  // 프로필 편집 상태
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [editForm, setEditForm] = useState({
    username: "",
    name: "",
    bio: "",
  });

  // Username 실시간 중복 체크 상태
  const [isCheckingUsername, setIsCheckingUsername] = useState(false);
  const [usernameError, setUsernameError] = useState("");
  const [isUsernameAvailable, setIsUsernameAvailable] = useState<boolean | null>(null);

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
    } catch (err) {
      console.error("Logout failed:", err);
    }
  };

  // Auth 상태 및 데이터 구독
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setAuthLoading(true);
      if (currentUser) {
        setUser(currentUser);
        setIsLoading(true);
        try {
          // 1. users/{user.uid} 도큐먼트 확인 및 동기화
          const userDocRef = doc(db, "users", currentUser.uid);
          const userDocSnap = await getDoc(userDocRef);

          let currentProfile = {
            username: "",
            name: "",
            bio: "안녕하세요. 모든 작업물과 소셜 미디어를 한곳에서 확인하실 수 있습니다.",
          };

          const emailPrefix = currentUser.email?.split("@")[0] || "user";

          if (userDocSnap.exists()) {
            const userData = userDocSnap.data();
            
            // profile 맵이 존재하는지 확인
            if (userData.profile) {
              currentProfile = {
                username: userData.profile.username || emailPrefix,
                name: userData.profile.name || currentUser.displayName || emailPrefix,
                bio: userData.profile.bio !== undefined ? userData.profile.bio : "안녕하세요. 모든 작업물과 소셜 미디어를 한곳에서 확인하실 수 있습니다.",
              };
            } else {
              // 마이그레이션: 기존 루트 필드(displayName, bio)가 있는 경우 이를 profile로 이관
              const legacyName = userData.displayName || currentUser.displayName || emailPrefix;
              const legacyBio = userData.bio !== undefined ? userData.bio : currentProfile.bio;
              
              currentProfile = {
                username: emailPrefix, // 기본 username은 이메일 prefix
                name: legacyName,
                bio: legacyBio,
              };

              // Firestore에 마이그레이션된 profile 업데이트
              await setDoc(userDocRef, {
                profile: currentProfile,
                updatedAt: serverTimestamp(),
              }, { merge: true });
            }
          } else {
            // 최초 로그인 시 가입 처리
            currentProfile = {
              username: emailPrefix,
              name: currentUser.displayName || emailPrefix,
              bio: currentProfile.bio,
            };

            await setDoc(userDocRef, {
              email: currentUser.email,
              profile: currentProfile,
              createdAt: serverTimestamp(),
              updatedAt: serverTimestamp(),
            });
          }

          setProfile(currentProfile);

          // 2. 해당 사용자의 links 서브컬렉션 로드
          const linksRef = collection(db, "users", currentUser.uid, "links");
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
          console.error("Error loading user data or links:", err);
        } finally {
          setIsLoading(false);
          setAuthLoading(false);
        }
      } else {
        // 로그아웃 상태
        setUser(null);
        setLinks([]);
        setProfile({
          username: "",
          name: "",
          bio: "",
        });
        setIsLoading(false);
        setAuthLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  // Username 실시간 중복 체크
  useEffect(() => {
    if (!isEditingProfile || !editForm.username || !user) {
      setIsUsernameAvailable(null);
      setUsernameError("");
      return;
    }

    const trimmedUsername = editForm.username.trim().toLowerCase();
    
    // 1. 형식 유효성 먼저 확인
    if (trimmedUsername.length < 2) {
      setUsernameError("Username은 2자 이상 입력해주세요.");
      setIsUsernameAvailable(false);
      return;
    }
    if (trimmedUsername.length > 20) {
      setUsernameError("Username은 20자 이내로 입력해주세요.");
      setIsUsernameAvailable(false);
      return;
    }
    const usernameRegex = /^[a-z0-9_-]+$/;
    if (!usernameRegex.test(trimmedUsername)) {
      setUsernameError("Username은 영문 소문자, 숫자, 밑줄(_), 하이픈(-)만 사용 가능합니다.");
      setIsUsernameAvailable(false);
      return;
    }

    // 본인의 원래 username과 같다면 중복 체크 패스
    if (trimmedUsername === profile.username.toLowerCase()) {
      setUsernameError("");
      setIsUsernameAvailable(true);
      return;
    }

    // 2. 디바운스 적용하여 중복 검사 실행
    setIsCheckingUsername(true);
    setUsernameError("");
    setIsUsernameAvailable(null);

    const checkTimer = setTimeout(async () => {
      try {
        const usersRef = collection(db, "users");
        const q = query(usersRef, where("profile.username", "==", trimmedUsername));
        const querySnapshot = await getDocs(q);
        
        let isDuplicated = false;
        querySnapshot.forEach((doc) => {
          if (doc.id !== user.uid) {
            isDuplicated = true;
          }
        });

        if (isDuplicated) {
          setUsernameError("이미 사용 중인 Username입니다.");
          setIsUsernameAvailable(false);
        } else {
          setUsernameError("");
          setIsUsernameAvailable(true);
        }
      } catch (err) {
        console.error("Username check error:", err);
        setUsernameError("중복 확인 중 오류가 발생했습니다.");
        setIsUsernameAvailable(false);
      } finally {
        setIsCheckingUsername(false);
      }
    }, 400);

    return () => clearTimeout(checkTimer);
  }, [editForm.username, isEditingProfile, profile.username, user]);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<LinkFormValues>({
    resolver: zodResolver(linkSchema),
    mode: "onChange",
    defaultValues: {
      title: "",
      url: "",
    },
  });

  const handleOpenChange = (open: boolean) => {
    if (isSubmitting || isAdding) return; // 제출 중에는 다이얼로그 닫기 방지
    setIsDialogOpen(open);
    if (!open) {
      reset();
    }
  };

  // 신규 링크 추가
  const onSubmit = async (data: LinkFormValues) => {
    if (!user) return;
    try {
      setIsAdding(true);
      const urlObj = new URL(data.url);
      const domain = urlObj.hostname;
      const faviconUrl = `https://www.google.com/s2/favicons?domain=${domain}&sz=64`;

      // Firestore에 데이터 저장
      const linksRef = collection(db, "users", user.uid, "links");
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
    } finally {
      setIsAdding(false);
    }
  };

  // 링크 수정 시 로컬 상태 업데이트
  const handleUpdateLink = (updatedLink: Link) => {
    setLinks((prev) => prev.map((l) => (l.id === updatedLink.id ? updatedLink : l)));
  };

  // 링크 삭제 승인 처리
  const handleDeleteConfirm = async () => {
    if (!deletingLink || !user) return;
    try {
      setIsDeleting(true);
      const docRef = doc(db, "users", user.uid, "links", deletingLink.id);
      await deleteDoc(docRef);
      setLinks((prev) => prev.filter((l) => l.id !== deletingLink.id));
      setDeletingLink(null);
    } catch (err) {
      console.error("Failed to delete link:", err);
    } finally {
      setIsDeleting(false);
    }
  };

  // 프로필 저장 처리
  const handleProfileSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    const trimmedUsername = editForm.username.trim().toLowerCase();
    const trimmedName = editForm.name.trim();
    const trimmedBio = editForm.bio.trim();

    // 형식 유효성 재검증
    if (trimmedUsername.length < 2 || trimmedUsername.length > 20) {
      alert("Username은 2자 이상 20자 이하로 입력해주세요.");
      return;
    }
    const usernameRegex = /^[a-z0-9_-]+$/;
    if (!usernameRegex.test(trimmedUsername)) {
      alert("Username은 영문 소문자, 숫자, 밑줄(_), 하이픈(-)만 사용할 수 있습니다.");
      return;
    }
    if (!trimmedName) {
      alert("이름을 입력해주세요.");
      return;
    }
    if (trimmedBio.length > 80) {
      alert("소개글은 80자 이내로 입력해주세요.");
      return;
    }
    if (isUsernameAvailable === false) {
      alert("사용할 수 없는 Username입니다. 중복 여부를 확인해주세요.");
      return;
    }

    try {
      setIsLoading(true);
      const userDocRef = doc(db, "users", user.uid);
      const newProfile = {
        username: trimmedUsername,
        name: trimmedName,
        bio: trimmedBio,
      };

      await setDoc(userDocRef, {
        profile: newProfile,
        updatedAt: serverTimestamp(),
      }, { merge: true });

      setProfile(newProfile);
      setIsEditingProfile(false);
    } catch (err) {
      console.error("Failed to save profile:", err);
      alert("프로필 저장에 실패했습니다.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-svh bg-zinc-50/50 flex flex-col">
      <Header
        user={user}
        displayName={profile.name}
        onLogin={handleLogin}
        onLogout={handleLogout}
        isLoading={authLoading}
      />

      <main className="relative flex-1 text-zinc-950 font-sans px-4 py-8 selection:bg-zinc-200">
        {/* Background ambient lighting */}
        <div className="fixed top-[-10vw] left-[-10vw] w-[40vw] h-[40vw] rounded-full bg-zinc-200/50 blur-[120px] pointer-events-none z-0" />
        <div className="fixed bottom-[-10vw] right-[-10vw] w-[40vw] h-[40vw] rounded-full bg-slate-200/50 blur-[120px] pointer-events-none z-0" />

        {authLoading ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-zinc-50/50 backdrop-blur-sm z-50">
            <IconLoader2 className="w-10 h-10 animate-spin text-zinc-800" />
            <p className="text-sm font-bold text-zinc-500 mt-3">사용자 정보를 불러오는 중...</p>
          </div>
        ) : !user ? (
          /* 로그인 유도 화면 */
          <div className="relative max-w-md mx-auto z-10 w-full mt-16 text-center">
            <Card className="bg-white border-zinc-200/80 shadow-2xl rounded-3xl p-8 sm:p-12 overflow-hidden relative">
              <div className="absolute top-[-20%] left-[-20%] w-[60%] h-[60%] rounded-full bg-zinc-100/50 blur-[80px] pointer-events-none" />
              <div className="relative flex flex-col items-center">
                <div className="w-16 h-16 rounded-2xl bg-zinc-50 border border-zinc-100 flex items-center justify-center shadow-sm mb-6 text-zinc-900 font-black text-2xl">
                  ML
                </div>
                <h1 className="text-2xl sm:text-3xl font-black text-zinc-900 tracking-tight mb-4 leading-tight">
                  나만의 마이페이지를<br />시작해보세요
                </h1>
                <p className="text-sm font-semibold text-zinc-500 leading-relaxed mb-8 max-w-[280px]">
                  Google로 로그인하여 소셜 미디어, 포트폴리오, 외부 링크들을 한곳에 깔끔하게 모으고 실시간으로 관리하세요.
                </p>
                <Button
                  onClick={handleLogin}
                  className="w-full h-13 gap-3 rounded-2xl bg-zinc-950 hover:bg-zinc-800 text-white font-black transition-all shadow-xl shadow-zinc-950/10 active:scale-[0.98] cursor-pointer text-base"
                >
                  <IconBrandGoogle className="w-5 h-5" />
                  <span>Google로 로그인</span>
                </Button>
              </div>
            </Card>
          </div>
        ) : (
          /* 로그인 된 상태: 마이페이지 편집 패널 및 실시간 미리보기 */
          <div className="relative max-w-6xl mx-auto z-10 w-full mt-4">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              
              {/* LEFT: Editing Panel (7 columns) */}
              <section className="lg:col-span-7 flex flex-col gap-6">
                
                {/* Header & Title */}
                <div className="flex flex-col gap-1 pb-4 border-b border-zinc-200/60">
                  <div className="flex items-center gap-2.5">
                    <h1 className="text-3xl font-black tracking-tight text-zinc-900">마이페이지 관리</h1>
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-zinc-900 text-white text-[9px] font-black uppercase tracking-widest shadow-sm">
                      <IconLock className="w-3 h-3 text-emerald-400" />
                      Admin
                    </span>
                  </div>
                  <p className="text-sm font-semibold text-zinc-500">프로필 정보와 링크들을 실시간으로 편집 관리하세요.</p>
                </div>

                {/* Profile Info Setup Card */}
                <Card className="bg-white border-zinc-200/60 shadow-sm rounded-2xl overflow-hidden p-6">
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-sm font-black uppercase tracking-wider text-zinc-400">프로필 설정</h2>
                    {!isEditingProfile && (
                      <Button
                        onClick={() => {
                          setEditForm({
                            username: profile.username,
                            name: profile.name,
                            bio: profile.bio,
                          });
                          setIsEditingProfile(true);
                        }}
                        variant="outline"
                        size="sm"
                        className="h-8 rounded-lg font-bold text-xs gap-1 cursor-pointer"
                      >
                        <IconEdit className="w-3.5 h-3.5" />
                        수정
                      </Button>
                    )}
                  </div>
                  
                  {isEditingProfile ? (
                    <form onSubmit={handleProfileSave} className="flex flex-col gap-5">
                      {/* Username */}
                      <div className="flex flex-col gap-2">
                        <Label htmlFor="username" className="text-xs font-bold text-zinc-500">
                          Username (고유 URL 슬러그)
                        </Label>
                        <div className="relative">
                          <Input
                            id="username"
                            value={editForm.username}
                            onChange={(e) => setEditForm(prev => ({ ...prev, username: e.target.value }))}
                            placeholder="username"
                            className={`h-11 rounded-xl bg-zinc-50 border-zinc-200 font-bold focus-visible:ring-zinc-900 ${
                              usernameError ? "border-red-500 focus-visible:ring-red-500" : isUsernameAvailable ? "border-emerald-500 focus-visible:ring-emerald-500" : ""
                            }`}
                          />
                          {isCheckingUsername && (
                            <div className="absolute right-3 top-1/2 -translate-y-1/2">
                              <IconLoader2 className="w-4 h-4 animate-spin text-zinc-400" />
                            </div>
                          )}
                        </div>
                        {usernameError && (
                          <p className="text-xs font-semibold text-red-500 ml-1">{usernameError}</p>
                        )}
                        {isUsernameAvailable && !usernameError && (
                          <p className="text-xs font-semibold text-emerald-600 ml-1">사용 가능한 Username입니다.</p>
                        )}
                      </div>

                      {/* Name */}
                      <div className="flex flex-col gap-2">
                        <Label htmlFor="name" className="text-xs font-bold text-zinc-500">
                          이름
                        </Label>
                        <Input
                          id="name"
                          value={editForm.name}
                          onChange={(e) => setEditForm(prev => ({ ...prev, name: e.target.value }))}
                          placeholder="이름을 입력해주세요"
                          className="h-11 rounded-xl bg-zinc-50 border-zinc-200 font-bold focus-visible:ring-zinc-900"
                          required
                        />
                      </div>

                      {/* Bio */}
                      <div className="flex flex-col gap-2">
                        <div className="flex justify-between items-center">
                          <Label htmlFor="bio" className="text-xs font-bold text-zinc-500">
                            소개글
                          </Label>
                          <span className="text-[10px] font-bold text-zinc-400">
                            {editForm.bio.length}/80자
                          </span>
                        </div>
                        <textarea
                          id="bio"
                          value={editForm.bio}
                          onChange={(e) => {
                            if (e.target.value.length <= 80) {
                              setEditForm(prev => ({ ...prev, bio: e.target.value }));
                            }
                          }}
                          placeholder="소개글을 입력해주세요 (최대 80자)"
                          className="flex min-h-[80px] w-full rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-2 text-sm font-semibold text-zinc-700 placeholder:text-zinc-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-950 disabled:cursor-not-allowed disabled:opacity-50 resize-none"
                        />
                      </div>

                      {/* Action Buttons */}
                      <div className="flex justify-end gap-2 mt-2">
                        <Button
                          type="button"
                          variant="ghost"
                          onClick={() => {
                            setIsEditingProfile(false);
                            setUsernameError("");
                            setIsUsernameAvailable(null);
                          }}
                          className="h-10 px-4 text-zinc-500 font-bold rounded-lg hover:bg-zinc-100 cursor-pointer"
                        >
                          취소
                        </Button>
                        <Button
                          type="submit"
                          disabled={
                            isCheckingUsername ||
                            isUsernameAvailable === false ||
                            !editForm.username.trim() ||
                            !editForm.name.trim()
                          }
                          className="h-10 px-5 bg-zinc-900 text-white hover:bg-zinc-800 font-bold rounded-lg cursor-pointer"
                        >
                          저장
                        </Button>
                      </div>
                    </form>
                  ) : (
                    <div className="flex flex-col gap-5">
                      {/* Readonly Username */}
                      <div className="flex flex-col gap-1.5">
                        <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Username</span>
                        <div className="font-bold text-zinc-900 bg-zinc-50 border border-zinc-200/50 rounded-xl px-4 py-2.5">
                          @{profile.username || "설정되지 않음"}
                        </div>
                      </div>

                      {/* Readonly Name */}
                      <div className="flex flex-col gap-1.5">
                        <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider">이름</span>
                        <div className="font-bold text-zinc-900 bg-zinc-50 border border-zinc-200/50 rounded-xl px-4 py-2.5">
                          {profile.name || "설정되지 않음"}
                        </div>
                      </div>

                      {/* Readonly Bio */}
                      <div className="flex flex-col gap-1.5">
                        <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider">소개글</span>
                        <div className="font-semibold text-zinc-700 text-sm leading-relaxed bg-zinc-50 border border-zinc-200/50 rounded-xl px-4 py-3 whitespace-pre-wrap">
                          {profile.bio || "소개글이 없습니다."}
                        </div>
                      </div>
                    </div>
                  )}
                </Card>

                {/* Links Management Area */}
                <div className="flex flex-col gap-4">
                  <div className="flex justify-between items-center">
                    <h2 className="text-sm font-black uppercase tracking-wider text-zinc-400">링크 관리</h2>
                    
                    {/* Add Link Dialog */}
                    <Dialog open={isDialogOpen} onOpenChange={handleOpenChange}>
                      <DialogTrigger className="inline-flex items-center justify-center h-10 px-4 gap-2 font-black text-sm rounded-xl bg-primary text-primary-foreground hover:opacity-90 shadow-lg shadow-primary/10 transition-all active:scale-95 cursor-pointer border border-transparent">
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
                                disabled={isSubmitting || isAdding}
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
                                disabled={isSubmitting || isAdding}
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
                              disabled={isSubmitting || isAdding}
                              className="h-13 px-6 hover:bg-zinc-100 text-zinc-500 font-bold rounded-2xl flex-1"
                            >
                              취소
                            </Button>
                            <Button
                              type="submit"
                              disabled={isSubmitting || isAdding}
                              className="h-13 px-10 font-black rounded-2xl bg-primary hover:opacity-90 text-primary-foreground shadow-xl shadow-primary/20 transition-all active:scale-95 flex-1 flex items-center justify-center gap-2"
                            >
                              {isSubmitting || isAdding ? (
                                <>
                                  <IconLoader2 className="animate-spin w-5 h-5" />
                                  <span>추가 중...</span>
                                </>
                              ) : (
                                "추가"
                              )}
                            </Button>
                          </DialogFooter>
                        </form>
                      </DialogContent>
                    </Dialog>
                  </div>

                  {/* Editable Link List */}
                  <div className="flex flex-col gap-3">
                    {isLoading ? (
                      <div className="flex flex-col items-center justify-center py-16 px-4 rounded-2xl border border-dashed border-zinc-200 bg-white text-center">
                        <IconLoader2 className="w-8 h-8 animate-spin text-zinc-400 mb-2" />
                        <p className="text-sm font-bold text-zinc-400">링크를 불러오는 중입니다...</p>
                      </div>
                    ) : links.length === 0 ? (
                      <div className="flex flex-col items-center justify-center py-16 px-4 rounded-2xl border border-dashed border-zinc-200 bg-white text-center">
                        <span className="text-4xl mb-3">📁</span>
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
                  </div>
                </div>
              </section>

              {/* RIGHT: Live Preview Pane (5 columns) */}
              <section className="lg:col-span-5 flex flex-col items-center lg:sticky lg:top-20 py-6 lg:py-0">
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
                          {isEditingProfile ? editForm.name || "이름" : profile.name || "이름"}
                        </h3>
                      </div>
                      <p className="text-xs text-zinc-500 font-semibold leading-relaxed tracking-wide max-w-[220px] break-words">
                        {isEditingProfile ? editForm.bio : profile.bio}
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
        )}
      </main>

      {/* 삭제 확인 모달 */}
      <Dialog open={!!deletingLink} onOpenChange={(open) => { if (!open && !isDeleting) setDeletingLink(null); }}>
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
              disabled={isDeleting}
              className="h-13 px-6 hover:bg-zinc-100 text-zinc-500 font-bold rounded-2xl flex-1"
            >
              취소
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={handleDeleteConfirm}
              disabled={isDeleting}
              className="h-13 px-6 font-black rounded-2xl transition-all active:scale-95 flex-1 flex items-center justify-center gap-2"
            >
              {isDeleting ? (
                <>
                  <IconLoader2 className="animate-spin w-5 h-5" />
                  <span>삭제 중...</span>
                </>
              ) : (
                "삭제하기"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
