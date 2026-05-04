import type { ShelfBook } from "@/hooks/useBookcasePage";
import type { ShelfItemSummaryResponse } from "@/services/profile";

export type DisplayShelfBook = Omit<ShelfBook, "shelfItemId"> & {
  shelfItemId: number;
  shelfId: number;
  bookId: number;
};

export type ShelfItemWithShelfId = ShelfItemSummaryResponse & {
  shelfId: number;
};

export type GenreDistribution = {
  label: string;
  value: number;
};
