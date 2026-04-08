import Parser from "rss-parser";

const parser = new Parser();
const gameName = "Crimson Desert";
const query = encodeURIComponent(`site:youtube.com "${gameName}" review español`);
const url = `https://news.google.com/rss/search?q=${query}&hl=es&gl=ES&ceid=ES:es`;

(async () => {
  try {
    const res = await fetch(url);
    const xml = await res.text();
    // console.log("XML excerpt:", xml.slice(0, 500));
    const feed = await parser.parseString(xml);
    console.log("Found", feed.items.length, "items.");
    feed.items.slice(0, 5).forEach((item, i) => {
      console.log(`${i+1}. ${item.title}`);
      console.log(`   Link: ${item.link}`);
      
      // Look for video ID in the decoded link if possible
      // Feed links are usually google news redirects, we might have to treat them.
    });
  } catch (e) {
    console.error("Error:", e);
  }
})();
