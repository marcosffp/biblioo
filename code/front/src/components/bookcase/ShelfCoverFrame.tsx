import Image from "next/image";
import { BookCoverPlaceholder } from "@/components";

interface ShelfCoverFrameProps {
  covers: string[];
  shelfName: string;
  size?: "md" | "lg";
}

export function ShelfCoverFrame({ covers, shelfName, size = "md" }: Readonly<ShelfCoverFrameProps>) {
  const visibleCovers = covers.filter(Boolean).slice(0, 4);
  const frameSizeClassName = size === "lg" ? "h-24 w-24" : "h-20 w-20";
  const placeholderSize = size === "lg" ? 64 : 56;

  if (visibleCovers.length === 0) {
    return (
      <div className={`${frameSizeClassName} flex items-center justify-center rounded-[var(--radius-md)] bg-[var(--brand-100)]`}>
        <BookCoverPlaceholder size={placeholderSize} />
      </div>
    );
  }

  if (visibleCovers.length === 1) {
    return (
      <div className={`${frameSizeClassName} overflow-hidden rounded-[var(--radius-md)] border border-[var(--border-soft)] bg-[var(--bg-soft)]`}>
        <Image
          src={visibleCovers[0]}
          alt={`Capa da estante ${shelfName}`}
          width={size === "lg" ? 96 : 80}
          height={size === "lg" ? 96 : 80}
          className="h-full w-full object-cover"
        />
      </div>
    );
  }

  if (visibleCovers.length === 2) {
    return (
      <div className={`grid ${frameSizeClassName} grid-cols-2 grid-rows-1 gap-1 overflow-hidden rounded-[var(--radius-md)] border border-[var(--border-soft)] bg-[var(--bg-soft)] p-1`}>
        {visibleCovers.map((coverUrl, index) => (
          <Image
            key={`${coverUrl}-${index}`}
            src={coverUrl}
            alt={`Capa ${index + 1} da estante ${shelfName}`}
            width={size === "lg" ? 48 : 40}
            height={size === "lg" ? 48 : 40}
            className="block h-full w-full rounded-[6px] object-cover"
          />
        ))}
      </div>
    );
  }

  if (visibleCovers.length === 3) {
    return (
      <div className={`grid ${frameSizeClassName} grid-cols-2 grid-rows-2 gap-1 overflow-hidden rounded-[var(--radius-md)] border border-[var(--border-soft)] bg-[var(--bg-soft)] p-1`}>
        <Image src={visibleCovers[0]} alt={`Capa 1 da estante ${shelfName}`} width={size === "lg" ? 48 : 40} height={size === "lg" ? 48 : 40} className="block h-full w-full rounded-[6px] object-cover" />
        <Image src={visibleCovers[1]} alt={`Capa 2 da estante ${shelfName}`} width={size === "lg" ? 48 : 40} height={size === "lg" ? 48 : 40} className="block h-full w-full rounded-[6px] object-cover" />
        <Image src={visibleCovers[2]} alt={`Capa 3 da estante ${shelfName}`} width={size === "lg" ? 96 : 80} height={size === "lg" ? 48 : 40} className="col-span-2 block h-full w-full rounded-[6px] object-cover" />
      </div>
    );
  }

  return (
    <div className={`grid ${frameSizeClassName} grid-cols-2 grid-rows-2 gap-1 overflow-hidden rounded-[var(--radius-md)] border border-[var(--border-soft)] bg-[var(--bg-soft)] p-1`}>
      {visibleCovers.map((coverUrl, index) => (
        <Image
          key={`${coverUrl}-${index}`}
          src={coverUrl}
          alt={`Capa ${index + 1} da estante ${shelfName}`}
          width={size === "lg" ? 48 : 40}
          height={size === "lg" ? 48 : 40}
          className="block h-full w-full rounded-[6px] object-cover"
        />
      ))}
    </div>
  );
}
