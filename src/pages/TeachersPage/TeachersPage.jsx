import { useEffect, useMemo, useState } from "react";
import StatusBadge from "../../components/StatusBadge/StatusBadge";
import TeacherForm from "../../components/TeacherForm/TeacherForm";
import { getTeachers } from "../../api/Teacher";
import styles from "./TeachersPage.module.css";

const PAGE_SIZE_OPTIONS = [10, 20, 50];

function Avatar({ name, image }) {
  const initials = name.split(" ").slice(-2).map((part) => part[0]).join("");
  return image ? (
    <img className={styles.avatar} src={image} alt="" />
  ) : (
    <span className={styles.avatar}>{initials}</span>
  );
}

function mapTeacherToRow(teacher) {
  const user = teacher.userId || {};
  const firstDegree = teacher.degrees?.[0];
  return {
    _id: teacher._id,
    id: teacher.code,
    name: user.name || "Chưa cập nhật",
    email: user.email || "",
    phone: user.phoneNumber || "",
    address: user.address || "",
    image: user.avatar || "",
    degree: firstDegree?.type || "Chưa cập nhật",
    major: firstDegree?.major || "Chưa cập nhật",
    position: teacher.teacherPositionId?.name || "Chưa gán",
    isActive: teacher.isActive !== false,
  };
}

// Tạo dãy số trang kiểu "1 2 3 ... 8 9 10", rút gọn khi có nhiều trang
function getPageNumbers(current, total) {
  const delta = 1;
  const range = [];
  const withDots = [];
  let last;

  for (let i = 1; i <= total; i++) {
    if (i === 1 || i === total || (i >= current - delta && i <= current + delta)) {
      range.push(i);
    }
  }
  for (const i of range) {
    if (last) {
      if (i - last === 2) withDots.push(last + 1);
      else if (i - last > 2) withDots.push("...");
    }
    withDots.push(i);
    last = i;
  }
  return withDots;
}

