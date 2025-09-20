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
  const [hasValidSession, setHasValidSession] = useState(true);
  const [agreeAll, setAgreeAll] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [agreePrivacy, setAgreePrivacy] = useState(false);
  const [agreeAge, setAgreeAge] = useState(false);
  const { signIn, signUp, signOut, user, checkUserApproval } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();

  function getKoreanErrorMessage(error: any) {
    if (!error) return "알 수 없는 오류가 발생했습니다.";

    console.log(error.status);
    console.log(error.message);

    switch (error.status) {
      case 400:
        // Bad Request
        if (error.message.includes("Password should be at least")) {
          return "비밀번호는 최소 8자리여야 합니다.";
        }

        if (error.message.includes("Invalid login credentials")) {
          return "로그인 정보가 올바르지 않습니다.";
        }

        if (error.message.includes("Email not confirmed")) {
          return "이메일 인증이 완료되지 않았습니다. 이메일을 확인해주세요.";
        }
        return "잘못된 요청입니다.";

      case 401:
        // Unauthorized
        if (error.message.includes("Invalid login credentials")) {
          return "로그인 정보가 올바르지 않습니다.";
        }
        return "권한이 없습니다. 로그인 후 다시 시도해주세요.";

      case 403:
        return "권한이 없습니다.";

      case 404:
        return "찾을 수 없는 리소스입니다.";

      case 409:
        // Conflict (예: 이미 등록된 이메일)
        if (error.message.includes("User already registered")) {
          return "이미 등록된 사용자입니다.";
        }
        return "중복된 요청입니다.";

      case 422:
        return "입력값을 확인해주세요.";

      case 500:
        return "서버 에러가 발생했습니다. 잠시 후 다시 시도해주세요.";

      default:
        return error.message || "알 수 없는 오류가 발생했습니다.";
    }
  }

  // 비밀번호 재설정 모드 확인 및 세션 상태 체크
  useEffect(() => {
    const reset = searchParams.get("reset");

    console.log(reset);
    if (reset === "true") {
      setIsResetMode(true);
      // 비밀번호 재설정 모드에서는 세션 상태를 확인
      checkSessionForReset();
    }
  }, [searchParams]);

  const checkSessionForReset = async () => {
    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (!session) {
      setHasValidSession(false);
      toast.error("세션이 만료되었습니다. 다시 로그인해주세요.");
    } else {
      setHasValidSession(true);
    }
  };

  useEffect(() => {
    if (!loading) {
      if (user && !isResetMode) {
        console.log("### 1 - User logged in, checking approval");
        const isApproved = async () => await checkUserApproval(user?.id || "");
        isApproved().then((isApproved) => {
          if (isApproved) {
            console.log("### User approved, staying on main page");
            // 이미 메인 페이지에 있으면 리다이렉트하지 않음
            if (window.location.pathname !== "/") {
              router.push("/");
            }
          } else {
            console.log("### User not approved, redirecting to auth");
            router.push("/auth");
          }
        });
      }
    }
  }, [user, loading, router, isResetMode, checkUserApproval]);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const { data, error } = await signIn(email, password);

    if (error) {
      toast.error("로그인 실패", {
        description: getKoreanErrorMessage(error),
        duration: 5000,
      });
    } else {
      const isApproved = await checkUserApproval(data.user.id);
      if (isApproved) {
        toast.success("로그인 성공", {
          description: "환영합니다!",
          duration: 3000,
        });
        router.push("/");
      } else {
        toast.error("계정 승인 필요", {
          description:
            "아직 승인되지 않은 계정입니다. 승인 후 사용하실 수 있습니다.",
          duration: 5000,
        });
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

    // 동의 체크 검증
    if (!agreeTerms || !agreePrivacy || !agreeAge) {
      toast.error("약관 동의 필요", {
        description: "모든 필수 약관에 동의해주세요.",
        duration: 4000,
      });
      setLoading(false);
      return;
    }

    const { error } = await signUp(email, password, username, phone, class_of);

    if (error) {
      toast.error("회원가입 실패", {
        description: getKoreanErrorMessage(error),
        duration: 5000,
      });
    } else {
      toast.success("회원가입 완료", {
        description: "이메일 인증 후 사용하실 수 있습니다.",
        duration: 4000,
      });

      // 폼 초기화
      setEmail("");
      setPassword("");
      setUsername("");
      setPhone("");
      setClassOf("");
      setAgreeAll(false);
      setAgreeTerms(false);
      setAgreePrivacy(false);
      setAgreeAge(false);

      // 로그인 탭으로 전환
      setActiveTab("signin");
    }

    setLoading(false);
  };

  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    if (newPassword !== confirmPassword) {
      toast.error("비밀번호 불일치", {
        description: "비밀번호가 일치하지 않습니다.",
        duration: 4000,
      });
      setLoading(false);
      return;
    }

    if (newPassword.length < 8) {
      toast.error("비밀번호 길이 부족", {
        description: "비밀번호는 최소 8자 이상이어야 합니다.",
        duration: 4000,
      });
      setLoading(false);
      return;
    }

    try {
      // 세션 상태를 다시 한번 확인
      const {
        data: { session },
        error: sessionError,
      } = await supabase.auth.getSession();

      if (sessionError || !session) {
        toast.error("세션 만료", {
          description: "세션이 만료되었습니다. 다시 시도해 주세요.",
          duration: 5000,
        });
        setIsResetMode(false);
        router.push("/auth");
        setLoading(false);
        return;
      }

      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (error) {
        toast.error("비밀번호 변경 실패", {
          description: getKoreanErrorMessage(error),
          duration: 5000,
        });
      } else {
        toast.success("비밀번호 변경 완료", {
          description: "비밀번호가 성공적으로 변경되었습니다.",
          duration: 4000,
        });
        setNewPassword("");
        setConfirmPassword("");
        setIsResetMode(false);
        await signOut();
        router.push("/auth");
      }
    } catch (error) {
      toast.error("시스템 오류", {
        description: "비밀번호 변경 중 오류가 발생했습니다.",
        duration: 5000,
      });
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
        toast.error("계정을 찾을 수 없음", {
          description: "입력하신 정보와 일치하는 계정을 찾을 수 없습니다.",
          duration: 4000,
        });
      } else {
        const email = data.email;
        const maskedEmail = email
          ? email.replace(/(.{2}).*(@.*)/, "$1***$2")
          : "";
        toast.success("이메일 찾기 완료", {
          description: `등록된 이메일: ${maskedEmail}`,
          duration: 5000,
        });
      }
    } catch (error) {
      toast.error("시스템 오류", {
        description: "이메일 찾기 중 오류가 발생했습니다.",
        duration: 5000,
      });
    }

    setLoading(false);
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8">
        <Toaster position="bottom-center" />
        <div className="text-center">
          <div className="flex items-center justify-center space-x-2">
            <img
              src={process.env.NEXT_PUBLIC_APP_LOGO}
              alt={process.env.NEXT_PUBLIC_APP_NAME}
              className="h-8 w-auto"
            />
            <h2 className="text-3xl text-gray-900">킹덤빌더스쿨 Q&A</h2>
          </div>
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
                      placeholder="가입시 입력한 휴대폰번호를 입력하세요 (예: 01012345678)"
                      pattern="[0-9]{11}"
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
                {!hasValidSession ? (
                  <div className="space-y-4 text-center">
                    <p className="text-red-600">
                      비밀번호 재설정 링크가 유효하지 않거나 만료되었습니다.
                    </p>
                    <Button
                      onClick={() => {
                        setIsResetMode(false);
                        setHasValidSession(true);
                        router.push("/auth");
                      }}
                      className="w-full"
                    >
                      로그인 페이지로 돌아가기
                    </Button>
                  </div>
                ) : (
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
                )}
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
                                  redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth?reset=true`,
                                })
                                .then(({ error }) => {
                                  if (error) {
                                    toast.error("이메일 전송 실패", {
                                      description: getKoreanErrorMessage(error),
                                      duration: 5000,
                                    });
                                  } else {
                                    toast.success("이메일 전송 완료", {
                                      description:
                                        "비밀번호 설정 링크를 메일로 전송했습니다.",
                                      duration: 4000,
                                    });
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
                          placeholder="숫자만 입력하세요 (예: 01012345678)"
                          pattern="[0-9]{11}"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="signup-class-of">수료 기수</Label>
                        <Input
                          id="signup-class-of"
                          type="tel"
                          value={class_of}
                          onChange={(e) => setClassOf(e.target.value)}
                          placeholder="최근 수료한 기수를 숫자로 입력하세요 (예: 32)"
                          pattern="[0-9]{1,2}"
                          required
                        />
                      </div>

                      {/* 약관 동의 섹션 */}
                      <div className="space-y-3 border-t pt-4">
                        <div className="space-y-2">
                          <label className="flex items-center space-x-2">
                            <input
                              type="checkbox"
                              checked={agreeAll}
                              onChange={(e) => {
                                const checked = e.target.checked;
                                setAgreeAll(checked);
                                setAgreeTerms(checked);
                                setAgreePrivacy(checked);
                                setAgreeAge(checked);
                              }}
                              className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                            />
                            <span className="text-sm font-medium text-gray-900">
                              전체 동의
                            </span>
                          </label>
                        </div>

                        <div className="ml-6 space-y-2">
                          <label className="flex items-center space-x-2">
                            <input
                              type="checkbox"
                              checked={agreeAge}
                              onChange={(e) => {
                                setAgreeAge(e.target.checked);
                                if (!e.target.checked) {
                                  setAgreeAll(false);
                                } else if (agreeTerms && agreePrivacy) {
                                  setAgreeAll(true);
                                }
                              }}
                              className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                            />
                            <span className="text-sm text-gray-700">
                              [필수]&nbsp;만 14세 이상입니다
                            </span>
                          </label>

                          <label className="flex items-center space-x-2">
                            <input
                              type="checkbox"
                              checked={agreeTerms}
                              onChange={(e) => {
                                setAgreeTerms(e.target.checked);
                                if (!e.target.checked) {
                                  setAgreeAll(false);
                                } else if (agreePrivacy && agreeAge) {
                                  setAgreeAll(true);
                                }
                              }}
                              className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                            />
                            <span className="text-sm text-gray-700">
                              [필수]&nbsp;
                              <a
                                href="https://www.heavenlytouch.kr/%EC%9D%B4%EC%9A%A9%EC%95%BD%EA%B4%80/"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-gray-600 underline hover:text-gray-800"
                              >
                                이용약관
                              </a>{" "}
                              동의
                            </span>
                          </label>

                          <label className="flex items-center space-x-2">
                            <input
                              type="checkbox"
                              checked={agreePrivacy}
                              onChange={(e) => {
                                setAgreePrivacy(e.target.checked);
                                if (!e.target.checked) {
                                  setAgreeAll(false);
                                } else if (agreeTerms && agreeAge) {
                                  setAgreeAll(true);
                                }
                              }}
                              className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                            />
                            <span className="text-sm text-gray-700">
                              [필수]&nbsp;
                              <a
                                href="https://www.heavenlytouch.kr/%EC%9D%B4%EC%9A%A9%EC%95%BD%EA%B4%80/"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-gray-600 underline hover:text-gray-800"
                              >
                                개인정보 수집 및 이용
                              </a>{" "}
                              동의
                            </span>
                          </label>
                        </div>
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
          © 2025{" "}
          <a
            href="https://hyperpipe.kr?utm_source=kbs&utm_medium=auth"
            target="_blank"
            rel="noopener noreferrer"
          >
            HyperPipe
          </a>
        </div>
      </div>
    </div>
  );
}

export default function AuthPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center">
          로딩 중...
        </div>
      }
    >
      <AuthPageContent />
    </Suspense>
  );
}
