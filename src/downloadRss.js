import axios from 'axios';
import { uniqueId } from 'lodash';

const domParser = (string) => {
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

export default (watchedState, url) => {
  axios.get(`https://hexlet-allorigins.herokuapp.com/get?disableCache=true&url=${encodeURIComponent(url)}`)
    .then((res) => {
      const data = domParser(res.data.contents);

      if (data === 'no rss') {
        throw new Error('NO RSS');
      }

      const feedId = uniqueId();
      watchedState.feeds.push({
        id: feedId,
        title: data.title,
        description: data.desc,
        url,
      });

      const feedItems = data.items.map(({ itemTitle, itemLink, itemDesc }) => ({
        id: uniqueId(),
        feedId,
        title: itemTitle,
        description: itemDesc,
        link: itemLink,
      }));
      watchedState.items.unshift(...feedItems);
    })
    .catch((e) => {
      if (e) {
        watchedState.message = 'NoValidRss';
      }
    });
};
