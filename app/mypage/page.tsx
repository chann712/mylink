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
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
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
  const queryClient = useQueryClient();

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [deletingLink, setDeletingLink] = useState<Link | null>(null);

  // Auth 및 Firestore 연동 상태
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);

  // 프로필 인라인 편집 상태
  const [isEditingName, setIsEditingName] = useState(false);
  const [tempName, setTempName] = useState("");

  const [isEditingUsername, setIsEditingUsername] = useState(false);
  const [tempUsername, setTempUsername] = useState("");

  const [isEditingBio, setIsEditingBio] = useState(false);
  const [tempBio, setTempBio] = useState("");

  // Username 실시간 중복 체크 상태
  const [isCheckingUsername, setIsCheckingUsername] = useState(false);
  const [usernameError, setUsernameError] = useState("");
  const [isUsernameAvailable, setIsUsernameAvailable] = useState<boolean | null>(null);

  // Auth 상태 구독
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setAuthLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // 1. 프로필 정보 쿼리
  const { data: profile = { username: "", name: "", bio: "" }, isLoading: isProfileLoading } = useQuery({
    queryKey: ["profile", user?.uid],
    queryFn: async () => {
      if (!user) throw new Error("Not authenticated");
      const userDocRef = doc(db, "users", user.uid);
      const userDocSnap = await getDoc(userDocRef);
      const emailPrefix = user.email?.split("@")[0] || "user";

      let currentProfile = {
        username: "",
        name: "",
        bio: "안녕하세요. 모든 작업물과 소셜 미디어를 한곳에서 확인하실 수 있습니다.",
      };

      if (userDocSnap.exists()) {
        const userData = userDocSnap.data();
        
        // profile 맵이 존재하는지 확인
        if (userData.profile) {
          currentProfile = {
            username: userData.profile.username || emailPrefix,
            name: userData.profile.name || user.displayName || emailPrefix,
            bio: userData.profile.bio !== undefined ? userData.profile.bio : "안녕하세요. 모든 작업물과 소셜 미디어를 한곳에서 확인하실 수 있습니다.",
          };
        } else {
          // 마이그레이션: 기존 루트 필드(displayName, bio)가 있는 경우 이를 profile로 이관
          const legacyName = userData.displayName || user.displayName || emailPrefix;
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
          name: user.displayName || emailPrefix,
          bio: currentProfile.bio,
        };

        await setDoc(userDocRef, {
          email: user.email,
          profile: currentProfile,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
      }

      return currentProfile;
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
    } catch (err) {
      console.error("Logout failed:", err);
    }
  };


  // Username 실시간 중복 체크
  useEffect(() => {
    if (!isEditingUsername || !tempUsername || !user) {
      setIsUsernameAvailable(null);
      setUsernameError("");
      return;
    }

    const trimmedUsername = tempUsername.trim().toLowerCase();
    
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
  }, [tempUsername, isEditingUsername, profile.username, user]);

  // 1. 프로필 업데이트 Mutation (낙관적 업데이트 적용)
  const updateProfileMutation = useMutation({
    mutationFn: async (newProfile: { username: string; name: string; bio: string }) => {
      if (!user) throw new Error("Not authenticated");
      const userDocRef = doc(db, "users", user.uid);
      await setDoc(userDocRef, {
        profile: newProfile,
        updatedAt: serverTimestamp(),
      }, { merge: true });
    },
    onMutate: async (newProfile) => {
      await queryClient.cancelQueries({ queryKey: ["profile", user?.uid] });
      const previousProfile = queryClient.getQueryData(["profile", user?.uid]);
      queryClient.setQueryData(["profile", user?.uid], newProfile);
      return { previousProfile };
    },
    onError: (err, newProfile, context) => {
      if (context?.previousProfile) {
        queryClient.setQueryData(["profile", user?.uid], context.previousProfile);
      }
      alert("프로필 저장에 실패했습니다.");
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["profile", user?.uid] });
    },
  });

  // 2. 신규 링크 추가 Mutation
  const addLinkMutation = useMutation({
    mutationFn: async (newLinkData: { title: string; url: string }) => {
      if (!user) throw new Error("Not authenticated");
      const linksRef = collection(db, "users", user.uid, "links");
      return await addDoc(linksRef, {
        title: newLinkData.title.trim(),
        url: newLinkData.url,
        createdAt: serverTimestamp(),
        updateAt: serverTimestamp(),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["links", user?.uid] });
      handleOpenChange(false);
    },
    onError: (err) => {
      console.error("Link add error", err);
      alert("링크 추가에 실패했습니다.");
    },
  });

  // 3. 링크 삭제 Mutation
  const deleteLinkMutation = useMutation({
    mutationFn: async (linkId: string) => {
      if (!user) throw new Error("Not authenticated");
      const docRef = doc(db, "users", user.uid, "links", linkId);
      await deleteDoc(docRef);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["links", user?.uid] });
      setDeletingLink(null);
    },
    onError: (err) => {
      console.error("Failed to delete link:", err);
      alert("링크 삭제에 실패했습니다.");
    },
  });

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
    if (isSubmitting || addLinkMutation.isPending) return; // 제출 중에는 다이얼로그 닫기 방지
    setIsDialogOpen(open);
    if (!open) {
      reset();
    }
  };

  // 신규 링크 추가 제출
  const onSubmit = (data: LinkFormValues) => {
    addLinkMutation.mutate(data);
  };

  // 링크 삭제 승인 처리
  const handleDeleteConfirm = () => {
    if (!deletingLink) return;
    deleteLinkMutation.mutate(deletingLink.id);
  };

  // 이름 인라인 저장 처리
  const handleNameSave = async () => {
    const trimmed = tempName.trim();
    if (!trimmed) {
      alert("이름을 입력해주세요.");
      setTempName(profile.name);
      setIsEditingName(false);
      return;
    }
    if (trimmed.length > 50) {
      alert("이름은 50자 이내로 입력해주세요.");
      setTempName(profile.name);
      setIsEditingName(false);
      return;
    }
    if (trimmed === profile.name) {
      setIsEditingName(false);
      return;
    }

    try {
      await updateProfileMutation.mutateAsync({
        ...profile,
        name: trimmed,
      });
    } catch (err) {
      console.error(err);
      setTempName(profile.name);
    } finally {
      setIsEditingName(false);
    }
  };

  // Username 인라인 저장 처리
  const handleUsernameSave = async () => {
    const trimmed = tempUsername.trim().toLowerCase();
    
    if (trimmed.length < 2 || trimmed.length > 20) {
      alert("Username은 2자 이상 20자 이하로 입력해주세요.");
      setTempUsername(profile.username);
      setIsEditingUsername(false);
      return;
    }
    const usernameRegex = /^[a-z0-9_-]+$/;
    if (!usernameRegex.test(trimmed)) {
      alert("Username은 영문 소문자, 숫자, 밑줄(_), 하이픈(-)만 사용할 수 있습니다.");
      setTempUsername(profile.username);
      setIsEditingUsername(false);
      return;
    }
    if (isUsernameAvailable === false) {
      alert(usernameError || "사용할 수 없는 Username입니다.");
      setTempUsername(profile.username);
      setIsEditingUsername(false);
      return;
    }
    if (trimmed === profile.username.toLowerCase()) {
      setIsEditingUsername(false);
      return;
    }

    try {
      await updateProfileMutation.mutateAsync({
        ...profile,
        username: trimmed,
      });
    } catch (err) {
      console.error(err);
      setTempUsername(profile.username);
    } finally {
      setIsEditingUsername(false);
    }
  };

  // 소개글 인라인 저장 처리
  const handleBioSave = async () => {
    const trimmed = tempBio.trim();
    if (trimmed.length > 80) {
      alert("소개글은 80자 이내로 입력해주세요.");
      setTempBio(profile.bio);
      setIsEditingBio(false);
      return;
    }
    if (trimmed === profile.bio) {
      setIsEditingBio(false);
      return;
    }

    try {
      await updateProfileMutation.mutateAsync({
        ...profile,
        bio: trimmed,
      });
    } catch (err) {
      console.error(err);
      setTempBio(profile.bio);
    } finally {
      setIsEditingBio(false);
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
          /* 로그인 된 상태: 모바일 친화형 1컬럼 프로필 뷰어 */
          <div className="relative max-w-[480px] mx-auto z-10 w-full mt-4 flex flex-col items-center">
            
            {/* 1. 프로필 이미지 (Google Photo) */}
            <div className="mb-6 flex justify-center">
              {user.photoURL ? (
                <img
                  src={user.photoURL}
                  alt={`${profile.name} 프로필 이미지`}
                  className="w-24 h-24 rounded-full object-cover border-4 border-white shadow-lg ring-4 ring-zinc-100 select-none"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <div className="w-24 h-24 rounded-full bg-blue-600 text-white font-black text-2xl flex items-center justify-center border-4 border-white shadow-lg ring-4 ring-zinc-100 select-none">
                  {profile.name.charAt(0).toUpperCase()}
                </div>
              )}
            </div>

            {/* 2. 이름 인라인 편집 */}
            <div className="mb-2 w-full max-w-[340px] mx-auto flex justify-center h-10 items-center">
              {isEditingName ? (
                <Input
                  value={tempName}
                  onChange={(e) => setTempName(e.target.value)}
                  onBlur={handleNameSave}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleNameSave();
                    if (e.key === "Escape") {
                      setTempName(profile.name);
                      setIsEditingName(false);
                    }
                  }}
                  autoFocus
                  className="h-9 text-center font-extrabold text-xl bg-white border border-zinc-300 rounded-lg px-2 w-full focus-visible:ring-blue-600"
                />
              ) : (
                <h1
                  onClick={() => {
                    setTempName(profile.name);
                    setIsEditingName(true);
                  }}
                  className="group inline-flex items-center gap-1.5 font-black text-2xl text-zinc-900 tracking-tight cursor-pointer hover:underline decoration-zinc-400 select-none"
                  title="클릭하여 이름 수정"
                >
                  <span>{profile.name || "이름"}</span>
                  <IconEdit className="w-4 h-4 text-zinc-400 opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
                </h1>
              )}
            </div>

            {/* 3. Username 인라인 편집 */}
            <div className="mb-3 w-full max-w-[340px] mx-auto flex flex-col items-center min-h-[2.5rem] justify-center">
              {isEditingUsername ? (
                <div className="w-full relative flex flex-col items-center">
                  <div className="flex items-center bg-white border border-zinc-300 rounded-lg w-full px-2">
                    <span className="text-zinc-400 font-mono text-sm mr-0.5">@</span>
                    <input
                      value={tempUsername}
                      onChange={(e) => setTempUsername(e.target.value)}
                      onBlur={handleUsernameSave}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") handleUsernameSave();
                        if (e.key === "Escape") {
                          setTempUsername(profile.username);
                          setIsEditingUsername(false);
                          setUsernameError("");
                          setIsUsernameAvailable(null);
                        }
                      }}
                      autoFocus
                      className="h-9 font-mono text-sm text-zinc-700 w-full outline-none"
                    />
                    {isCheckingUsername && (
                      <IconLoader2 className="w-4 h-4 animate-spin text-zinc-400 shrink-0 ml-1" />
                    )}
                  </div>
                  {usernameError && (
                    <p className="text-[10px] font-semibold text-red-500 mt-1">{usernameError}</p>
                  )}
                  {isUsernameAvailable && !usernameError && (
                    <p className="text-[10px] font-semibold text-emerald-600 mt-1">사용 가능</p>
                  )}
                </div>
              ) : (
                <div
                  onClick={() => {
                    setTempUsername(profile.username);
                    setIsEditingUsername(true);
                  }}
                  className="group inline-flex items-center gap-1 font-mono text-sm text-zinc-500 cursor-pointer hover:text-zinc-800 select-none"
                  title="클릭하여 Username 수정"
                >
                  <span>@{profile.username || "username"}</span>
                  <IconEdit className="w-3.5 h-3.5 text-zinc-300 opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
                </div>
              )}
            </div>

            {/* 4. 자기소개 인라인 편집 */}
            <div className="mb-8 w-full max-w-[340px] mx-auto flex justify-center min-h-[2.5rem] items-center">
              {isEditingBio ? (
                <div className="w-full flex flex-col items-center gap-1.5">
                  <textarea
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
                        setTempBio(profile.bio);
                        setIsEditingBio(false);
                      }
                    }}
                    autoFocus
                    placeholder="소개글을 입력해주세요 (최대 80자)"
                    className="flex min-h-[60px] w-full rounded-xl border border-zinc-300 bg-white px-3 py-2 text-xs font-semibold text-zinc-700 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-blue-600 resize-none text-center"
                  />
                  <span className="text-[9px] font-bold text-zinc-400">
                    {tempBio.length}/80자
                  </span>
                </div>
              ) : (
                <div
                  onClick={() => {
                    setTempBio(profile.bio);
                    setIsEditingBio(true);
                  }}
                  className="group inline-flex items-center gap-1.5 bg-zinc-100/80 hover:bg-zinc-200/50 px-4 py-1.5 rounded-full cursor-pointer transition-colors max-w-full select-none"
                  title="클릭하여 자기소개 수정"
                >
                  <span className="font-semibold text-zinc-700 text-xs leading-relaxed break-all">
                    {profile.bio || "자기소개가 없습니다."}
                  </span>
                  <IconEdit className="w-3.5 h-3.5 text-zinc-400 opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
                </div>
              )}
            </div>

            {/* 5. 새로운 링크 추가하기 버튼 */}
            <div className="w-full mb-6">
              <Dialog open={isDialogOpen} onOpenChange={handleOpenChange}>
                <DialogTrigger className="w-full inline-flex items-center justify-center h-12 gap-2 font-black text-sm rounded-xl bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-500/10 transition-all active:scale-[0.98] cursor-pointer border border-transparent">
                  <IconPlus className="w-4 h-4" />
                  새로운 링크 추가하기
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
                          disabled={isSubmitting || addLinkMutation.isPending}
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
                          disabled={isSubmitting || addLinkMutation.isPending}
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
                        disabled={isSubmitting || addLinkMutation.isPending}
                        className="h-13 px-6 hover:bg-zinc-100 text-zinc-500 font-bold rounded-2xl flex-1"
                      >
                        취소
                      </Button>
                      <Button
                        type="submit"
                        disabled={isSubmitting || addLinkMutation.isPending}
                        className="h-13 px-10 font-black rounded-2xl bg-primary hover:opacity-90 text-primary-foreground shadow-xl shadow-primary/20 transition-all active:scale-95 flex-1 flex items-center justify-center gap-2"
                      >
                        {isSubmitting || addLinkMutation.isPending ? (
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

            {/* 6. 등록된 링크 목록 */}
            <div className="w-full flex flex-col gap-3">
              {isProfileLoading || isLinksLoading ? (
                <div className="flex flex-col items-center justify-center py-16 px-4 rounded-2xl border border-dashed border-zinc-200 bg-white text-center w-full">
                  <IconLoader2 className="w-8 h-8 animate-spin text-zinc-400 mb-2" />
                  <p className="text-sm font-bold text-zinc-400">링크를 불러오는 중입니다...</p>
                </div>
              ) : links.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 px-4 rounded-2xl border border-dashed border-zinc-200 bg-white text-center w-full">
                  <span className="text-4xl mb-3">📁</span>
                  <p className="text-sm font-bold text-zinc-400">아직 등록된 링크가 없습니다.</p>
                </div>
              ) : (
                links.map((link) => (
                  <LinkCard
                    key={link.id}
                    link={link}
                    onDeleteClick={setDeletingLink}
                  />
                ))
              )}
            </div>

          </div>
        )}
      </main>

      {/* 삭제 확인 모달 */}
      <Dialog open={!!deletingLink} onOpenChange={(open) => { if (!open && !deleteLinkMutation.isPending) setDeletingLink(null); }}>
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
              disabled={deleteLinkMutation.isPending}
              className="h-13 px-6 hover:bg-zinc-100 text-zinc-500 font-bold rounded-2xl flex-1"
            >
              취소
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={handleDeleteConfirm}
              disabled={deleteLinkMutation.isPending}
              className="h-13 px-6 font-black rounded-2xl transition-all active:scale-95 flex-1 flex items-center justify-center gap-2"
            >
              {deleteLinkMutation.isPending ? (
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
