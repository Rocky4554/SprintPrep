import type { Language } from "@/types";

export const LANGUAGES: {
  id: Language;
  label: string;
  color: string;
  hoverColor: string;
}[] = [
  { id: "c", label: "C", color: "bg-emerald-600", hoverColor: "hover:bg-emerald-700" },
  { id: "cpp", label: "C++", color: "bg-orange-500", hoverColor: "hover:bg-orange-600" },
  { id: "java", label: "Java", color: "bg-red-600", hoverColor: "hover:bg-red-700" },
  { id: "python", label: "Python", color: "bg-blue-600", hoverColor: "hover:bg-blue-700" },
];

export const LANGUAGE_LABELS: Record<Language, string> = {
  c: "C",
  cpp: "C++",
  java: "Java",
  python: "Python",
};
