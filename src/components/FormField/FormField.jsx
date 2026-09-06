import styles from "./FormField.module.css";

function FormField({
  label,
  required,
  as = "input",
  className = "",
  ...props
}) {
  const Input = as;
  return (
    <label className={`${styles.field} ${className}`}>
      <span>
        {required && <b>*</b>}
        {label}
      </span>
      <Input {...props} />
    </label>
  );
}

export default FormField;
