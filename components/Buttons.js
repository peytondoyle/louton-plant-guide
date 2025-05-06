export default function Buttons({ children, onClick, variant = "default", ...props }) {
  const base =
    "flex items-center justify-center gap-1 px-3 py-1 text-sm rounded-md transition border min-w-[100px]"; // added min-width

  const styles = {
    default: `${base} border-gray-300 text-black hover:bg-gray-100`,
    primary: `${base} bg-green-600 text-white border-none hover:bg-green-700`,
    danger: `${base} bg-red-600 text-white border-none hover:bg-red-700`,
  };

  return (
    <button onClick={onClick} className={styles[variant]} {...props}>
      {children}
    </button>
  );
}