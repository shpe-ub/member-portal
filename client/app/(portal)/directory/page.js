"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import Avatar from "@/components/Avatar";
import EndpointNotice from "@/components/EndpointNotice";
import { getDirectoryFilters, getMajors, listMembers } from "@/lib/api";
import { EDUCATION_LEVELS, displayName, educationLabel } from "@/lib/constants";

const PAGE_SIZE = 24;

export default function DirectoryPage() {
  // Search and filter values, sent to #8 GET /api/members as query params.
  const [q, setQ] = useState("");
  const [filters, setFilters] = useState({ major_id: "", grad_year: "", education_level: "", ethnicity_id: "" });
  const [offset, setOffset] = useState(0);

  const [members, setMembers] = useState([]);
  const [total, setTotal] = useState(0);
  const [membersError, setMembersError] = useState(null);

  // Dropdown options.
  const [majors, setMajors] = useState([]);
  const [filterOptions, setFilterOptions] = useState({ grad_years: [], ethnicities: [] });
  const [optionsError, setOptionsError] = useState(null);

  useEffect(() => {
    getMajors().then(setMajors).catch(setOptionsError); // #2
    getDirectoryFilters().then(setFilterOptions).catch(setOptionsError); // #10
  }, []);

  // Re-fetch whenever the search or filters change. The short delay stops us
  // from sending a request on every single keystroke.
  useEffect(() => {
    const timer = setTimeout(() => {
      listMembers({ q, ...filters, limit: PAGE_SIZE, offset })
        .then((data) => {
          setMembers(data.members);
          setTotal(data.total);
          setMembersError(null);
        })
        .catch(setMembersError);
    }, 300);
    return () => clearTimeout(timer);
  }, [q, filters, offset]);

  function updateFilter(name) {
    return (event) => {
      setFilters({ ...filters, [name]: event.target.value });
      setOffset(0);
    };
  }

  return (
    <>
      <h1 className="page-title">Directory 📇</h1>

      <div className="toolbar">
        <input
          className="search"
          placeholder="Search by name…"
          value={q}
          onChange={(e) => {
            setQ(e.target.value);
            setOffset(0);
          }}
        />
        <select value={filters.major_id} onChange={updateFilter("major_id")}>
          <option value="">Major</option>
          {majors.map((m) => <option key={m.id} value={m.id}>{m.name}</option>)}
        </select>
        <select value={filters.grad_year} onChange={updateFilter("grad_year")}>
          <option value="">Graduation Year</option>
          {filterOptions.grad_years.map((y) => <option key={y} value={y}>{y}</option>)}
        </select>
        <select value={filters.education_level} onChange={updateFilter("education_level")}>
          <option value="">Education Level</option>
          {EDUCATION_LEVELS.map((l) => <option key={l.value} value={l.value}>{l.label}</option>)}
        </select>
        <select value={filters.ethnicity_id} onChange={updateFilter("ethnicity_id")}>
          <option value="">Ethnicity</option>
          {filterOptions.ethnicities.map((e) => <option key={e.id} value={e.id}>{e.name}</option>)}
        </select>
      </div>

      <EndpointNotice error={optionsError} endpoint="#2 GET /api/majors or #10 GET /api/directory/filters" />
      <EndpointNotice error={membersError} endpoint="#8 GET /api/members" />

      {!membersError && members.length === 0 && <p className="muted">No members match your search.</p>}

      <div className="member-grid">
        {members.map((member) => (
          <Link key={member.id} href={`/directory/${member.id}`} className="member-card">
            <Avatar member={member} size={64} />
            <div>
              <p className="member-name">{displayName(member)}</p>
              <p className="muted">
                {[member.major?.name, member.grad_year && `Class of ${member.grad_year}`, educationLabel(member.education_level)]
                  .filter(Boolean)
                  .join(" · ")}
              </p>
            </div>
          </Link>
        ))}
      </div>

      {total > PAGE_SIZE && (
        <div className="pager">
          <button className="button button-ghost" disabled={offset === 0} onClick={() => setOffset(offset - PAGE_SIZE)}>
            ← Previous
          </button>
          <span className="muted">
            {offset + 1}–{Math.min(offset + PAGE_SIZE, total)} of {total}
          </span>
          <button className="button button-ghost" disabled={offset + PAGE_SIZE >= total} onClick={() => setOffset(offset + PAGE_SIZE)}>
            Next →
          </button>
        </div>
      )}
    </>
  );
}
