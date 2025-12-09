
import AnimePageClientWrapper from "@/components/anime/anime-page-client-wrapper"

interface PageProps {
    params: Promise<{
        slug: string[]
    }>
}

export default async function AnimePage({ params }: PageProps) {
    const { slug } = await params
    return <AnimePageClientWrapper slugParts={slug} />
}
