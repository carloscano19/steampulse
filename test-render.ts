import { getShop } from "./lib/api/fortnite";

async function main() {
  const items = await getShop();
  for (let i = 0; i < items.length; i++) {
    const item = items[i];
    try {
      const x = item.rarity.toLowerCase();
      const y = item.price.toLocaleString();
    } catch (err) {
      console.log("CRASH on item:", item);
      console.log(err);
    }
  }
  console.log("Render test complete. Total Items:", items.length);
}
main().catch(console.error);
