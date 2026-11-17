// Fixed enum values from SPEC.md section 4, with the labels members see.
export const EDUCATION_LEVELS = [
  { value: "undergraduate", label: "Undergraduate" },
  { value: "masters", label: "Master's" },
  { value: "phd", label: "PhD" },
  { value: "alumni", label: "Alumni" },
];

export function educationLabel(value) {
  return EDUCATION_LEVELS.find((level) => level.value === value)?.label ?? value;
}

export function displayName(member) {
  if (!member) return "";
  const first = member.preferred_name || member.first_name;
  return `${first} ${member.last_name}`;
}
