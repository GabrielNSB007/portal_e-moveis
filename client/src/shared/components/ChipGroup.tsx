import { cn } from "@/shared/utils/cn";

type ChipOption<T extends string> = {
  value: T;
  label: string;
};

type ChipGroupProps<T extends string> = {
  label: string;
  options: ChipOption<T>[];
  value: T[];
  onChange: (value: T[]) => void;
};

export function ChipGroup<T extends string>({ label, options, value, onChange }: ChipGroupProps<T>) {
  function toggle(option: T) {
    onChange(value.includes(option) ? value.filter((item) => item !== option) : [...value, option]);
  }

  return (
    <div className="grid gap-3">
      <p className="text-sm font-semibold text-foreground">{label}</p>
      <div className="flex flex-wrap gap-2">
        {options.map((option) => {
          const active = value.includes(option.value);
          return (
            <button
              key={option.value}
              type="button"
              onClick={() => toggle(option.value)}
              className={cn(
                "rounded-full border px-4 py-2 text-sm font-semibold transition",
                active
                  ? "border-primary bg-primary text-primary-foreground shadow-lg shadow-primary/20"
                  : "border-border bg-card text-muted-foreground hover:border-primary/50 hover:text-foreground",
              )}
            >
              {option.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
