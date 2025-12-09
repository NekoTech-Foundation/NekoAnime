import AnimeList from "@/components/anime/anime-list"

export default async function YearPage({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params
    return <AnimeList initialYear={slug} />
}
