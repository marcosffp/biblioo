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
    <span className={`inline-flex max-w-full flex-col items-start gap-1 ${className ?? ""}`.trim()}>
      <BackArrowButton
        onClick={onBack}
        ariaLabel={ariaLabel}
        label={backLabel ?? ariaLabel}
        className={`${backButtonClassName ?? ""}`.trim()}
      />
      {title || subtitle ? (
        <span className="min-w-0 max-w-full">
          {title ? <span className={`block break-words ${titleClassName ?? ""}`.trim()}>{title}</span> : null}
          {subtitle ? <span className={`block break-words ${subtitleClassName ?? ""}`.trim()}>{subtitle}</span> : null}
        </span>
      ) : null}
    </span>
  );
}

export default BackHeader;
