"use server";

import { cookies } from "next/headers";

export async function setSpotlightCookie(slug: string) {
  const cookieStore = await cookies();
  cookieStore.set("custom_spotlight", slug, { 
    maxAge: 60 * 60 * 24 * 30, // Keep in browser for 30 days
    path: "/",
  });
}

export async function clearSpotlightCookie() {
  const cookieStore = await cookies();
  cookieStore.delete("custom_spotlight");
}
