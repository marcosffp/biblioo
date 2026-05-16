import { Pencil } from "lucide-react";
import { ProgressBar } from "@/components/ProgressBar";

interface ReadingGoalSectionProps {
  current: number;
  target: number;
  year?: number;
  onEdit?: () => void;
}

export function ReadingGoalSection({
  current,
  target,
  year = new Date().getFullYear(),
  onEdit,
}: Readonly<ReadingGoalSectionProps>) {
  const pct = target > 0 ? (current / target) * 100 : 0;
  const remaining = Math.max(0, target - current);
  const done = current >= target;

  return (
    <section className="flex flex-col rounded-xl border border-border bg-card p-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-semibold text-foreground">Meta de leitura {year}</h2>
          <p className="text-xs text-muted-foreground">Acompanhe seu progresso anual</p>
        </div>
        {onEdit && (
          <button
            onClick={onEdit}
            aria-label="Editar meta"
            className="flex h-8 w-8 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            <Pencil size={14} />
          </button>
        )}
      </div>

      <div className="mt-4 flex-1">
        <div className="flex items-center justify-between text-sm">
          <span className="font-medium text-foreground">Meta de leitura {year}</span>
          <span className="font-semibold text-foreground">
            {current}/{target}
          </span>
        </div>
        <div className="mt-2.5">
          <ProgressBar value={Math.min(pct, 100)} />
        </div>
        <p className="mt-2 text-xs text-muted-foreground">
          {done
            ? `Parabéns! Você completou sua meta de ${target} livros.`
            : `Faltam ${remaining} livro${remaining !== 1 ? "s" : ""} para completar sua meta.`}
        </p>
      </div>
    </section>
  );
}

export default ReadingGoalSection;
