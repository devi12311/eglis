import en from "@/messages/en.json";
import it from "@/messages/it.json";
import sq from "@/messages/sq.json";
import type { Locale } from "./config";

const dictionaries = { en, sq, it };

export type Messages = typeof en;

export function getMessages(locale: Locale): Messages {
  return dictionaries[locale] ?? dictionaries.en;
}
