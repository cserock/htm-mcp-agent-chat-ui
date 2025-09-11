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
    if (!loading && user) {
      const isApproved = async () => await checkUserApproval(user?.id || "");
      isApproved().then((isApproved) => {
        if (isApproved) {
          router.push("/");
        }
      });
    } else {
      async () => await signOut();
      router.push("/auth");
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="h-16 w-16 animate-spin rounded-full border-b-2 border-gray-900"></div>
          <p className="mt-4 text-sm">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null; // 리다이렉트가 진행 중
  }

  return <>{children}</>;
}
