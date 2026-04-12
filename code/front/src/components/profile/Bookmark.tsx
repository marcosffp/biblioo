type BookmarkProps = {
  label?: string;
  className?: string;
};

export function Bookmark({ label, className }: BookmarkProps) {
  return (
    <span
      aria-hidden={label ? undefined : true}
      aria-label={label ? `Status: ${label}` : undefined}
      title={label}
      className={`pointer-events-none absolute left-[-4px] top-[-10px] z-30 h-12 w-12 tablet:left-0 ${className ?? "text-primary-dark"}`.trim()}
    >
      <svg
        viewBox="0 0 24 24"
        className="h-12 w-12 drop-shadow-[0_3px_8px_rgba(0,0,0,0.2)]"
      >
        <path
          d="M16.5 2H8.5C6.8 2 5.5 3.3 5.5 5V21C5.5 21.2 5.5 21.3 5.6 21.5C5.9 22 6.5 22.1 7 21.9L12.5 18.7L18 21.9C18.2 22 18.3 22 18.5 22C19.1 22 19.5 21.6 19.5 21V5C19.5 3.3 18.2 2 16.5 2Z"
          fill="currentColor"
        />
      </svg>
    </span>
  );
}