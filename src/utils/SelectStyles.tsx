export const selectWidth = "200px";

export const commonSelectStyles = {
  container: (base: any) => ({
    ...base,
    width: selectWidth,
    marginBottom: "1rem",
  }),
  control: (base: any) => ({
    ...base,
    padding: "0.6rem",
    borderRadius: "12px",
    border: "1px solid #ddd",
    backgroundColor: "#fff",
    transition: "all 0.3s ease",
    boxShadow: "none",
    width: "100%",
  }),
  menu: (base: any) => ({
    ...base,
    borderRadius: "12px",
    padding: "0.2rem",
    backgroundColor: "#fff",
    boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
    width: selectWidth,
  }),
  option: (base: any, state: any) => ({
    ...base,
    backgroundColor: state.isFocused ? "#f5f5f5" : "#fff",
    color: "#000",
    padding: "0.6rem",
    borderRadius: "8px",
    cursor: "pointer",
    transform: state.isFocused ? "scale(1.02)" : "scale(1)",
    transition: "all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1)",
  }),
};
