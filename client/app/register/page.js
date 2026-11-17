"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import AuthCard from "@/components/AuthCard";
import EndpointNotice from "@/components/EndpointNotice";
import ProfileFields, { EMPTY_PROFILE, formToApi } from "@/components/ProfileFields";
import { createMyProfile, getMajors } from "@/lib/api";
import { supabase } from "@/lib/supabase";

export default function RegisterPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [profile, setProfile] = useState(EMPTY_PROFILE);
  const [majors, setMajors] = useState([]);
  const [majorsError, setMajorsError] = useState(null);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // #2 GET /api/majors fills the Major dropdown.
  useEffect(() => {
    getMajors().then(setMajors).catch(setMajorsError);
  }, []);

  async function handleSubmit(event) {
    event.preventDefault();
    if (!supabase) return;
    setLoading(true);
    setError("");

    // Sign-up sequence, SPEC section 2:
    // 1. Create the auth user in Supabase.
    const { data, error: signUpError } = await supabase.auth.signUp({ email, password });
    if (signUpError) {
      setLoading(false);
      setError(signUpError.message);
      return;
    }

    // If Supabase requires email confirmation there's no session yet, so we can't
    // call our API. The member finishes their profile after their first login.
    if (!data.session) {
      setLoading(false);
      setMessage("Check your email to confirm your account, then log in to finish your profile.");
      return;
    }

    // 2. Create the member row through Flask (#4 POST /api/members).
    try {
      await createMyProfile(formToApi(profile));
      router.push("/home");
    } catch (apiError) {
      // The account exists; the profile page will let them retry.
      setError(`Account created, but saving your profile failed: ${apiError.message}`);
      setLoading(false);
    }
  }

  return (
    <AuthCard title="Join SHPE UB" subtitle="Create your member account.">
      {message ? (
        <p className="notice notice-ok">{message}</p>
      ) : (
        <form onSubmit={handleSubmit} className="form">
          <label className="field">
            Email
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </label>
          <label className="field">
            Password
            <input type="password" minLength={6} value={password} onChange={(e) => setPassword(e.target.value)} required />
          </label>

          <hr />
          <EndpointNotice error={majorsError} endpoint="#2 GET /api/majors" />
          <ProfileFields values={profile} onChange={setProfile} majors={majors} requiredOnly />

          {error && <p className="form-error">{error}</p>}
          <button className="button" disabled={loading || !supabase}>
            {loading ? "Creating account…" : "Create Account"}
          </button>
        </form>
      )}
      <p className="muted small">
        Already a member? <Link href="/login">Log in</Link>
      </p>
    </AuthCard>
  );
}
