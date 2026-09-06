import styles from "./SectionTitle.module.css";

function SectionTitle({ children, action }) {
  return (
    <div className={styles.titleRow}>
      <div className={styles.line} />
      <h3>{children}</h3>
      <div className={styles.growLine} />
      {action}
    </div>
  );
}

export default SectionTitle;
