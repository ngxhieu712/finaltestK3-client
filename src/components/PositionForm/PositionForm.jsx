import { useState } from "react";
import FormField from "../FormField/FormField";
import SidePanel from "../SidePanel/SidePanel";
import styles from "./PositionForm.module.css";

function PositionForm({ position, onClose, onSave }) {
  const [status, setStatus] = useState(position?.status ?? "Hoạt động");
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState(null);

  async function submit(event) {
    event.preventDefault();
    const values = Object.fromEntries(new FormData(event.currentTarget));
    const payload = {
      name: values.name,
      code: values.code,
      des: values.description, // model dùng "des", không phải "description"
      isActive: status === "Hoạt động", // model dùng boolean, không phải chuỗi
    };

    const isEditing = Boolean(position?.id);
    const url = isEditing
      ? `/teacher-position/${position.id}`
      : "/teacher-position";
    const method = isEditing ? "PUT" : "POST";

    setIsSaving(true);
    setError(null);
    try {
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        throw new Error(`Lỗi server: ${res.status}`);
      }

      const saved = await res.json();
      onSave(saved);
    } catch (err) {
      console.error("Không thể lưu vị trí công tác:", err);
      setError("Lưu thất bại, vui lòng thử lại.");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <SidePanel
      title={position ? "Cập nhật vị trí công tác" : "Vị trí công tác"}
      onClose={onClose}
    >
      <form className={styles.form} onSubmit={submit}>
        <FormField
          required
          label="Mã"
          name="code"
          defaultValue={position?.code}
          placeholder="VD: GVBM"
        />
        <FormField
          required
          label="Tên"
          name="name"
          defaultValue={position?.name}
          placeholder="Nhập tên vị trí"
        />
        <FormField
          required
          label="Mô tả"
          name="description"
          as="textarea"
          defaultValue={position?.description}
          placeholder="Nhập mô tả"
        />
        <div className={styles.status}>
          <span>
            <b>*</b>Trạng thái
          </span>
          <div className={styles.switch}>
            <button
              type="button"
              className={status === "Hoạt động" ? styles.selected : ""}
              onClick={() => setStatus("Hoạt động")}
            >
              Hoạt động
            </button>
            <button
              type="button"
              className={status === "Ngừng" ? styles.selected : ""}
              onClick={() => setStatus("Ngừng")}
            >
              Ngừng
            </button>
          </div>
        </div>

        {error && (
          <p
            style={{
              color: "#dc2626",
              fontSize: "0.875rem",
              margin: "8px 0 0",
            }}
          >
            {error}
          </p>
        )}

        <footer>
          <button
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

export default PositionForm;
