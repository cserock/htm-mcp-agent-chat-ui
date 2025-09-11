"use client";

import { Thread } from "@/components/thread";
import { StreamProvider } from "@/providers/Stream";
import { ThreadProvider } from "@/providers/Thread";
import { Toaster } from "@/components/ui/sonner";
import AuthGuard from "@/components/AuthGuard";
import React from "react";

export default function DemoPage(): React.ReactNode {
  return (
    <AuthGuard>
      <div className="min-h-screen bg-gray-50">
        <React.Suspense fallback={<div>Loading (layout)...</div>}>
          <Toaster />
          <ThreadProvider>
            <StreamProvider>
              <Thread />
            </StreamProvider>
          </ThreadProvider>
        </React.Suspense>
      </div>
    </AuthGuard>
  );
}
