import { Button } from "@/components/ui/button";
import { useThreads } from "@/providers/Thread";
import { Thread } from "@langchain/langgraph-sdk";
import { useEffect, useState, useRef } from "react";

import { getContentString } from "../utils";
import { useQueryState, parseAsBoolean } from "nuqs";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Skeleton } from "@/components/ui/skeleton";
import { PanelRightOpen, PanelRightClose } from "lucide-react";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import { useAuth } from "@/contexts/AuthContext";
import { Avatar } from "@/components/ui/avatar";
import { toast } from "sonner";
import { supabase, supabaseAdmin } from "@/lib/supabase";

// UserProfileDropdown 컴포넌트
function UserProfileDropdown({ user, className = "" }: { user: any; className?: string }) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { signOut } = useAuth();

  // 드롭다운 외부 클릭 시 닫기
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleLogout = async () => {
    try {
      await signOut();
      toast.success("로그아웃 완료", {
        description: "안전하게 로그아웃되었습니다.",
        duration: 3000,
      });
    } catch (error) {
      toast.error("로그아웃 실패", {
        description: "로그아웃 중 오류가 발생했습니다.",
        duration: 3000,
      });
    }
  };

  const handleLeave = async () => {
    // 회원 탈퇴 확인
    const confirmed = window.confirm(
      "회원 탈퇴를 하시겠습니까?\n탈퇴시 모든 데이터가 삭제되며 복구할 수 없습니다.\n탈퇴를 원하시면 '확인'을 눌러주세요."
    );

    if (!confirmed) {
      return;
    }

    try {
      const { error } = await supabaseAdmin.auth.admin.deleteUser(user?.id);
      if (error) {
        console.error("사용자 정보 삭제 오류:", error);
        // user_info 삭제 실패해도 계속 진행
      }
      
      // 3. 로그아웃 처리
      await signOut();

      // 4. 성공 알림
      toast.success("회원 탈퇴 완료", {
        description: "회원 탈퇴가 완료되었습니다.",
        duration: 5000,
      });

      // 5. 메인 페이지로 리다이렉트
      setTimeout(() => {
        window.location.href = "/auth";
      }, 2000);

    } catch (error: any) {
      console.error("회원 탈퇴 오류:", error);
      toast.error("회원 탈퇴 실패", {
        description: "회원 탈퇴 중 오류가 발생했습니다. 이용 문의를 통해 문의해주세요.",
        duration: 5000,
      });
      
      // 로그아웃은 시도
      // try {
      //   await signOut();
      // } catch (logoutError) {
      //   console.error("로그아웃 오류:", logoutError);
      // }
    }

    setIsOpen(false);
  };

  const handleSupport = () => {
    // 이메일 작성 기능 구현
    const supportEmail = "hyperpipe.kr@gmail.com";
    const subject = "킹덤빌더스쿨 Q&A 이용 문의";
    const body = `문의 내용:
- 

---
사용자 정보:
- 이메일: ${user?.email || "정보 없음"}
- 이름: ${user?.user_metadata?.username || "정보 없음"}`;

    // mailto 링크 생성
    const mailtoLink = `mailto:${supportEmail}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    
    // 이메일 클라이언트 열기
    window.open(mailtoLink, '_blank');
    
    setIsOpen(false);
  };

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      {/* 사용자 프로필 버튼 */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-100 transition-colors duration-200 w-full min-w-0"
      >
        <Avatar className="h-8 w-8">
          <div className="h-8 w-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold text-sm">
            {user?.user_metadata?.username?.charAt(0)?.toUpperCase() || 
             user?.email?.charAt(0)?.toUpperCase() || 
             "U"}
          </div>
        </Avatar>
        <div className="text-left flex-1 min-w-0">
          <div className="text-sm font-medium text-gray-900 truncate">
            {user?.user_metadata?.username || "사용자"}
          </div>
        </div>
        <svg
          className={`w-4 h-4 text-gray-400 transition-transform duration-200 flex-shrink-0 ${
            isOpen ? "rotate-180" : ""
          }`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M5 15l7-7 7 7"
          />
        </svg>
      </button>

      {/* 드롭다운 메뉴 */}
      {isOpen && (
        <div className="absolute right-0 bottom-full mb-2 w-64 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
          {/* 상단 사용자 정보 */}
          <div className="px-4 py-2 bg-gray-50 rounded-t-lg">
            <div className="flex items-center space-x-3">
              <div className="text-sm font-medium text-gray-700 truncate">
                {user?.email}
              </div>
            </div>
          </div>

          {/* 메뉴 아이템들 */}
          <div className="py-1">
            <button
              onClick={handleSupport}
              className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center justify-between"
            >
              <span>이용 문의</span>
            </button>
            
            <button
              onClick={handleLeave}
              className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center justify-between"
            >
              <span>회원 탈퇴</span>
              <span className="text-xs text-gray-400">⌘,</span>
            </button>
            
            <div className="border-t border-gray-100 my-1"></div>
            
            <button
              onClick={handleLogout}
              className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50"
            >
              로그아웃
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function ThreadList({
  threads,
  onThreadClick,
}: {
  threads: Thread[];
  onThreadClick?: (threadId: string) => void;
}) {
  const [threadId, setThreadId] = useQueryState("threadId");

  return (
    <div className="flex h-full w-full flex-col items-start justify-start gap-2 overflow-y-scroll [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-gray-300 [&::-webkit-scrollbar-track]:bg-transparent">
      {threads.map((t) => {
        let itemText = t.thread_id;
        if (
          typeof t.values === "object" &&
          t.values &&
          "messages" in t.values &&
          Array.isArray(t.values.messages) &&
          t.values.messages?.length > 0
        ) {
          const firstMessage = t.values.messages[0];
          itemText = getContentString(firstMessage.content);
        }
        return (
          <div
            key={t.thread_id}
            className="w-full px-1"
          >
            <Button
              variant="ghost"
              className="w-[280px] items-start justify-start text-left font-normal"
              onClick={(e) => {
                e.preventDefault();
                onThreadClick?.(t.thread_id);
                if (t.thread_id === threadId) return;
                setThreadId(t.thread_id);
              }}
            >
              <p className="truncate text-ellipsis">{itemText}</p>
            </Button>
          </div>
        );
      })}
    </div>
  );
}

function ThreadHistoryLoading() {
  return (
    <div className="flex h-full w-full flex-col items-start justify-start gap-2 overflow-y-scroll [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-gray-300 [&::-webkit-scrollbar-track]:bg-transparent">
      {Array.from({ length: 30 }).map((_, i) => (
        <Skeleton
          key={`skeleton-${i}`}
          className="h-10 w-[280px]"
        />
      ))}
    </div>
  );
}

export default function ThreadHistory() {
  const isLargeScreen = useMediaQuery("(min-width: 1024px)");
  const [chatHistoryOpen, setChatHistoryOpen] = useQueryState(
    "chatHistoryOpen",
    parseAsBoolean.withDefault(false),
  );

  const { getThreads, threads, setThreads, threadsLoading, setThreadsLoading } =
    useThreads();

  const { user } = useAuth();

  useEffect(() => {
    if (typeof window === "undefined") return;
    setThreadsLoading(true);
    getThreads()
      .then(setThreads)
      .catch(console.error)
      .finally(() => setThreadsLoading(false));
  }, []);

  return (
    <>
      <div className="shadow-inner-right hidden h-screen w-[300px] shrink-0 flex-col items-start justify-start gap-6 border-r-[1px] border-slate-300 lg:flex">
        <div className="flex w-full items-center justify-between px-4 pt-1.5">
          <Button
            className="hover:bg-gray-100"
            variant="ghost"
            onClick={() => setChatHistoryOpen((p) => !p)}
          >
            {chatHistoryOpen ? (
              <PanelRightOpen className="size-5" />
            ) : (
              <PanelRightClose className="size-5" />
            )}
          </Button>
          <h1 className="text-lg tracking-tight">대화 내역</h1>
        </div>
        {threadsLoading ? (
          <ThreadHistoryLoading />
        ) : (
          <ThreadList threads={threads} />
        )}
        <div className="mt-auto w-full px-4 pb-4">
          <div className="border-t pt-4 w-full">
            <UserProfileDropdown user={user} />
          </div>
          <div className="mt-2 text-center text-xs text-gray-400 w-full">
            © 2025 <a href="https://hyperpipe.kr?utm_source=kbs&utm_medium=history" target="_blank" rel="noopener noreferrer">HyperPipe</a>
          </div>
        </div>
      </div>
      <div className="lg:hidden">
        <Sheet
          open={!!chatHistoryOpen && !isLargeScreen}
          onOpenChange={(open) => {
            if (isLargeScreen) return;
            setChatHistoryOpen(open);
          }}
        >
          <SheetContent
            side="left"
            className="flex lg:hidden"
          >
            <SheetHeader>
              <SheetTitle>대화 내역</SheetTitle>
            </SheetHeader>
            <ThreadList
              threads={threads}
              onThreadClick={() => setChatHistoryOpen((o) => !o)}
            />
            <div className="mt-auto px-4 pb-4">
              <div className="border-t pt-4">
                <UserProfileDropdown user={user} />
              </div>
              <div className="mt-2 text-center text-xs text-gray-400">
                © 2025 <a href="https://hyperpipe.kr?utm_source=kbs&utm_medium=history" target="_blank" rel="noopener noreferrer">HyperPipe</a>
              </div>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </>
  );
}
