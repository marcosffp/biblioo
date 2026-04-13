import { BookCoverPlaceholder } from "@/components";

interface ShelfCoverFrameProps {
  covers: string[];
  shelfName: string;
}

export function ShelfCoverFrame({ covers, shelfName }: Readonly<ShelfCoverFrameProps>) {
  const visibleCovers = covers.filter(Boolean).slice(0, 4);

  if (visibleCovers.length === 0) {
    return (
      <div className="h-20 w-20 flex items-center justify-center rounded-[var(--radius-md)] bg-[var(--brand-100)]">
        <BookCoverPlaceholder size={56} />
      </div>
    );
  }

  if (visibleCovers.length === 1) {
    return (
      <div className="h-20 w-20 overflow-hidden rounded-[var(--radius-md)] border border-[var(--border-soft)] bg-[var(--bg-soft)]">
        <img
          src={visibleCovers[0]}
          alt={`Capa da estante ${shelfName}`}
          className="h-full w-full object-cover"
        />
      </div>
    );
  }

  if (visibleCovers.length === 2) {
    return (
      <div className="grid h-20 w-20 grid-cols-2 grid-rows-1 gap-1 overflow-hidden rounded-[var(--radius-md)] border border-[var(--border-soft)] bg-[var(--bg-soft)] p-1">
        {visibleCovers.map((coverUrl, index) => (
          <img
            key={`${coverUrl}-${index}`}
            src={coverUrl}
            alt={`Capa ${index + 1} da estante ${shelfName}`}
            className="block h-full w-full rounded-[6px] object-cover"
          />
        ))}
      </div>
    );
  }

  if (visibleCovers.length === 3) {
    return (
      <div className="grid h-20 w-20 grid-cols-2 grid-rows-2 gap-1 overflow-hidden rounded-[var(--radius-md)] border border-[var(--border-soft)] bg-[var(--bg-soft)] p-1">
        <img
          src={visibleCovers[0]}
          alt={`Capa 1 da estante ${shelfName}`}
          className="block h-full w-full rounded-[6px] object-cover"
        />
        <img
          src={visibleCovers[1]}
          alt={`Capa 2 da estante ${shelfName}`}
          className="block h-full w-full rounded-[6px] object-cover"
        />
        <img
          src={visibleCovers[2]}
          alt={`Capa 3 da estante ${shelfName}`}
          className="col-span-2 block h-full w-full rounded-[6px] object-cover"
        />
      </div>
    );
  }

  return (
    <div className="grid h-20 w-20 grid-cols-2 grid-rows-2 gap-1 overflow-hidden rounded-[var(--radius-md)] border border-[var(--border-soft)] bg-[var(--bg-soft)] p-1">
      {visibleCovers.map((coverUrl, index) => (
        <img
          key={`${coverUrl}-${index}`}
          src={coverUrl}
          alt={`Capa ${index + 1} da estante ${shelfName}`}
          className="block h-full w-full rounded-[6px] object-cover"
        />
      ))}
    </div>
  );
}
