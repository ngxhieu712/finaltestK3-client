import { useState } from "react";
import TeachersPage from "./pages/TeachersPage/TeachersPage";
import PositionsPage from "./pages/PositionsPage/PositionsPage";
import styles from "./App.module.css";

function App() {
  const [activePage, setActivePage] = useState("teachers");

  return (
    <main className={styles.appShell}>
      <header className={styles.topbar}>
        <div className={styles.brand}>
          <span className={styles.brandMark}>M</span> MindX School
        </div>
        <nav
          className={styles.navigation}
          aria-label="Điều hướng quản lý giáo viên"
        >
          <button
            className={activePage === "teachers" ? styles.activeNav : ""}
            onClick={() => setActivePage("teachers")}
          >
            Giáo viên
          </button>
          <button
            className={activePage === "positions" ? styles.activeNav : ""}
            onClick={() => setActivePage("positions")}
          >
            Vị trí công tác
          </button>
        </nav>
      </header>
      {activePage === "teachers" ? (
        <TeachersPage onOpenPositions={() => setActivePage("positions")} />
      ) : (
        <PositionsPage />
      )}
    </main>
  );
}

export default App;
