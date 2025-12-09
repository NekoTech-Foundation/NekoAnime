import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const url = req.nextUrl.searchParams.get("url");

  if (!url) {
    return new NextResponse("Missing URL", { status: 400 });
  }

  try {
    // Fetch the raw content from the source (bypass CORS)
    const response = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Referer": "https://animevietsub.show/", // Pretend to be the original site
        "Accept": "*/*"
        // "Origin": "https://animevietsub.show" // Removed Origin as it might trigger stricter CORS checks on GET
      },
    });

    if (!response.ok) {
        const errorText = await response.text()
        console.error(`[Proxy] Failed to fetch ${url}: ${response.status} - ${errorText.substring(0, 200)}`)
        return new NextResponse(`Upstream Error: ${response.status}\n${errorText}`, { status: response.status })
    }

    // Stream the response back to the client
    // We pass through the body directly for performance
    // FORCE Content-Type to video/mp2t because upstream serves .html (obfuscation)
    return new NextResponse(response.body, {
      status: 200,
      headers: {
        "Content-Type": "video/mp2t",
        "Access-Control-Allow-Origin": "*", // Allow our localhost to access this
        "Cache-Control": "public, max-age=3600"
      },
    });
  } catch (error) {
    console.error("[Proxy] Error:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
