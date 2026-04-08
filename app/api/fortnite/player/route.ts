import { getPlayerStats } from "@/lib/api/fortnite";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const username = searchParams.get("username");

  if (!username || username.trim().length === 0) {
    return NextResponse.json(
      { error: "Username parameter is required" },
      { status: 400 }
    );
  }

  try {
    const stats = await getPlayerStats(username.trim());
    return NextResponse.json(stats);
  } catch (error) {
    console.error("Fortnite player stats API error:", error);
    return NextResponse.json(
      { error: "Failed to fetch player stats. Player may not exist." },
      { status: 404 }
    );
  }
}
