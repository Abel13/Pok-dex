export const POKEAPI_LANG = "pt-br";

export function getLocalizedName(
  entries: { name: string; language: { name: string } }[] | undefined,
  lang: string
): string {
  if (!entries?.length) return "";
  const entry = entries.find((e) => e.language.name === lang);
  if (entry) return entry.name;
  const fallback = entries.find((e) => e.language.name === "en");
  return fallback?.name ?? entries[0]?.name ?? "";
}

export function getLocalizedGenus(
  genera: { genus: string; language: { name: string } }[] | undefined,
  lang: string
): string {
  if (!genera?.length) return "";
  const entry = genera.find((g) => g.language.name === lang);
  if (entry) return entry.genus;
  const fallback = genera.find((g) => g.language.name === "en");
  return fallback?.genus ?? genera[0]?.genus ?? "";
}

export function getLocalizedFlavorText(
  entries: { flavor_text: string; language: { name: string } }[] | undefined,
  lang: string
): string {
  if (!entries?.length) return "";
  const entry = entries.find((e) => e.language.name === lang);
  if (entry) return entry.flavor_text.replace(/\f/g, " ");
  const fallback = entries.find((e) => e.language.name === "en");
  if (fallback) return fallback.flavor_text.replace(/\f/g, " ");
  return entries[0]?.flavor_text?.replace(/\f/g, " ") ?? "";
}
