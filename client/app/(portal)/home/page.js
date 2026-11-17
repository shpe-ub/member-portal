"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import EndpointNotice from "@/components/EndpointNotice";
import { getHealth, getMyProfile, listMembers } from "@/lib/api";
import { educationLabel } from "@/lib/constants";

const RESOURCES = [
  { title: "SHPE National", href: "https://shpe.org", text: "Scholarships, conventions and national programs." },
  { title: "UB Career Design Center", href: "https://www.buffalo.edu/career.html", text: "Résumé reviews, career fairs and job boards." },
  { title: "Code of Conduct", href: "#", text: "How we treat each other. Link coming soon." },
];

export default function HomePage() {
  const [me, setMe] = useState(null);
  const [meError, setMeError] = useState(null);
  const [total, setTotal] = useState(null);
  const [totalError, setTotalError] = useState(null);
  const [apiOnline, setApiOnline] = useState(null);

  useEffect(() => {
    getMyProfile().then(setMe).catch(setMeError); // #5
    listMembers({ limit: 1 }).then((data) => setTotal(data.total)).catch(setTotalError); // #8
    getHealth().then(() => setApiOnline(true)).catch(() => setApiOnline(false)); // #1
  }, []);

  const needsSetup = meError?.status === 404 && !meError.notBuilt;
  const name = me?.preferred_name || me?.first_name || "there";

  return (
    <>
      <h1 className="page-title">Hey, {name}! 👋</h1>

      {needsSetup && (
        <div className="notice notice-todo">
          <strong>Finish setting up your profile</strong>
          <Link href="/profile">Go to profile setup →</Link>
        </div>
      )}

      <div className="home-grid">
        <section className="card">
          <h2>My Info</h2>
          {me ? (
            <dl className="info-list">
              <dt>Major</dt>
              <dd>{me.major?.name ?? "—"}</dd>
              <dt>Graduation year</dt>
              <dd>{me.grad_year ?? "—"}</dd>
              <dt>Education level</dt>
              <dd>{educationLabel(me.education_level)}</dd>
              <dt>Role</dt>
              <dd className="capitalize">{me.private?.role ?? "—"}</dd>
            </dl>
          ) : (
            !needsSetup && <EndpointNotice error={meError} endpoint="#5 GET /api/members/me" />
          )}
        </section>

        <section className="card stat-card">
          <h2>Total Members</h2>
          {total !== null ? <p className="stat">{total.toLocaleString()}</p> : <p className="stat muted">—</p>}
          <EndpointNotice error={totalError} endpoint="#8 GET /api/members" />
        </section>

        <section className="card stat-card">
          <h2>Backend</h2>
          <p className={apiOnline ? "status status-ok" : "status status-bad"}>
            ● {apiOnline === null ? "Checking…" : apiOnline ? "Online" : "Offline"}
          </p>
          <p className="muted small">#1 GET /api/health</p>
        </section>

        <section className="card">
          <h2>Upcoming Events</h2>
          <p className="muted">Events and RSVPs are planned after v1 (SPEC section 8).</p>
        </section>

        <section className="card span-2">
          <h2>Important Resources</h2>
          <ul className="resource-list">
            {RESOURCES.map((resource) => (
              <li key={resource.title}>
                <a href={resource.href} target="_blank" rel="noreferrer">{resource.title}</a>
                <p className="muted">{resource.text}</p>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </>
  );
}
