import { v4, validate } from "uuid";
import { getApiKey } from "@/lib/api-key";
import { Thread } from "@langchain/langgraph-sdk";
import { useQueryState } from "nuqs";
import { useLocalStorage } from 'usehooks-ts'
import {
  createContext,
  useContext,
  ReactNode,
  useCallback,
  useState,
  Dispatch,
  SetStateAction,
  useEffect,
} from "react";
import { createClient } from "./client";

interface ThreadContextType {
  getThreads: () => Promise<Thread[]>;
  threads: Thread[];
  setThreads: Dispatch<SetStateAction<Thread[]>>;
  threadsLoading: boolean;
  setThreadsLoading: Dispatch<SetStateAction<boolean>>;
  userId: string;
}

const ThreadContext = createContext<ThreadContextType | undefined>(undefined);

export function getThreadSearchMetadata(
  assistantId: string,
): { graph_id: string } | { assistant_id: string } {
  if (validate(assistantId)) {
    return { assistant_id: assistantId };
  } else {
    return { graph_id: assistantId };
  }
}

export function ThreadProvider({ children }: { children: ReactNode }) {
  const [apiUrl] = useQueryState("apiUrl") || [process.env.NEXT_PUBLIC_API_URL];
  const [assistantId] = useQueryState("assistantId") || [process.env.NEXT_PUBLIC_ASSISTANT_ID];
  const [threads, setThreads] = useState<Thread[]>([]);
  const [threadsLoading, setThreadsLoading] = useState(false);
  const [userId, setUserId, _removeUserId] = useLocalStorage("userId", "");
  
  const getThreads = useCallback(async (): Promise<Thread[]> => {
    const envApiUrl = apiUrl || process.env.NEXT_PUBLIC_API_URL;
    const envAssistantId = assistantId || process.env.NEXT_PUBLIC_ASSISTANT_ID;

    if (!envApiUrl || !envAssistantId) return [];
    const client = createClient(envApiUrl, getApiKey() ?? undefined);

    const threads = await client.threads.search({
      metadata: {
        ...getThreadSearchMetadata(envAssistantId),
        user_id: userId,
      },
      limit: 100,
    });

    return threads;
  }, [apiUrl, assistantId, userId]);

  useEffect(() => {
    if (!userId) {
      const newUserId = v4();
      setUserId(newUserId);
    }
  }, [userId, setUserId]);

  const value = {
    getThreads,
    threads,
    setThreads,
    threadsLoading,
    setThreadsLoading,
    userId,
  };

  return (
    <ThreadContext.Provider value={value}>{children}</ThreadContext.Provider>
  );
}

export function useThreads() {
  const context = useContext(ThreadContext);
  if (context === undefined) {
    throw new Error("useThreads must be used within a ThreadProvider");
  }
  return context;
}
