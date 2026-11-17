// The centered box used by /login and /register.
import Link from "next/link";
import { supabaseConfigured } from "@/lib/supabase";

export default function AuthCard({ title, subtitle, children }) {
  return (
    <main className="auth-page">
      <div className="auth-card">
        <Link href="/" className="brand">
          <span className="brand-mark">S</span>
          <span>SHPE UB</span>
        </Link>
        <h1>{title}</h1>
        <p className="muted">{subtitle}</p>
        {!supabaseConfigured && (
          <div className="notice notice-todo">
            <strong>Supabase isn&apos;t configured</strong>
            <span>Copy client/.env.example to client/.env.local and fill it in.</span>
          </div>
        )}
        {children}
      </div>
    </main>
  );
}
