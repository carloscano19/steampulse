import { getMap } from "@/lib/api/fortnite";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const mapData = await getMap();
    return NextResponse.json(mapData);
  } catch (error) {
    console.error("Fortnite map API error:", error);
    return NextResponse.json(
      { error: "Failed to fetch map data" },
      { status: 500 }
    );
  }
}
