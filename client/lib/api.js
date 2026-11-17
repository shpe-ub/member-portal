// Every call the frontend makes to the Flask backend lives in this file.
// The numbers (#2, #5, ...) match the endpoint table in SPEC.md section 6.
import { supabase } from "./supabase";

export const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

export class ApiError extends Error {
  constructor(message, status) {
    super(message);
    this.status = status; // 0 means the server couldn't be reached at all
    // Flask answers "route not found" (404) when no route matches the URL, or 405
    // when the URL exists but not for this method. Either way, nobody has built
    // that endpoint yet. This is different from a 404 that a route returns itself.
    this.notBuilt = (status === 404 && message === "route not found") || status === 405;
  }
}

async function getAccessToken() {
  if (!supabase) return null;
  const { data } = await supabase.auth.getSession();
  return data.session?.access_token ?? null;
}

async function request(method, path, { body, auth = true } = {}) {
  const headers = {};
  if (body !== undefined) headers["Content-Type"] = "application/json";

  if (auth) {
    const token = await getAccessToken();
    if (token) headers["Authorization"] = `Bearer ${token}`;
  }

  let response;
  try {
    response = await fetch(API_URL + path, {
      method,
      headers,
      body: body === undefined ? undefined : JSON.stringify(body),
    });
  } catch {
    throw new ApiError(`Could not reach the backend at ${API_URL}. Is Flask running?`, 0);
  }

  if (response.status === 204) return null;

  const data = await response.json().catch(() => null);
  if (!response.ok) {
    throw new ApiError(data?.error || `Request failed (${response.status})`, response.status);
  }
  return data;
}

// #1
export const getHealth = () => request("GET", "/api/health", { auth: false });

// #2, #3 — no auth, so the register page can use them
export const getMajors = () => request("GET", "/api/majors", { auth: false });
export const getEthnicities = () => request("GET", "/api/ethnicities", { auth: false });

// #4 — create my profile right after sign-up
export const createMyProfile = (fields) => request("POST", "/api/members", { body: fields });

// #5, #6, #7 — my own profile
export const getMyProfile = () => request("GET", "/api/members/me");
export const updateMyProfile = (fields) => request("PATCH", "/api/members/me", { body: fields });
export const setMyEthnicities = (ethnicityIds) =>
  request("PUT", "/api/members/me/ethnicities", { body: { ethnicity_ids: ethnicityIds } });

// #8 — directory list. `filters` is an object like { q: "ana", major_id: 36, limit: 24 }
export function listMembers(filters = {}) {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(filters)) {
    if (value !== "" && value !== null && value !== undefined) params.set(key, value);
  }
  return request("GET", `/api/members?${params.toString()}`);
}

// #9, #10
export const getMember = (id) => request("GET", `/api/members/${encodeURIComponent(id)}`);
export const getDirectoryFilters = () => request("GET", "/api/directory/filters");

// #11 — admins only
export const setMemberRole = (id, role) =>
  request("PATCH", `/api/members/${encodeURIComponent(id)}/role`, { body: { role } });
