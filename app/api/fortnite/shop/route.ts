import { getShop } from "@/lib/api/fortnite";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const items = await getShop();
    return NextResponse.json({ items, count: items.length });
  } catch (error) {
    console.error("Fortnite shop API error:", error);
    return NextResponse.json(
      { error: "Failed to fetch shop data" },
      { status: 500 }
    );
  }
}
