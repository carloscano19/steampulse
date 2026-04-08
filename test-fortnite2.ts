import { getShop, getMap } from "./lib/api/fortnite";

async function main() {
  console.log("Testing shop...");
  try {
    const shop = await getShop();
    console.log("Shop items found:", shop.length);
  } catch(e) {
    console.error("Shop error:", e);
  }
  
  console.log("Testing map...");
  try {
    const map = await getMap();
    console.log("Map result:", map.result, "POIs type:", typeof map.images.pois);
  } catch(e) {
    console.error("Map error:", e);
  }
}
main();
