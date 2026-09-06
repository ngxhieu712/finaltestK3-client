import styles from "./SidePanel.module.css";

function SidePanel({ title, children, onClose, wide = false }) {
  return (
    <div className={styles.backdrop} role="presentation" onMouseDown={onClose}>
      <aside
        className={`${styles.panel} ${wide ? styles.wide : ""}`}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        onMouseDown={(event) => event.stopPropagation()}
      >
        <header className={styles.header}>
          <button
            className={styles.close}
            type="button"
            aria-label="Đóng"
            onClick={onClose}
          >
            ×
          </button>
          <h2>{title}</h2>
        </header>
        <div className={styles.content}>{children}</div>
      </aside>
    </div>
  );
}

export default SidePanel;
