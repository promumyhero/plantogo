import type { Metadata } from 'next';
import { Plus_Jakarta_Sans, Instrument_Serif } from 'next/font/google';
import './globals.css';
import { AuthProvider } from '@/lib/auth/context';
import { TripStoreProvider } from '@/lib/store/trip-store';
import { Toaster } from 'sonner';

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  variable: '--font-sans',
  weight: ['400', '500', '600', '700'],
});

const instrumentSerif = Instrument_Serif({
  subsets: ['latin'],
  variable: '--font-serif',
  weight: '400',
  style: ['normal', 'italic'],
});

export const metadata: Metadata = {
  title: 'PlanToGo — Jawa Tengah Collaborative Itinerary & Split-Bill',
  description:
    'Rencanakan perjalanan spesifik ke Jawa Tengah bersama maksimal 4 kolaborator dengan sistem keamanan ketat, jadwal presisi, dan Split-Bill otomatis.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" className={`${plusJakarta.variable} ${instrumentSerif.variable}`}>
      <body className="min-h-screen bg-[#FAFAFA] text-slate-900 antialiased selection:bg-slate-900 selection:text-white">
        <AuthProvider>
          <TripStoreProvider>
            {children}
            <Toaster
              position="top-right"
              richColors
              closeButton
              toastOptions={{
                className: 'rounded-2xl font-sans text-sm shadow-xl',
              }}
            />
          </TripStoreProvider>
        </AuthProvider>
      </body>
    </html>
  );
}

