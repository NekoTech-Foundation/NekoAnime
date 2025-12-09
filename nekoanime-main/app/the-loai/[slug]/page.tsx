import AnimeList from "@/components/anime/anime-list"

export default async function GenrePage({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params
    return <AnimeList initialGenre={slug} />
}
