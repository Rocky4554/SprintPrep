interface LanguageButtonProps {
  label: string;
  color: string;
  hoverColor: string;
  disabled?: boolean;
  onClick: () => void;
}

export default function LanguageButton({
  label,
  color,
  hoverColor,
  disabled = false,
  onClick,
}: LanguageButtonProps) {
  if (disabled) {
    return (
      <span className="inline-flex min-h-[40px] min-w-[3.25rem] items-center justify-center rounded-xl bg-slate-200 px-3 py-2 text-xs font-semibold text-slate-400 sm:min-h-0 sm:rounded-full sm:py-1">
        {label}
      </span>
    );
  }

  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex min-h-[40px] min-w-[3.25rem] items-center justify-center rounded-xl px-3 py-2 text-xs font-semibold text-white shadow-sm transition active:scale-95 sm:min-h-0 sm:rounded-full sm:py-1 ${color} ${hoverColor}`}
    >
      {label}
    </button>
  );
}
