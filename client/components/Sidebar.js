"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

const LINKS = [
  { href: "/home", label: "Home", icon: "⌂" },
  { href: "/directory", label: "Directory", icon: "☷" },
  { href: "/profile", label: "Profile", icon: "◉" },
];

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();

  async function handleLogOut() {
    if (supabase) await supabase.auth.signOut();
    router.push("/login");
  }

  return (
    <aside className="sidebar">
      <Link href="/home" className="brand">
        <span className="brand-mark">S</span>
        <span>SHPE UB</span>
      </Link>

      <nav className="nav">
        {LINKS.map((link) => {
          const active = pathname === link.href || pathname.startsWith(link.href + "/");
          return (
            <Link key={link.href} href={link.href} className={active ? "nav-link active" : "nav-link"}>
              <span className="nav-icon" aria-hidden>{link.icon}</span>
              {link.label}
            </Link>
          );
        })}
      </nav>

      <button className="nav-link logout" onClick={handleLogOut}>
        <span className="nav-icon" aria-hidden>⇥</span>
        Log Out
      </button>
    </aside>
  );
}
