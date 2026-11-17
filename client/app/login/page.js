"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import AuthCard from "@/components/AuthCard";
import { supabase } from "@/lib/supabase";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    if (!supabase) return;
    setLoading(true);
    setError("");

    // Auth goes straight to Supabase (SPEC section 2, auth flow step 1).
    const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });

    setLoading(false);
    if (signInError) {
      setError(signInError.message);
      return;
    }
    router.push("/home");
  }

  return (
    <AuthCard title="Welcome back" subtitle="Log in to the SHPE UB member portal.">
      <form onSubmit={handleSubmit} className="form">
        <label className="field">
          Email
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        </label>
        <label className="field">
          Password
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
        </label>
        {error && <p className="form-error">{error}</p>}
        <button className="button" disabled={loading || !supabase}>
          {loading ? "Logging in…" : "Log In"}
        </button>
      </form>
      <p className="muted small">
        New member? <Link href="/register">Create an account</Link>
      </p>
      {!supabase && (
        <p className="muted small">
          <Link href="/home">Preview the portal without logging in →</Link>
        </p>
      )}
    </AuthCard>
  );
}
