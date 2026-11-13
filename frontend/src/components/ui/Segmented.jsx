import { cn } from "../../lib/utils";

export default function Segmented({
  value,
  onChange,
  options,
  ariaLabel,
  className,
  itemClassName,
}) {
  return (
    <div role="group" aria-label={ariaLabel} className={cn("seg", className)}>
      {options.map((option) => {
        const Icon = option.icon;
        return (
          <button
            key={option.value}
            type="button"
            onClick={() => onChange(option.value)}
            aria-pressed={value === option.value}
            className={cn("seg-item", itemClassName)}
          >
            {Icon && <Icon className="h-3.5 w-3.5" aria-hidden="true" />}
            {option.label}
          </button>
        );
      })}
    </div>
  );
}
