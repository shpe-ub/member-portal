// Shows the member's initials. Real photos are an open question in SPEC.md
// section 8 (avatar_url is a Supabase Storage path), so we skip them for now.
export default function Avatar({ member, size = 64 }) {
  const first = member?.preferred_name || member?.first_name || "?";
  const last = member?.last_name || "";
  const initials = (first[0] + (last[0] || "")).toUpperCase();

  return (
    <div className="avatar" style={{ width: size, height: size, fontSize: size * 0.36 }}>
      {initials}
    </div>
  );
}
