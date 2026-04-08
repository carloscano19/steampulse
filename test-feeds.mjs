import Parser from "rss-parser";

const parser = new Parser({
  customFields: {
    item: [
      ['media:content', 'media'],
      ['media:thumbnail', 'thumbnail'],
      ['enclosure', 'enclosure'],
      ['content:encoded', 'contentFull'],
    ],
  }
});

async function test() {
  const feeds = [
    "https://es.ign.com/feed.xml",
    "https://vandal.elespanol.com/xml.cgi",
    "https://www.eurogamer.es/feed/news",
    "https://www.hobbyconsolas.com/rss"
  ];

  for (const url of feeds) {
    try {
      const feed = await parser.parseURL(url);
      const first = feed.items[0];
      const title = first.title;
      let img = "";
      if (first.media && first.media["$"]?.url) img = first.media["$"].url;
      else if (first.enclosure?.url) img = first.enclosure.url;
      else if (first.thumbnail && first.thumbnail["$"]?.url) img = first.thumbnail["$"].url;
      else if (first.contentFull || first.content) {
        const match = (first.contentFull || first.content).match(/<img[^>]+src="([^">]+)"/);
        if (match) img = match[1];
      }

      console.log(`[OK] ${new URL(url).hostname}: ${feed.items.length} items`);
      console.log(`     Sample Title: ${title}`);
      console.log(`     Sample Img: ${img || "NONE"}`);
    } catch(e) {
      console.log(`[FAILED] ${url} -> ${e.message}`);
    }
  }
}
test();
