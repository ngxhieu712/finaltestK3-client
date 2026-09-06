import { useEffect, useState } from "react";
import PositionForm from "../../components/PositionForm/PositionForm";
import StatusBadge from "../../components/StatusBadge/StatusBadge";
import styles from "./PositionsPage.module.css";

const API_URL = import.meta.env.VITE_API_URL || "";
const BASE_URL = `${API_URL}/teacher-position`;

// Map document từ server (_id, des, isActive) sang shape mà UI đang dùng
function toUiPosition(doc) {
  return {
    id: doc._id,
    code: doc.code,
    name: doc.name,
    status: doc.isActive ? "Hoạt động" : "Ngừng",
    description: doc.des ?? "",
  };
}

function PositionsPage() {
  const [positions, setPositions] = useState([]);
  const [editing, setEditing] = useState(null);
  const [notice, setNotice] = useState("");
  const [isLoading, setIsLoading] = useState(true); // đã true sẵn, khỏi cần set lại lúc mount
  const [loadError, setLoadError] = useState(null);

  // Hàm fetch thuần, KHÔNG setState trước await -> gọi trong effect vẫn an toàn
  async function fetchPositions() {
    const res = await fetch(BASE_URL);
    if (!res.ok) throw new Error(`Lỗi server: ${res.status}`);
    const data = await res.json();
    return data.map(toUiPosition);
  }

  useEffect(() => {
    let ignore = false;
    fetchPositions()
      .then((list) => {
        if (ignore) return;
        setPositions(list); // chạy trong .then -> không bị flag
        setIsLoading(false);
      })
      .catch((err) => {
        if (ignore) return;
        console.error("Không thể tải danh sách vị trí công tác:", err);
        setLoadError("Không thể tải dữ liệu, vui lòng thử lại.");
        setIsLoading(false);
      });
    return () => {
      ignore = true;
    };
  }, []);

  // Refresh nằm trong event handler -> setState đồng bộ ở đây không bị lint cảnh báo
  async function handleRefresh() {
    setIsLoading(true);
    setLoadError(null);
    try {
      const list = await fetchPositions();
      setPositions(list);
      setNotice("Đã làm mới danh sách");
    } catch (err) {
      console.error("Không thể tải danh sách vị trí công tác:", err);
      setLoadError("Không thể tải dữ liệu, vui lòng thử lại.");
    } finally {
      setIsLoading(false);
    }
  }

  // ...
  // <button className={styles.refreshButton} onClick={handleRefresh}>
  //   ↻&nbsp; Làm mới
  // </button>

  // onSave trả về document thô từ server (res.json() trong PositionForm)
  function savePosition(rawDoc) {
    const uiPosition = toUiPosition(rawDoc);
    setPositions((prev) => {
      const exists = prev.some((p) => p.id === uiPosition.id);
      return exists
        ? prev.map((p) => (p.id === uiPosition.id ? uiPosition : p))
        : [...prev, uiPosition];
    });
    setEditing(null);
    setNotice(`Đã lưu vị trí ${uiPosition.name}`);
  }

  return (
    <section className={styles.page}>
      <div className={styles.heading}>
        <div>
          <p>QUẢN LÝ NHÂN SỰ</p>
          <h1>Vị trí công tác</h1>
          <small>
            Thiết lập các vai trò và vị trí của giáo viên trong trường.
          </small>
        </div>
        <div className={styles.actions}>
          <button
            className={styles.createButton}
            onClick={() => setEditing({})}
          >
            ＋&nbsp; Tạo
          </button>
          //{" "}
          <button className={styles.refreshButton} onClick={handleRefresh}>
            // ↻&nbsp; Làm mới //{" "}
          </button>
        </div>
      </div>
      {notice && (
        <div className={styles.notice}>
          {notice}
          <button onClick={() => setNotice("")}>×</button>
        </div>
      )}
      {loadError && (
        <div className={styles.notice}>
          {loadError}
          <button onClick={() => setLoadError(null)}>×</button>
        </div>
      )}
      <div className={styles.tableWrap}>
        <table>
          <thead>
            <tr>
              <th>STT</th>
              <th>Mã</th>
              <th>Tên</th>
              <th>Trạng thái</th>
              <th>Mô tả</th>
              <th aria-label="Thao tác" />
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan={6}>Đang tải...</td>
              </tr>
            ) : positions.length === 0 ? (
              <tr>
                <td colSpan={6}>Chưa có vị trí công tác nào.</td>
              </tr>
            ) : (
              positions.map((position, index) => (
                <tr key={position.id}>
                  <td>{index + 1}</td>
                  <td>{position.code}</td>
                  <td>{position.name}</td>
                  <td>
                    <StatusBadge inactive={position.status === "Ngừng"}>
                      {position.status}
                    </StatusBadge>
                  </td>
                  <td>{position.description}</td>
                  <td>
                    <button
                      className={styles.editButton}
                      onClick={() => setEditing(position)}
                      aria-label={`Sửa ${position.name}`}
                    >
                      ⚙
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      {editing && (
        <PositionForm
          position={editing.id ? editing : null}
          onClose={() => setEditing(null)}
          onSave={savePosition}
        />
      )}
    </section>
  );
}

export default PositionsPage;
