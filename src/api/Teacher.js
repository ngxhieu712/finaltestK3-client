const BASE_URL = "/teacher";

// Đọc message lỗi từ backend nếu có (vd: { message: "..." }), fallback về status code
async function parseErrorMessage(res) {
  try {
    const body = await res.json();
    return body?.message || `Lỗi server: ${res.status}`;
  } catch {
    return `Lỗi server: ${res.status}`;
  }
}

// GET /teachers — lấy danh sách giáo viên
export async function getTeachers() {
  const res = await fetch(BASE_URL);
  if (!res.ok) {
    throw new Error(await parseErrorMessage(res));
  }
  return res.json();
}

// POST /teacher — tạo giáo viên mới (kèm avatar, dùng multipart/form-data)
export async function createTeacher({
  formFields,
  degrees,
  teacherPositionId,
  avatarFile,
}) {
  const formData = new FormData();
  Object.entries(formFields).forEach(([key, value]) =>
    formData.append(key, value),
  );
  formData.append("education", JSON.stringify(degrees));
  if (teacherPositionId)
    formData.append("teacherPositionId", teacherPositionId);
  if (avatarFile) formData.append("avatar", avatarFile);

  const res = await fetch(BASE_URL, {
    method: "POST",
    body: formData,
  });

  if (!res.ok) {
    throw new Error(await parseErrorMessage(res));
  }

  return res.json();
}
