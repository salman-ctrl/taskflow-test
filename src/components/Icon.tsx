type IconName =
  | "check"
  | "plus"
  | "grid"
  | "circle"
  | "edit"
  | "trash"
  | "arrow"
  | "spark"
  | "close";

const paths: Record<IconName, string> = {
  check: "m5 12 4 4L19 6",
  plus: "M12 5v14M5 12h14",
  grid: "M4 4h6v6H4zM14 4h6v6h-6zM4 14h6v6H4zM14 14h6v6h-6z",
  circle: "M20 12a8 8 0 1 1-16 0 8 8 0 0 1 16 0",
  edit: "m14 5 5 5M4 20l4-1L20 7a2 2 0 0 0-5-5L3 14l-1 5z",
  trash: "M3 6h18M9 6V3h6v3M5 6l1 15h12l1-15M10 10v7M14 10v7",
  arrow: "M5 12h14m-5-5 5 5-5 5",
  spark: "m12 3 2.5 6.5L21 12l-6.5 2.5L12 21l-2.5-6.5L3 12l6.5-2.5z",
  close: "m6 6 12 12M6 18 18 6",
};

export function Icon({ name, size = 20 }: { name: IconName; size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d={paths[name]} />
    </svg>
  );
}
