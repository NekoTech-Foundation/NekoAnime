import { NextRequest, NextResponse } from "next/server";
import { AnimeVietSubScraper } from "@/lib/scrapers/anime-vietsub";

const scraper = new AnimeVietSubScraper();

export async function GET(req: NextRequest) {
    const episodeId = req.nextUrl.searchParams.get('episodeId');
    const mediaId = req.nextUrl.searchParams.get('mediaId');

    if (!episodeId || !mediaId) {
        return NextResponse.json({ error: "Missing episodeId or mediaId" }, { status: 400 });
    }

    try {
        const source = await scraper.getStreamSource(episodeId, mediaId);
        return NextResponse.json(source);
    } catch (error) {
        console.error("[API] Resolve Error:", error);
        return NextResponse.json({ error: error instanceof Error ? error.message : "Failed to resolve stream" }, { status: 500 });
    }
}
