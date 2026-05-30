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
      <span className="inline-flex min-w-[3rem] items-center justify-center rounded-full bg-slate-200 px-3 py-1 text-xs font-semibold text-slate-400 cursor-not-allowed">
        {label}
      </span>
    );
  }

  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex min-w-[3rem] items-center justify-center rounded-full px-3 py-1 text-xs font-semibold text-white shadow-sm transition ${color} ${hoverColor}`}
    >
      {label}
    </button>
  );
}
