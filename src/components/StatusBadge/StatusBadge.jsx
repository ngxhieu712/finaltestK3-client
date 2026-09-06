import styles from "./StatusBadge.module.css";

function StatusBadge({ children, inactive = false }) {
  return (
    <span className={`${styles.badge} ${inactive ? styles.inactive : ""}`}>
      {children}
    </span>
  );
}

export default StatusBadge;
