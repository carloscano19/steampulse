import Parser from "rss-parser";

const parser = new Parser();
const gameName = "Crimson Desert";
const query = encodeURIComponent(`site:youtube.com "${gameName}" review español`);
const url = `https://news.google.com/rss/search?q=${query}&hl=es&gl=ES&ceid=ES:es`;

(async () => {
  try {
    const res = await fetch(url);
    const xml = await res.text();
    const feed = await parser.parseString(xml);
    console.log("Found", feed.items.length, "YouTube videos for", gameName);
    feed.items.slice(0, 3).forEach((item, i) => {
      console.log(`${i+1}. ${item.title}`);
      console.log(`   Link: ${item.link}`);
      // Try to extract video ID from link
      const vidMatch = item.link?.match(/v=([^&]+)/);
      if (vidMatch) console.log(`   Video ID: ${vidMatch[1]}`);
    });
  } catch (e) {
    console.log("Error:", e);
  }
})();
