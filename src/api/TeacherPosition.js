const API_URL = import.meta.env.VITE_API_URL || "";
const BASE_URL = `${API_URL}/teacher-position`;

async function parseErrorMessage(res) {
  try {
    const body = await res.json();
    return body?.message || `Lỗi server: ${res.status}`;
  } catch {
    return `Lỗi server: ${res.status}`;
  }
}

export async function getTeacherPositions() {
  const res = await fetch(BASE_URL);
  if (!res.ok) {
    throw new Error(await parseErrorMessage(res));
  }
  return res.json();
}