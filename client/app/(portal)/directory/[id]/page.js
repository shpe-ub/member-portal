"use client";

// /directory/<id> — one member's public profile, opened from a directory card.
import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import EndpointNotice from "@/components/EndpointNotice";
import MemberProfile from "@/components/MemberProfile";
import { getMember } from "@/lib/api";

export default function MemberPage() {
  const { id } = useParams();
  const [member, setMember] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    getMember(id).then(setMember).catch(setError); // #9
  }, [id]);

  return (
    <>
      <Link href="/directory" className="back-link">← Back to directory</Link>
      <EndpointNotice error={error} endpoint="#9 GET /api/members/<id>" />
      {member && <MemberProfile member={member} />}
    </>
  );
}
