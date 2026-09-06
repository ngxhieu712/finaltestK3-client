import { useEffect, useState } from "react";

import { createTeacher } from "../../api/Teacher";
import { getTeacherPositions } from "../../api/TeacherPosition";

import FormField from "../FormField/FormField";
import SectionTitle from "../SectionTitle/SectionTitle";
import SidePanel from "../SidePanel/SidePanel";
import styles from "./TeacherForm.module.css";

const emptyEducation = {
  level: "Cử nhân",
  school: "",
  major: "",
  status: "Đã tốt nghiệp",
  gradMonth: "", // dùng để tính "year" khi gửi lên backend
};

// Chuyển state UI (level/status/gradMonth...) sang đúng shape "degree" mà backend cần
function mapEducationToDegrees(list) {
  return list.map((item) => ({
    type: item.level,
    school: item.school,
    major: item.major,
    year: item.gradMonth ? Number(item.gradMonth.split("-")[0]) : undefined,
    isGraduated: item.status === "Đã tốt nghiệp",
  }));
}

function TeacherForm({ onClose, onSave, onOpenPositions }) {
  const [education, setEducation] = useState([]);
  const [avatar, setAvatar] = useState("");
  const [avatarFile, setAvatarFile] = useState(null);
  const [selectedPosition, setSelectedPosition] = useState("");
  const [positions, setPositions] = useState([]); // danh sách thật từ server
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    let ignore = false;
    (async () => {
      try {
        const data = await getTeacherPositions();
        if (!ignore) setPositions(data);
      } catch (err) {
        console.error("Không tải được danh sách vị trí công tác:", err);
      }
    })();
    return () => {
      ignore = true;
    };
  }, []);

  function pickAvatar(event) {
    const file = event.target.files?.[0];
    if (file) {
      setAvatar(URL.createObjectURL(file));
      setAvatarFile(file);
    }
  }

  // Cập nhật 1 field của 1 dòng học vị theo index, không đụng các dòng khác
  function updateEducation(index, field, value) {
    setEducation((prev) =>
      prev.map((item, i) => (i === index ? { ...item, [field]: value } : item)),
    );
  }

  function handlePositionChange(event) {
    setSelectedPosition(event.target.value);
  }

  async function submit(event) {
    event.preventDefault();
    const data = Object.fromEntries(new FormData(event.currentTarget));

    setIsSaving(true);
    setError(null);
    try {
      const created = await createTeacher({
        formFields: data,
        degrees: mapEducationToDegrees(education),
        teacherPositionId: selectedPosition,
        avatarFile,
      });
      onSave(created);
    } catch (err) {
      console.error("Không thể lưu giáo viên:", err);
      setError(err.message || "Lưu thất bại, vui lòng thử lại.");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <SidePanel title="Tạo thông tin giáo viên" onClose={onClose} wide>
      <form onSubmit={submit}>
        <section className={styles.personal}>
          <label className={styles.avatarPicker}>
            {avatar ? (
              <img src={avatar} alt="Ảnh giáo viên đã chọn" />
            ) : (
              <div className={styles.avatarFallback}>GV</div>
            )}
            <span className={styles.uploadBox}>
              ⇧<small>Upload file</small>
              <strong>Chọn ảnh</strong>
            </span>
            <input type="file" accept="image/*" onChange={pickAvatar} />
          </label>
          <div className={styles.personalFields}>
            <SectionTitle>Thông tin cá nhân</SectionTitle>
            <div className={styles.formGrid}>
              <FormField
                required
                label="Họ và tên"
                name="name"
                placeholder="VD: Nguyễn Văn A"
              />
              <FormField
                required
                label="Ngày sinh"
                name="birthday"
                type="date"
              />
              <FormField
                required
                label="Số điện thoại"
                name="phone"
                placeholder="Nhập số điện thoại"
              />
              <FormField
                required
                label="Email"
                name="email"
                type="email"
                placeholder="example@school.edu.vn"
              />
              <FormField
                required
                label="Số CCCD"
                name="identity"
                placeholder="Nhập số CCCD"
              />
              <FormField
                required
                label="Địa chỉ"
                name="address"
                placeholder="Địa chỉ thường trú"
              />
            </div>
          </div>
        </section>

        <SectionTitle>Thông tin công tác</SectionTitle>
        <div className={styles.positionLabel}>
          {/* 1 giáo viên = 1 vị trí (teacherPositionId), nên dùng single-select.
              TODO: value của mỗi option nên là _id thật của TeacherPosition,
              lấy từ API khi có, thay vì text cứng như hiện tại. */}
          <div style={{ display: "flex", flexDirection: "row", gap: "200px" }}>
            <label
              htmlFor="teacherPositionId"
              style={{ display: "flex", flexDirection: "column", gap: "4px" }}
            >
              <span>Vị trí công tác</span>
            </label>
            <select
              style={{ width: "300px", height: "40px" }}
              id="teacherPositionId"
              value={selectedPosition}
              onChange={handlePositionChange}
            >
              <option value="" disabled>
                Chọn vị trí công tác
              </option>
              {positions.map((pos) => (
                <option key={pos._id} value={pos._id}>
                  {pos.name}
                </option>
              ))}
            </select>
          </div>
          <button type="button" onClick={onOpenPositions}>
            Quản lý vị trí
          </button>
        </div>

        <SectionTitle
          action={
            <button
              className={styles.smallButton}
              type="button"
              onClick={() => setEducation([...education, emptyEducation])}
            >
              + Thêm
            </button>
          }
        >
          Học vị
        </SectionTitle>
        <div className={styles.educationTable}>
          <div className={styles.educationHead}>
            <span>Bậc</span>
            <span>Trường</span>
            <span>Chuyên ngành</span>
            <span>Trạng thái</span>
            <span>Tốt nghiệp</span>
          </div>
          {education.length === 0 ? (
            <div className={styles.empty}>
              ▱<span>Chưa có học vị</span>
            </div>
          ) : (
            education.map((item, index) => (
              <div className={styles.educationRow} key={index}>
                <select
                  value={item.level}
                  onChange={(e) =>
                    updateEducation(index, "level", e.target.value)
                  }
                >
                  <option>Cử nhân</option>
                  <option>Thạc sĩ</option>
                  <option>Tiến sĩ</option>
                </select>
                <input
                  placeholder="Tên trường"
                  value={item.school}
                  onChange={(e) =>
                    updateEducation(index, "school", e.target.value)
                  }
                />
                <input
                  placeholder="Chuyên ngành"
                  value={item.major}
                  onChange={(e) =>
                    updateEducation(index, "major", e.target.value)
                  }
                />
                <select
                  value={item.status}
                  onChange={(e) =>
                    updateEducation(index, "status", e.target.value)
                  }
                >
                  <option>Đã tốt nghiệp</option>
                  <option>Đang học</option>
                </select>
                <input
                  type="month"
                  value={item.gradMonth}
                  onChange={(e) =>
                    updateEducation(index, "gradMonth", e.target.value)
                  }
                />
                <button
                  type="button"
                  onClick={() =>
                    setEducation(
                      education.filter((_, itemIndex) => itemIndex !== index),
                    )
                  }
                >
                  ×
                </button>
              </div>
            ))
          )}
        </div>

        <footer className={styles.footer}>
          {error && (
            <p
              style={{
                color: "#dc2626",
                fontSize: "0.875rem",
                margin: "0 0 8px",
              }}
            >
              {error}
            </p>
          )}
          <button
            className={styles.saveButton}
            type="submit"
            disabled={isSaving}
            style={
              isSaving ? { opacity: 0.6, cursor: "not-allowed" } : undefined
            }
          >
            {isSaving ? "Đang lưu..." : <>▣&nbsp; Lưu</>}
          </button>
        </footer>
      </form>
    </SidePanel>
  );
}

export default TeacherForm;
