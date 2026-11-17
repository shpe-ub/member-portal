// A member's public profile card: the "member object" from SPEC section 5.
import Avatar from "@/components/Avatar";
import { displayName, educationLabel } from "@/lib/constants";

export default function MemberProfile({ member }) {
  const socials = [
    member.linkedin_url && { label: "LinkedIn", href: member.linkedin_url },
    member.github_handle && { label: "GitHub", href: `https://github.com/${member.github_handle}` },
    member.instagram_handle && { label: "Instagram", href: `https://instagram.com/${member.instagram_handle}` },
    member.twitter_handle && { label: "X / Twitter", href: `https://x.com/${member.twitter_handle}` },
  ].filter(Boolean);

  return (
    <section className="card profile-card">
      <div className="profile-header">
        <Avatar member={member} size={96} />
        <div>
          <h1>{displayName(member)}</h1>
          <p className="muted">
            {[member.major?.name, member.grad_year && `Class of ${member.grad_year}`, educationLabel(member.education_level)]
              .filter(Boolean)
              .join(" · ")}
          </p>
        </div>
      </div>

      {member.bio && <p>{member.bio}</p>}

      {member.ethnicities?.length > 0 && (
        <div className="chips">
          {member.ethnicities.map((e) => <span key={e.id} className="chip">{e.name}</span>)}
        </div>
      )}

      {socials.length > 0 && (
        <div className="socials">
          {socials.map((s) => (
            <a key={s.label} href={s.href} target="_blank" rel="noreferrer">{s.label}</a>
          ))}
        </div>
      )}
    </section>
  );
}
