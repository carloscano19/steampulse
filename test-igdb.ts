import { getGameBySlug } from "./lib/api/igdb";

async function run() {
  const game = await getGameBySlug("crimson-desert");
  console.log(game?.name);
}
run();
