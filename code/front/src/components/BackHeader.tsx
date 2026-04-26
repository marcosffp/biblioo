import type { ReactNode } from "react";
import React from "react";
import { BackArrowButton } from "./BackArrowButton";

export interface BackHeaderProps {
  title?: ReactNode;
  subtitle?: ReactNode;
  onBack: () => void;
  ariaLabel?: string;
  backLabel?: string;
  className?: string;
  titleClassName?: string;
  subtitleClassName?: string;
  backButtonClassName?: string;
}

export function BackHeader({
  title,
  subtitle,
  onBack,
  ariaLabel = "Voltar",
  backLabel,
  className,
  titleClassName,
  subtitleClassName,
  backButtonClassName,
}: Readonly<BackHeaderProps>) {
  return (
    <span className={`inline-flex items-start gap-2 ${className ?? ""}`.trim()}>
      <BackArrowButton
        onClick={onBack}
        ariaLabel={ariaLabel}
        label={backLabel ?? ariaLabel}
        className={`-mt-0.5 ${backButtonClassName ?? ""}`.trim()}
      />
      {title || subtitle ? (
        <span className="min-w-0">
          {title ? <span className={`block ${titleClassName ?? ""}`.trim()}>{title}</span> : null}
          {subtitle ? <span className={`block ${subtitleClassName ?? ""}`.trim()}>{subtitle}</span> : null}
        </span>
      ) : null}
    </span>
  );
}

export default BackHeader;
