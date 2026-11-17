"use client";

// The editable profile fields from SPEC.md section 5, as form inputs.
// Used by the register page (required fields only) and the profile page (all fields).
import { EDUCATION_LEVELS } from "@/lib/constants";

export default function ProfileFields({ values, onChange, majors, requiredOnly = false }) {
  function update(field) {
    return (event) => onChange({ ...values, [field]: event.target.value });
  }

  return (
    <>
      <div className="field-row">
        <label className="field">
          First name *
          <input value={values.first_name} onChange={update("first_name")} required />
        </label>
        <label className="field">
          Last name *
          <input value={values.last_name} onChange={update("last_name")} required />
        </label>
      </div>

      {!requiredOnly && (
        <label className="field">
          Preferred name
          <input value={values.preferred_name} onChange={update("preferred_name")} />
        </label>
      )}

      <label className="field">
        Major *
        <select value={values.major_id} onChange={update("major_id")} required>
          <option value="">Select a major…</option>
          {majors.map((major) => (
            <option key={major.id} value={major.id}>{major.name}</option>
          ))}
        </select>
      </label>

      <div className="field-row">
        <label className="field">
          Education level
          <select value={values.education_level} onChange={update("education_level")}>
            {EDUCATION_LEVELS.map((level) => (
              <option key={level.value} value={level.value}>{level.label}</option>
            ))}
          </select>
        </label>
        <label className="field">
          Graduation year
          <input type="number" min="2000" max="2040" value={values.grad_year} onChange={update("grad_year")} />
        </label>
      </div>

      {!requiredOnly && (
        <>
          <label className="field">
            Bio <span className="hint">({values.bio.length}/300)</span>
            <textarea rows={3} maxLength={300} value={values.bio} onChange={update("bio")} />
          </label>
          <label className="field">
            LinkedIn URL
            <input type="url" placeholder="https://linkedin.com/in/…" value={values.linkedin_url} onChange={update("linkedin_url")} />
          </label>
          <div className="field-row">
            <label className="field">
              GitHub handle
              <input value={values.github_handle} onChange={update("github_handle")} />
            </label>
            <label className="field">
              Instagram handle
              <input value={values.instagram_handle} onChange={update("instagram_handle")} />
            </label>
            <label className="field">
              Twitter / X handle
              <input value={values.twitter_handle} onChange={update("twitter_handle")} />
            </label>
          </div>
        </>
      )}
    </>
  );
}

// Form inputs hold strings; the API wants numbers and nulls. These convert both ways.
export const EMPTY_PROFILE = {
  first_name: "",
  last_name: "",
  preferred_name: "",
  major_id: "",
  grad_year: "",
  education_level: "undergraduate",
  linkedin_url: "",
  github_handle: "",
  instagram_handle: "",
  twitter_handle: "",
  bio: "",
};

export function profileToForm(profile) {
  const form = { ...EMPTY_PROFILE };
  for (const field of Object.keys(EMPTY_PROFILE)) {
    if (profile[field] !== null && profile[field] !== undefined) form[field] = String(profile[field]);
  }
  if (profile.major) form.major_id = String(profile.major.id);
  return form;
}

export function formToApi(form) {
  const body = {};
  for (const [field, value] of Object.entries(form)) {
    const trimmed = value.trim();
    if (field === "major_id" || field === "grad_year") {
      body[field] = trimmed === "" ? null : Number(trimmed);
    } else {
      body[field] = trimmed === "" ? null : trimmed;
    }
  }
  return body;
}
