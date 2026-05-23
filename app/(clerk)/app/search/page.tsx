import SearchPageClient from "./SearchPageClient";

export default function SearchPage({
  searchParams,
}: {
  searchParams?: { q?: string };
}) {
  const q = typeof searchParams?.q === "string" ? searchParams.q : "";
  return <SearchPageClient initialQuery={q} />;
}
