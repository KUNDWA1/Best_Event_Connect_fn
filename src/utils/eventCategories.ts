import type { EventType } from "../services/api";

const CUSTOM_EVENT_TYPE_REGEX =
  /^Custom Event Type:\s*(.+?)(?:\.\s*|\s*$)/i;

const EVENT_TYPE_ALIASES: Record<EventType, string[]> = {
  wedding: ["wedding", "weddings"],
  conference: ["conference", "conferences"],
  birthday: ["birthday", "birth day", "birthday party"],
  corporate: ["corporate", "corporate event", "corporate events"],
  concert: ["concert", "concerts", "festival", "festivals", "charity", "charity event"],
  other: ["other"],
};

export const DEFAULT_EVENT_CATEGORY_NAMES = [
  "Wedding",
  "Birthday",
  "Corporate",
  "Conference",
  "Concert",
];

const normalizeLookupValue = (value: string) =>
  value.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();

const capitalizeWords = (value: string) =>
  value
    .split(" ")
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");

export const dedupeEventCategoryNames = (names: string[]) => {
  const seen = new Set<string>();

  return names.reduce<string[]>((accumulator, name) => {
    const cleanedName = name.trim();
    if (!cleanedName) {
      return accumulator;
    }

    const key = normalizeLookupValue(cleanedName);
    if (seen.has(key)) {
      return accumulator;
    }

    seen.add(key);
    accumulator.push(cleanedName);
    return accumulator;
  }, []);
};

export const extractCustomEventType = (description?: string | null) => {
  if (!description) {
    return null;
  }

  const matched = description.match(CUSTOM_EVENT_TYPE_REGEX);
  return matched?.[1]?.trim() || null;
};

export const stripCustomEventTypePrefix = (description?: string | null) => {
  if (!description) {
    return "";
  }

  return description.replace(CUSTOM_EVENT_TYPE_REGEX, "").trim();
};

export const getEventDisplayType = (
  eventType?: string | null,
  description?: string | null,
) => {
  if (!eventType) {
    return "";
  }

  if (eventType === "other") {
    return extractCustomEventType(description) || eventType;
  }

  return capitalizeWords(eventType.replace(/_/g, " "));
};

export const getInitialEventCategory = (
  eventType?: string | null,
  description?: string | null,
) => getEventDisplayType(eventType, description);

export const resolveEventTypeSelection = (categoryName: string) => {
  const cleanedName = categoryName.trim();
  const normalizedName = normalizeLookupValue(cleanedName);

  const matchedEventType = (Object.keys(EVENT_TYPE_ALIASES) as EventType[]).find(
    (eventType) =>
      EVENT_TYPE_ALIASES[eventType].some(
        (alias) => normalizeLookupValue(alias) === normalizedName,
      ),
  );

  if (matchedEventType && matchedEventType !== "other") {
    return {
      eventType: matchedEventType,
      customEventType: "",
    };
  }

  return {
    eventType: "other" as EventType,
    customEventType: cleanedName,
  };
};

export const buildEventDescription = (
  description: string,
  eventType: EventType | "",
  customEventType?: string,
) => {
  const cleanedDescription = stripCustomEventTypePrefix(description);
  const trimmedCustomEventType = customEventType?.trim() || "";

  if (eventType === "other" && trimmedCustomEventType) {
    return cleanedDescription
      ? `Custom Event Type: ${trimmedCustomEventType}. ${cleanedDescription}`
      : `Custom Event Type: ${trimmedCustomEventType}.`;
  }

  return cleanedDescription;
};