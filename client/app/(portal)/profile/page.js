"use client";

// /profile — view and edit your own profile.
// If you don't have a profile yet (#5 returns 404), this page becomes profile setup (#4).
import { useEffect, useState } from "react";
import EndpointNotice from "@/components/EndpointNotice";
import MemberProfile from "@/components/MemberProfile";
import ProfileFields, { EMPTY_PROFILE, formToApi, profileToForm } from "@/components/ProfileFields";
import {
  createMyProfile,
  getEthnicities,
  getMajors,
  getMyProfile,
  setMyEthnicities,
  updateMyProfile,
} from "@/lib/api";

export default function ProfilePage() {
  const [me, setMe] = useState(null);
  const [meError, setMeError] = useState(null);
  const [form, setForm] = useState(EMPTY_PROFILE);

  const [majors, setMajors] = useState([]);
  const [ethnicities, setEthnicities] = useState([]);
  const [selectedEthnicityIds, setSelectedEthnicityIds] = useState([]);
  const [lookupError, setLookupError] = useState(null);

  const [saveError, setSaveError] = useState(null);
  const [saveMessage, setSaveMessage] = useState("");

  function showProfile(profile) {
    setMe(profile);
    setMeError(null);
    setForm(profileToForm(profile));
    setSelectedEthnicityIds((profile.ethnicities ?? []).map((e) => e.id));
  }

  useEffect(() => {
    getMyProfile().then(showProfile).catch(setMeError); // #5
    getMajors().then(setMajors).catch(setLookupError); // #2
    getEthnicities().then(setEthnicities).catch(setLookupError); // #3
  }, []);

  const isSetup = meError?.status === 404 && !meError.notBuilt;

  async function handleSaveProfile(event) {
    event.preventDefault();
    setSaveError(null);
    setSaveMessage("");
    try {
      if (isSetup) {
        showProfile(await createMyProfile(formToApi(form))); // #4
        setSaveMessage("Profile created!");
      } else {
        // PATCH only the fields that actually changed (#6).
        const before = formToApi(profileToForm(me));
        const after = formToApi(form);
        const changed = {};
        for (const field of Object.keys(after)) {
          if (after[field] !== before[field]) changed[field] = after[field];
        }
        if (Object.keys(changed).length === 0) {
          setSaveMessage("Nothing to save.");
          return;
        }
        showProfile(await updateMyProfile(changed));
        setSaveMessage("Profile saved.");
      }
    } catch (error) {
      setSaveError(error);
    }
  }

  async function handleSaveEthnicities() {
    setSaveError(null);
    setSaveMessage("");
    try {
      const saved = await setMyEthnicities(selectedEthnicityIds); // #7
      setMe({ ...me, ethnicities: saved });
      setSaveMessage("Ethnicities saved.");
    } catch (error) {
      setSaveError(error);
    }
  }

  function toggleEthnicity(id) {
    setSelectedEthnicityIds(
      selectedEthnicityIds.includes(id)
        ? selectedEthnicityIds.filter((x) => x !== id)
        : [...selectedEthnicityIds, id]
    );
  }

  return (
    <>
      <h1 className="page-title">{isSetup ? "Set Up Your Profile" : "My Profile"}</h1>

      {!isSetup && <EndpointNotice error={meError} endpoint="#5 GET /api/members/me" />}
      <EndpointNotice error={lookupError} endpoint="#2 GET /api/majors or #3 GET /api/ethnicities" />

      <div className="profile-layout">
        <div>
          {me && <MemberProfile member={me} />}
          {me?.private && (
            <section className="card">
              <h2>Account</h2>
              <dl className="info-list">
                <dt>Email</dt>
                <dd>{me.private.email}</dd>
                <dt>Role</dt>
                <dd className="capitalize">{me.private.role}</dd>
              </dl>
            </section>
          )}
        </div>

        <div>
          <section className="card">
            <h2>{isSetup ? "Your details" : "Edit profile"}</h2>
            <form className="form" onSubmit={handleSaveProfile}>
              <ProfileFields values={form} onChange={setForm} majors={majors} />
              <button className="button">{isSetup ? "Create Profile" : "Save Changes"}</button>
            </form>
          </section>

          {!isSetup && (
            <section className="card">
              <h2>Ethnicities</h2>
              {ethnicities.length === 0 && <p className="muted">No options loaded.</p>}
              <div className="checkbox-list">
                {ethnicities.map((e) => (
                  <label key={e.id} className="checkbox">
                    <input
                      type="checkbox"
                      checked={selectedEthnicityIds.includes(e.id)}
                      onChange={() => toggleEthnicity(e.id)}
                    />
                    {e.name}
                  </label>
                ))}
              </div>
              <button className="button button-ghost" onClick={handleSaveEthnicities}>Save Ethnicities</button>
            </section>
          )}

          {saveMessage && <p className="notice notice-ok">{saveMessage}</p>}
          <EndpointNotice error={saveError} endpoint={isSetup ? "#4 POST /api/members" : "#6 / #7"} />
        </div>
      </div>
    </>
  );
}
