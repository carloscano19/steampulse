import { searchGames } from "@/lib/api/igdb";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;
    const q = searchParams.get("q") || "";
    const offsetParam = searchParams.get("offset");
    const offset = offsetParam ? parseInt(offsetParam, 10) : 0;
    const limit = 20;
    const category = (searchParams.get("category") as any) || "trending";

    const games = await searchGames(q, limit, offset, category);

    return NextResponse.json({ games });
  } catch (error) {
    console.error("Games Search API error:", error);
    return NextResponse.json(
      { error: "Failed to fetch games from IGDB" },
      { status: 500 }
    );
  }
}
