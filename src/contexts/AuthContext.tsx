"use client";

import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signUp: (email: string, password: string, username: string, phone: string, classOf: string) => Promise<{ error: any }>;
  signIn: (email: string, password: string) => Promise<{ data: any; error: any }>;
  signOut: () => Promise<void>;
  checkUserApproval: (userId: string) => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 초기 세션 가져오기
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // 인증 상태 변화 감지
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signUp = async (email: string, password: string, username: string, phone: string, class_of: string) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          phone: phone,
          username: username,
          class_of: class_of
        }
      }
    });

    // supabase function으로 아래 코드 대체
    // if (data.user && !error) {
    //   // user_info 테이블에 사용자 정보 저장 (승인 대기 상태)
    //   const { error: insertError } = await supabase
    //     .from('user_info')
    //     .insert({
    //       id: data.user.id,
    //       email: email,
    //       username: username,
    //       phone: phone,
    //       class_of: class_of,
    //       is_approved: false // 기본적으로 승인 대기 상태
    //     });

    //   if (insertError) {
    //     console.error('Error inserting user info:', insertError);
    //     return { error: insertError };
    //   }
    // }

    return { error };
  };

  const signIn = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    return { data, error };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  const checkUserApproval = async (userId: string): Promise<boolean> => {
    try {
      if (userId === '') return false;
      const { data, error } = await supabase
        .from('user_info')
        .select('is_approved')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('Error checking user approval:', error);
        return false;
      }

      return data?.is_approved === true;
    } catch (error) {
      console.error('Error checking user approval:', error);
      return false;
    }
  };

  const value = {
    user,
    session,
    loading,
    signUp,
    signIn,
    signOut,
    checkUserApproval,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
