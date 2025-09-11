"use client";

import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

interface AuthGuardProps {
  children: React.ReactNode;
}

export default function AuthGuard({ children }: AuthGuardProps) {
  const { user, loading, signOut, checkUserApproval } = useAuth();
  const router = useRouter();

  // 로그인 되어있고 승인되어있으면 메인페이지로 이동
  // 그렇지 않으면 로그아웃 후 로그인 페이지로 이동
  useEffect(() => {
    if (!loading) {
      if (user) {
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
      } else {
        console.log("### 2 - No user, redirecting to auth");
        router.push("/auth");
      }
    }
  }, [user, loading, router, checkUserApproval]);

  // 로딩 중이거나 사용자가 없으면 로딩 화면 표시
  if (loading || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="h-16 w-16 animate-spin rounded-full border-b-2 border-gray-900"></div>
          <p className="mt-4 text-sm">Loading...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
