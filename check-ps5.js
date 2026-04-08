const Parser = require("rss-parser");
const parser = new Parser();
async function run() {
  const feed = await parser.parseURL("https://es.ign.com/feed.xml");
  console.log("Total articles:", feed.items.length);
  const ps5 = feed.items.filter(i => /ps5|playstation/i.test(i.title || ""));
  console.log("PS5 articles:", ps5.map(i => i.title));
}
run();
