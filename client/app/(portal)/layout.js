"use client";

// Wraps every signed-in page (/home, /directory, /profile) with the sidebar.
// The (portal) folder name is in parentheses so it does NOT appear in the URL.
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Sidebar from "@/components/Sidebar";
import { supabase, supabaseConfigured } from "@/lib/supabase";

export default function PortalLayout({ children }) {
  const router = useRouter();
  const [checked, setChecked] = useState(!supabaseConfigured);

  // Send signed-out users to /login. Skipped in preview mode (no Supabase keys yet).
  useEffect(() => {
    if (!supabase) return;
    supabase.auth.getSession().then(({ data }) => {
      if (!data.session) router.replace("/login");
      else setChecked(true);
    });
  }, [router]);

  if (!checked) return null;

  return (
    <div className="portal">
      <Sidebar />
      <main className="portal-main">
        {!supabaseConfigured && (
          <div className="notice notice-todo">
            <strong>Preview mode</strong>
            <span>Supabase isn&apos;t configured, so you aren&apos;t signed in. Pages load but API calls that need a user will return 401.</span>
          </div>
        )}
        {children}
      </main>
    </div>
  );
}
