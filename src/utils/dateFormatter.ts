const RW_MONTHS = [
  "Mutarama", "Gashyantare", "Werurwe", "Mata",
  "Gicurasi", "Kamena", "Nyakanga", "Kanama",
  "Nzeli", "Ukwakira", "Ugushyingo", "Ukuboza",
];

const RW_DAYS = [
  "Ku cyumweru", "Kuwa mbere", "Kuwa kabiri",
  "Kuwa gatatu", "Kuwa kane", "Kuwa gatanu", "Kuwa gatandatu",
];

const LOCALE_MAP: Record<string, string> = {
  en: "en-US",
  fr: "fr-FR",
  rw: "rw-RW",
};

export function formatDate(isoString: string, lang: string): string {
  const date = new Date(isoString);
  if (isNaN(date.getTime())) return isoString;

  if (lang === "rw") {
    const day = RW_DAYS[date.getDay()];
    const month = RW_MONTHS[date.getMonth()];
    return `${day}, ${date.getDate()} ${month} ${date.getFullYear()}`;
  }

  const locale = LOCALE_MAP[lang] ?? "en-US";
  try {
    return new Intl.DateTimeFormat(locale, {
      year: "numeric",
      month: "long",
      day: "numeric",
    }).format(date);
  } catch {
    return new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    }).format(date);
  }
}

export function formatDateShort(isoString: string, lang: string): string {
  const date = new Date(isoString);
  if (isNaN(date.getTime())) return isoString;

  if (lang === "rw") {
    const month = RW_MONTHS[date.getMonth()];
    return `${date.getDate()} ${month} ${date.getFullYear()}`;
  }

  const locale = LOCALE_MAP[lang] ?? "en-US";
  try {
    return new Intl.DateTimeFormat(locale, {
      year: "numeric",
      month: "short",
      day: "numeric",
    }).format(date);
  } catch {
    return new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    }).format(date);
  }
}

export function formatTime(isoString: string, lang: string): string {
  const date = new Date(isoString);
  if (isNaN(date.getTime())) return isoString;

  if (lang === "rw") {
    const h = date.getHours().toString().padStart(2, "0");
    const m = date.getMinutes().toString().padStart(2, "0");
    return `${h}:${m}`;
  }

  const locale = LOCALE_MAP[lang] ?? "en-US";
  try {
    return new Intl.DateTimeFormat(locale, {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    }).format(date);
  } catch {
    const h = date.getHours().toString().padStart(2, "0");
    const m = date.getMinutes().toString().padStart(2, "0");
    return `${h}:${m}`;
  }
}

export function formatDateTime(isoString: string, lang: string): string {
  return `${formatDate(isoString, lang)} ${formatTime(isoString, lang)}`;
}