function TeachersPage({ onOpenPositions }) {
  const [teachers, setTeachers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);
  const [search, setSearch] = useState("");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [notice, setNotice] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  async function fetchAndSetTeachers() {
    const data = await getTeachers();
    setTeachers(data.map(mapTeacherToRow));
  }

  async function handleReload() {
    setIsLoading(true);
    setLoadError(null);
    try {
      await fetchAndSetTeachers();
      setSearch("");
      setPage(1); // dữ liệu mới -> quay về trang đầu cho chắc
      setNotice("Đã làm mới danh sách");
    } catch (err) {
      console.error("Không tải được danh sách giáo viên:", err);
      setLoadError(err.message || "Không thể tải danh sách giáo viên.");
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    let ignore = false;

    (async () => {
      try {
        const data = await getTeachers();
        if (!ignore) {
          setTeachers(data.map(mapTeacherToRow));
          setIsLoading(false);
        }
      } catch (err) {
        if (!ignore) {
          console.error("Không tải được danh sách giáo viên:", err);
          setLoadError(err.message || "Không thể tải danh sách giáo viên.");
          setIsLoading(false);
        }
      }
    })();

    return () => {
      ignore = true;
    };
  }, []);

  const filteredTeachers = useMemo(
    () =>
      teachers.filter((teacher) =>
        `${teacher.name} ${teacher.email} ${teacher.id}`
          .toLocaleLowerCase()
          .includes(search.toLocaleLowerCase()),
      ),
    [teachers, search],
  );

  // Kẹp page về trong khoảng hợp lệ ngay khi render, không cần effect riêng
  const totalPages = Math.max(1, Math.ceil(filteredTeachers.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const pagedTeachers = filteredTeachers.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize,
  );
  const pageNumbers = getPageNumbers(currentPage, totalPages);

  function handleSearchChange(event) {
    setSearch(event.target.value);
    setPage(1); // đổi từ khoá -> về trang đầu
  }

  function handlePageSizeChange(event) {
    setPageSize(Number(event.target.value));
    setPage(1); // đổi số dòng/trang -> về trang đầu
  }

  function saveTeacher(created) {
    setTeachers((prev) => [mapTeacherToRow(created), ...prev]);
    setIsFormOpen(false);
    setPage(1); // để thấy ngay giáo viên vừa tạo
    setNotice(`Đã tạo giáo viên ${created.userId?.name || ""}`);
  }

  return (
    <section className={styles.page}>
      <div className={styles.pageHeading}>
        <div>
          <p className={styles.eyebrow}>QUẢN LÝ NHÂN SỰ</p>
          <h1>Danh sách giáo viên</h1>
          <p className={styles.subtitle}>
            Theo dõi thông tin và vị trí công tác của giáo viên.
          </p>
        </div>
        <div className={styles.toolbar}>
          <label className={styles.search}>
            ⌕
            <input
              value={search}
              onChange={handleSearchChange}
              placeholder="Tìm kiếm thông tin"
            />
          </label>
          <button className={styles.outlineButton} type="button" onClick={handleReload}>
            ↻&nbsp; Tải lại
          </button>
          <button
            className={styles.primaryButton}
            type="button"
            onClick={() => setIsFormOpen(true)}
          >
            ♟&nbsp; Tạo mới
          </button>
        </div>
      </div>

      {notice && (
        <div className={styles.notice} role="status">
          {notice}
          <button onClick={() => setNotice("")} aria-label="Đóng thông báo">×</button>
        </div>
      )}

      {loadError && (
        <div className={styles.notice} role="alert" style={{ color: "#dc2626" }}>
          {loadError}
          <button onClick={() => setLoadError(null)} aria-label="Đóng thông báo">×</button>
        </div>
      )}

      <div className={styles.tableWrap}>
        {isLoading ? (
          <p className={styles.noResults}>Đang tải danh sách giáo viên...</p>
        ) : (
          <>
            <table>
              <thead>
                <tr>
                  <th>Mã</th>
                  <th>Giáo viên</th>
                  <th>Trình độ (cao nhất)</th>
                  <th>Bộ môn</th>
                  <th>TT Công tác <span title="Trạng thái">ⓘ</span></th>
                  <th>Địa chỉ</th>
                  <th>Trạng thái</th>
                  <th>Hành động</th>
                </tr>
              </thead>
              <tbody>
                {pagedTeachers.map((teacher) => (
                  <tr key={teacher._id}>
                    <td>{teacher.id}</td>
                    <td>
                      <div className={styles.teacher}>
                        <Avatar name={teacher.name} image={teacher.image} />
                        <div>
                          <strong>{teacher.name}</strong>
                          <small>{teacher.email}</small>
                          <small>{teacher.phone}</small>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div>{`Bậc: ${teacher.degree}`}</div>
                      <div>{`Chuyên ngành: ${teacher.major}`}</div>
                    </td>
                    <td className={styles.muted}>N/A</td>
                    <td>{teacher.position}</td>
                    <td>{teacher.address}</td>
                    <td><StatusBadge>{teacher.isActive ? "Đang công tác" : "Ngừng công tác"}</StatusBadge></td>
                    <td>
                      <button
                        className={styles.detailButton}
                        style={{ width: "100%", height: "100%" }}
                        onClick={() =>
                          setNotice(`Thông tin chi tiết của ${teacher.name} sẽ hiển thị tại đây.`)
                        }
                      >
                        ◉&nbsp; Chi tiết
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filteredTeachers.length === 0 && (
              <p className={styles.noResults}>Không tìm thấy giáo viên phù hợp.</p>
            )}
          </>
        )}
      </div>

      <footer className={styles.pagination}>
        <span>Tổng: <b>{filteredTeachers.length}</b></span>
        <button
          onClick={() => setPage((p) => Math.max(1, p - 1))}
          disabled={currentPage === 1}
        >
          ‹
        </button>
        {pageNumbers.map((p, index) =>
          p === "..." ? (
            <span key={`dots-${index}`} className={styles.dots}>…</span>
          ) : (
            <button
              key={p}
              className={p === currentPage ? styles.current : ""}
              onClick={() => setPage(p)}
            >
              {p}
            </button>
          ),
        )}
        <button
          onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
          disabled={currentPage === totalPages}
        >
          ›
        </button>
        <select value={pageSize} onChange={handlePageSizeChange}>
          {PAGE_SIZE_OPTIONS.map((size) => (
            <option key={size} value={size}>
              {size} / trang
            </option>
          ))}
        </select>
      </footer>

      {isFormOpen && (
        <TeacherForm
          onClose={() => setIsFormOpen(false)}
          onSave={saveTeacher}
          onOpenPositions={() => {
            setIsFormOpen(false);
            onOpenPositions();
          }}
        />
      )}
    </section>
  );
}

export default TeachersPage;