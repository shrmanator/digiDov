export const googlePlacesStyles = {
  control: (base: any, state: { isFocused: any }) => ({
    ...base,
    borderRadius: "var(--radius)",
    border: "1px solid hsl(var(--input))",
    backgroundColor: "transparent",
    paddingLeft: "0.75rem",
    paddingRight: "0.75rem",
    paddingTop: "0.10rem", // reduced vertical padding
    paddingBottom: "0.10rem", // reduced vertical padding
    fontSize: "0.90rem",
    boxShadow: state.isFocused ? "0 0 0 2px hsl(var(--ring) / 0.5)" : "none",
    "&:hover": {
      borderColor: "hsl(var(--input))",
    },
  }),
  valueContainer: (base: any) => ({
    ...base,
    fontSize: "0.90rem",
  }),
  singleValue: (base: any) => ({
    ...base,
    color: "inherit",
    fontSize: "0.90rem",
  }),
  input: (base: any) => ({
    ...base,
    color: "inherit",
    margin: 0,
    padding: 0,
    fontSize: "0.90rem",
  }),
  placeholder: (base: any) => ({
    ...base,
    color: "hsl(var(--muted-foreground))",
    fontSize: "0.90rem",
  }),
  dropdownIndicator: (base: any) => ({
    ...base,
    color: "hsl(var(--muted-foreground))",
  }),
  menu: (base: any) => ({
    ...base,
    backgroundColor: "hsl(var(--card))",
    border: "1px solid hsl(var(--input))",
  }),
  option: (base: any, state: { isFocused: any }) => ({
    ...base,
    backgroundColor: state.isFocused
      ? "hsl(var(--accent))"
      : "hsl(var(--card))",
    color: "hsl(var(--foreground))",
    fontSize: "0.75rem",
  }),
};

export default googlePlacesStyles;
