'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { DEMO_ACCOUNTS, DemoAccount, normalizeEmail, isValidEmailFormat, isValidPersonName } from './demo-users';
import { isSupabaseConfigured } from '@/lib/supabase/client';
import { toast } from 'sonner';

interface AuthContextValue {
  currentUser: DemoAccount;
  availableAccounts: DemoAccount[];
  isSupabaseReady: boolean;
  switchEmailSession: (email: string) => void;
  loginWithCustomEmail: (email: string, fullName: string, bankInfo?: string) => boolean;
}

const STORAGE_KEY = 'plantogo_active_email_v1';
const CUSTOM_ACCOUNTS_KEY = 'plantogo_custom_accounts_v1';

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [accounts, setAccounts] = useState<DemoAccount[]>(DEMO_ACCOUNTS);
  const [currentUser, setCurrentUser] = useState<DemoAccount>(DEMO_ACCOUNTS[0]);

  useEffect(() => {
    try {
      const savedCustom = localStorage.getItem(CUSTOM_ACCOUNTS_KEY);
      let mergedAccounts = [...DEMO_ACCOUNTS];
      if (savedCustom) {
        const parsed = JSON.parse(savedCustom) as DemoAccount[];
        if (Array.isArray(parsed)) {
          parsed.forEach((customAcc) => {
            if (!mergedAccounts.some((a) => normalizeEmail(a.email) === normalizeEmail(customAcc.email))) {
              mergedAccounts.push(customAcc);
            }
          });
        }
      }
      setAccounts(mergedAccounts);

      const savedEmail = localStorage.getItem(STORAGE_KEY);
      if (savedEmail) {
        const found = mergedAccounts.find(
          (acc) => normalizeEmail(acc.email) === normalizeEmail(savedEmail)
        );
        if (found) {
          setCurrentUser(found);
        }
      }
    } catch {
      // Ignore storage access errors in SSR/restricted mode
    }
  }, []);

  const switchEmailSession = useCallback(
    (email: string) => {
      const clean = normalizeEmail(email);
      const target = accounts.find((acc) => normalizeEmail(acc.email) === clean);
      if (target) {
        setCurrentUser(target);
        try {
          localStorage.setItem(STORAGE_KEY, target.email);
        } catch {
          // ignore
        }
        toast.success(`Sesi aktif beralih ke ${target.full_name}`, {
          description: `Login email: ${target.email} — Hak akses otomatis menyesuaikan undangan trip.`,
        });
      }
    },
    [accounts]
  );

  const loginWithCustomEmail = useCallback(
    (rawEmail: string, rawFullName: string, bankInfo?: string): boolean => {
      const email = normalizeEmail(rawEmail);
      const fullName = rawFullName.trim();

      if (!isValidEmailFormat(email)) {
        toast.error('Format Email Tidak Valid', {
          description: 'Gunakan alamat email yang benar, contoh: nama@gmail.com',
        });
        return false;
      }

      if (!isValidPersonName(fullName)) {
        toast.error('Nama Hanya Boleh Huruf', {
          description: 'Nama lengkap hanya boleh berisi huruf dan spasi (2–50 karakter).',
        });
        return false;
      }

      const existing = accounts.find((a) => normalizeEmail(a.email) === email);
      if (existing) {
        const updated: DemoAccount = {
          ...existing,
          full_name: fullName || existing.full_name,
          bank_info: bankInfo?.trim() || existing.bank_info,
        };
        const nextList = accounts.map((a) => (normalizeEmail(a.email) === email ? updated : a));
        setAccounts(nextList);
        setCurrentUser(updated);
        try {
          localStorage.setItem(STORAGE_KEY, updated.email);
        } catch {
          // ignore
        }
        toast.success(`Selamat datang kembali, ${updated.full_name}!`, {
          description: `Terhubung dengan email ${updated.email}`,
        });
        return true;
      }

      const newAccount: DemoAccount = {
        id: `user-${Date.now()}`,
        email,
        full_name: fullName,
        bank_info: bankInfo?.trim() || undefined,
        defaultRoleHint: 'editor',
        badgeColor: '#4F46E5',
        shortBio: 'Akun Email Terdaftar',
        created_at: new Date().toISOString(),
      };

      const nextAccounts = [...accounts, newAccount];
      setAccounts(nextAccounts);
      setCurrentUser(newAccount);

      try {
        const customOnly = nextAccounts.filter(
          (a) => !DEMO_ACCOUNTS.some((d) => normalizeEmail(d.email) === normalizeEmail(a.email))
        );
        localStorage.setItem(CUSTOM_ACCOUNTS_KEY, JSON.stringify(customOnly));
        localStorage.setItem(STORAGE_KEY, newAccount.email);
      } catch {
        // ignore
      }

      toast.success(`Login Berhasil sebagai ${newAccount.full_name}`, {
        description: `Email ${newAccount.email} otomatis terhubung ke semua trip yang mengundang email ini.`,
      });
      return true;
    },
    [accounts]
  );

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        availableAccounts: accounts,
        isSupabaseReady: isSupabaseConfigured,
        switchEmailSession,
        loginWithCustomEmail,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return ctx;
}

