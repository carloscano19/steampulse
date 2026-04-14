const Parser = require('rss-parser');
const parser = new Parser({
  customFields: {
    item: [
      ['media:content', 'media'],
      ['media:thumbnail', 'thumbnail'],
      ['enclosure', 'enclosure'],
      ['content:encoded', 'contentFull'],
      ['description', 'description']
    ],
  }
});

async function run() {
  const query = encodeURIComponent(`"The Last of Us Parte II" (guía OR paso a paso OR trucos OR secretos OR walkthrough)`);
  const url = `https://news.google.com/rss/search?q=${query}&hl=es&gl=ES&ceid=ES:es`;
  const res = await fetch(url);
  const text = await res.text();
  const feed = await parser.parseString(text);
  console.log(JSON.stringify(feed.items.slice(0, 2), null, 2));
}

run();
