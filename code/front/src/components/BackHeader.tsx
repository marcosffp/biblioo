import type { ReactNode } from "react";
import React from "react";
import { BackArrowButton } from "./BackArrowButton";

export interface BackHeaderProps {
  title: ReactNode;
  subtitle?: ReactNode;
  onBack: () => void;
  ariaLabel?: string;
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
  className,
  titleClassName,
  subtitleClassName,
  backButtonClassName,
}: Readonly<BackHeaderProps>) {
  return (
    <span className={`inline-flex items-start gap-2 ${className ?? ""}`.trim()}>
      <BackArrowButton onClick={onBack} ariaLabel={ariaLabel} className={backButtonClassName} />
      <span className="min-w-0">
        <span className={titleClassName}>{title}</span>
        {subtitle ? <span className={`block ${subtitleClassName ?? ""}`.trim()}>{subtitle}</span> : null}
      </span>
    </span>
  );
}

export default BackHeader;
