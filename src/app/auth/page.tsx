"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { Toaster } from "@/components/ui/sonner";
import { supabase } from "@/lib/supabase";

function AuthPageContent() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [phone, setPhone] = useState("");
  const [class_of, setClassOf] = useState("");
  //   const [groupName, setGroupName] = useState('');
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("signin");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isResetMode, setIsResetMode] = useState(false);
  const [isFindEmailMode, setIsFindEmailMode] = useState(false);
  const [findUsername, setFindUsername] = useState("");
  const [findPhone, setFindPhone] = useState("");
  const { signIn, signUp, signOut, user, checkUserApproval } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();

  // 비밀번호 재설정 모드 확인
  useEffect(() => {
    const reset = searchParams.get("reset");
    if (reset === "true") {
      setIsResetMode(true);
    }
  }, [searchParams]);

  // 로그인 되어있고 승인되어있으면 메인페이지로 이동
  // 그렇지 않으면 로그아웃 후 로그인 페이지로 이동
  useEffect(() => {
    if (!loading && user && !isResetMode) {
      const isApproved = async () => await checkUserApproval(user?.id || "");
      isApproved().then((isApproved) => {
        if (isApproved) {
          router.push("/");
        }
      });
    } else if (!loading && !user && !isResetMode) {
      (async () => {
        await signOut();
        router.push("/auth");
      })();
    }
  }, [user, loading, router, isResetMode]);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const { data, error } = await signIn(email, password);

    if (error) {
      toast.error("로그인을 실패했습니다. (" + error.message + ")");
    } else {
      const isApproved = await checkUserApproval(data.user.id);
      if (isApproved) {
        // toast.success('로그인 성공!');
        router.push("/");
      } else {
        toast.error(
          "아직 승인되지 않은 계정입니다. 승인 후 사용하실 수 있습니다.",
        );
        // 승인되지 않은 경우 로그아웃
        await signOut();
        router.push("/auth");
      }
    }

    setLoading(false);
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const { error } = await signUp(email, password, username, phone, class_of);

    if (error) {
      toast.error("회원가입이 실패했습니다. (" + error.message + ")");
    } else {
      toast.success(
        "가입이 완료되었습니다. 입력하신 정보에 대해 승인 후 사용하실 수 있습니다.",
      );

      // 폼 초기화
      setEmail("");
      setPassword("");
      setUsername("");
      setPhone("");
      setClassOf("");

      // 로그인 탭으로 전환
      setActiveTab("signin");
    }

    setLoading(false);
  };

  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    if (newPassword !== confirmPassword) {
      toast.error("비밀번호가 일치하지 않습니다.");
      setLoading(false);
      return;
    }

    if (newPassword.length < 6) {
      toast.error("비밀번호는 최소 6자 이상이어야 합니다.");
      setLoading(false);
      return;
    }

    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (error) {
        toast.error("비밀번호 변경에 실패했습니다: " + error.message);
      } else {
        toast.success("비밀번호가 성공적으로 변경되었습니다.");
        setNewPassword("");
        setConfirmPassword("");
        setIsResetMode(false);
        router.push("/auth");
      }
    } catch (error) {
      toast.error("비밀번호 변경 중 오류가 발생했습니다.");
    }

    setLoading(false);
  };

  const handleFindEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // user_info 테이블에서 이메일 정보 조회 (이메일을 직접 저장한다고 가정)
      const { data, error } = await supabase
        .from("user_info")
        .select("email")
        .eq("username", findUsername)
        .eq("phone", findPhone)
        .single();

      if (error || !data) {
        toast.error("입력하신 정보와 일치하는 계정을 찾을 수 없습니다.");
      } else {
        const email = data.email;
        const maskedEmail = email
          ? email.replace(/(.{2}).*(@.*)/, "$1***$2")
          : "";
        toast.success(`등록된 이메일: ${maskedEmail}`);
      }
    } catch (error) {
      toast.error("이메일 찾기 중 오류가 발생했습니다.");
    }

    setLoading(false);
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8">
        <Toaster position="bottom-center" />
        <div className="text-center">
          <h2 className="mt-6 text-3xl text-gray-900">
            킹덤빌더스쿨 Q&A
          </h2>
        </div>

        <Card>
          <CardContent>
            {isFindEmailMode ? (
              <div className="space-y-4">
                <div className="text-center">
                  <h3 className="text-lg font-semibold text-gray-900">
                    이메일 주소 찾기
                  </h3>
                </div>
                <form
                  onSubmit={handleFindEmail}
                  className="space-y-4"
                >
                  <div className="space-y-2">
                    <Label htmlFor="find-username">이름</Label>
                    <Input
                      id="find-username"
                      type="text"
                      value={findUsername}
                      onChange={(e) => setFindUsername(e.target.value)}
                      placeholder="가입시 입력한 이름을 입력하세요"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="find-phone">휴대폰 번호</Label>
                    <Input
                      id="find-phone"
                      type="tel"
                      value={findPhone}
                      onChange={(e) => setFindPhone(e.target.value)}
                      placeholder="가입시 입력한 휴대폰번호를 입력하세요 (예: 010-1234-5678)"
                      pattern="[0-9]{3}-[0-9]{4}-[0-9]{4}"
                      required
                    />
                  </div>
                  <Button
                    type="submit"
                    className="w-full"
                    disabled={loading}
                  >
                    {loading ? "찾는 중..." : "이메일 찾기"}
                  </Button>
                  <div className="text-center">
                    <button
                      type="button"
                      onClick={() => {
                        setIsFindEmailMode(false);
                        setFindUsername("");
                        setFindPhone("");
                      }}
                      className="text-sm text-gray-600 underline hover:text-gray-800"
                    >
                      로그인 페이지로 돌아가기
                    </button>
                  </div>
                </form>
              </div>
            ) : isResetMode ? (
              <div className="space-y-4">
                <div className="text-center">
                  <h3 className="text-lg font-semibold text-gray-900">
                    비밀번호 재설정
                  </h3>
                </div>
                <form
                  onSubmit={handlePasswordReset}
                  className="space-y-4"
                >
                  <div className="space-y-2">
                    <Label htmlFor="new-password">변경할 비밀번호</Label>
                    <Input
                      id="new-password"
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="영문,숫자,특수문자 포함 8자 이상"
                      pattern="[a-zA-Z0-9!@#$%^&*]{8,}"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="confirm-password">
                      변경할 비밀번호 확인
                    </Label>
                    <Input
                      id="confirm-password"
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="변경할 비밀번호를 다시 입력하세요"
                      pattern="[a-zA-Z0-9!@#$%^&*]{8,}"
                      required
                    />
                  </div>
                  <Button
                    type="submit"
                    className="w-full"
                    disabled={loading}
                  >
                    {loading ? "재설정 중..." : "비밀번호 재설정"}
                  </Button>
                  <div className="text-center">
                    <button
                      type="button"
                      onClick={() => {
                        setIsResetMode(false);
                        router.push("/auth");
                      }}
                      className="text-sm text-gray-600 underline hover:text-gray-800"
                    >
                      로그인 페이지로 돌아가기
                    </button>
                  </div>
                </form>
              </div>
            ) : (
              <Tabs
                value={activeTab}
                onValueChange={setActiveTab}
                className="w-full"
              >
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="signin">로그인</TabsTrigger>
                  <TabsTrigger value="signup">회원가입</TabsTrigger>
                </TabsList>

                <div className="mt-6">
                  <TabsContent value="signin">
                  <form
                    onSubmit={handleSignIn}
                    className="space-y-4"
                  >
                    <div className="space-y-2">
                      <Label htmlFor="signin-email">이메일 주소</Label>
                      <Input
                        id="signin-email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="이메일 주소를 입력하세요"
                        pattern="[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="signin-password">비밀번호</Label>
                      <Input
                        id="signin-password"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="비밀번호를 입력하세요"
                        required
                      />
                    </div>
                    <Button
                      type="submit"
                      className="w-full"
                      disabled={loading}
                    >
                      {loading ? "로그인 중..." : "로그인"}
                    </Button>
                    <div className="text-center">
                      <button
                        type="button"
                        onClick={() => {
                          const email = prompt(
                            "가입하신 이메일 주소를 입력해 주세요.\n새 비밀번호를 생성할 수 있는 링크를 보내드립니다.",
                          );
                          if (email) {
                            // Supabase 비밀번호 재설정 이메일 전송
                            supabase.auth
                              .resetPasswordForEmail(email, {
                                redirectTo: `${window.location.origin}/auth?reset=true`,
                              })
                              .then(({ error }) => {
                                if (error) {
                                  toast.error(
                                    "이메일 전송에 실패했습니다: " +
                                      error.message,
                                  );
                                } else {
                                  toast.success(
                                    "비밀번호 설정 링크를 메일로 전송했습니다.",
                                  );
                                }
                              });
                          }
                        }}
                        className="text-sm text-gray-400 underline hover:text-blue-800"
                      >
                        비밀번호를 잊으셨나요?
                      </button>
                      <div className="text-center">
                        <button
                          type="button"
                          onClick={() => setIsFindEmailMode(true)}
                          className="text-sm text-gray-400 underline hover:text-blue-800"
                        >
                          이메일 주소를 잊으셨나요?
                        </button>
                      </div>
                    </div>
                  </form>
                </TabsContent>

                <TabsContent value="signup">
                  <form
                    onSubmit={handleSignUp}
                    className="space-y-4"
                  >
                    <div className="space-y-2">
                      <Label htmlFor="signup-email">이메일 주소</Label>
                      <Input
                        id="signup-email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="이메일 주소를 입력하세요"
                        pattern="[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="signup-password">비밀번호</Label>
                      <Input
                        id="signup-password"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="영문,숫자,특수문자 포함 8자 이상"
                        pattern="[a-zA-Z0-9!@#$%^&*]{8,}"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="signup-username">이름</Label>
                      <Input
                        id="signup-username"
                        type="username"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        placeholder="이름을 입력하세요"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="signup-phone">휴대폰 번호</Label>
                      <Input
                        id="signup-phone"
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="휴대폰 번호를 입력하세요 (예: 010-1234-5678)"
                        pattern="[0-9]{3}-[0-9]{4}-[0-9]{4}"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="signup-class-of">수료 기수</Label>
                      <Input
                        id="signup-class-of"
                        type="text"
                        value={class_of}
                        onChange={(e) => setClassOf(e.target.value)}
                        placeholder="수료한 기수를 숫자만 입력하세요 (예: 32)"
                        pattern="[0-9]{1,2}"
                        required
                      />
                    </div>
                    {/* <div className="space-y-2">
                        <Label htmlFor="signup-group-name">조이름</Label>
                        <Input
                        id="signup-group-name"
                        type="text"
                        value={groupName}
                        onChange={(e) => setGroupName(e.target.value)}
                        placeholder="조이름을 입력하세요"
                        required
                        />
                    </div> */}
                    <Button
                      type="submit"
                      className="w-full"
                      disabled={loading}
                    >
                      {loading ? "회원가입 중..." : "회원가입"}
                    </Button>
                  </form>
                  </TabsContent>
                </div>
              </Tabs>
            )}
          </CardContent>
        </Card>
        <div className="mt-4 text-center text-sm text-gray-500">
          © 2025 HyperPipe
        </div>
      </div>
    </div>
  );
}

export default function AuthPage() {
  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center">로딩 중...</div>}>
      <AuthPageContent />
    </Suspense>
  );
}
