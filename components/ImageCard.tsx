interface ImageCardProps {
  src: string;
  label: string;
  onClick: () => void;
  disabled?: boolean;
  selected?: boolean;
}

export default function ImageCard({
  src,
  label,
  onClick,
  disabled = false,
  selected = false,
}: ImageCardProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-pressed={selected}
      className={[
        "group relative flex flex-col w-full rounded-2xl overflow-hidden",
        "border-2 transition-all duration-200",
        "focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary/30 focus-visible:ring-offset-2",
        selected
          ? "border-primary shadow-xl shadow-primary/20 scale-[1.02]"
          : "border-gray-200",
        !disabled
          ? "hover:border-primary hover:shadow-xl hover:shadow-primary/20 hover:scale-[1.02] cursor-pointer"
          : "cursor-default",
        disabled && !selected ? "opacity-50" : "",
      ]
        .filter(Boolean)
        .join(" ")}
    >
      {/* Image */}
      <div className="relative w-full aspect-[4/3] overflow-hidden bg-gray-100">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={src}
          alt={label}
          className={[
            "w-full h-full object-cover",
            "transition-transform duration-300",
            !disabled ? "group-hover:scale-105" : "",
          ]
            .filter(Boolean)
            .join(" ")}
        />

        {/* Selected overlay checkmark */}
        {selected && (
          <div className="absolute inset-0 bg-primary/10 flex items-center justify-center">
            <div className="bg-primary text-white rounded-full w-14 h-14 flex items-center justify-center shadow-lg">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="currentColor"
                className="w-7 h-7"
                aria-hidden="true"
              >
                <path
                  fillRule="evenodd"
                  d="M19.916 4.626a.75.75 0 0 1 .208 1.04l-9 13.5a.75.75 0 0 1-1.154.114l-6-6a.75.75 0 0 1 1.06-1.06l5.353 5.353 8.493-12.74a.75.75 0 0 1 1.04-.207Z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
          </div>
        )}
      </div>

      {/* Label */}
      <div
        className={[
          "px-6 py-4 flex items-center justify-center gap-2",
          "transition-colors duration-200",
          selected
            ? "bg-primary text-white"
            : "bg-white text-gray-800 group-hover:bg-primary group-hover:text-white",
          disabled && !selected ? "group-hover:bg-white group-hover:text-gray-800" : "",
        ]
          .filter(Boolean)
          .join(" ")}
      >
        <span className="font-semibold text-base">{label}</span>
        {!disabled && !selected && (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity duration-200 -translate-x-1 group-hover:translate-x-0 transition-transform"
            aria-hidden="true"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
          </svg>
        )}
      </div>
    </button>
  );
}
