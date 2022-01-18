export default (string) => {
  const parse = new DOMParser();
  const doc = parse.parseFromString(string, 'text/xml');
  const rss = doc.querySelector('rss');

  if (!rss) return 'no rss';

  const title = rss.querySelector('channel title').textContent;
  const desc = rss.querySelector('channel description').textContent;
  const items = rss.querySelectorAll('channel item');

  const parsedItems = Array.from(items).map((item) => {
    const itemTitle = item.querySelector('title').textContent;
    const itemLink = item.querySelector('link').textContent;
    const itemDesc = item.querySelector('description').textContent;
    return { itemTitle, itemLink, itemDesc };
  });

  return { title, desc, items: parsedItems };
};
