import axios from 'axios';
import { uniqueId, differenceWith, isEqual } from 'lodash';
import domParser from './domParser';

const updateRss = (watchedState, state) => {
  const { feeds, items } = state;
  const promises = feeds.reverse().map((feed) => axios
    .get(`https://hexlet-allorigins.herokuapp.com/get?disableCache=true&url=${encodeURIComponent(feed.url)}`)
    .then((res) => {
      const data = domParser(res.data.contents);

      const feedItems = data.items.map(({ title, link, description }) => ({
        id: uniqueId(),
        feedId: feed.id,
        title,
        link,
        description,
      }));

      const oldItemsLinks = items
        .filter((item) => item.feedId === feed.id)
        .map(({ link }) => link);

      const newItemsLinks = feedItems.map(({ link }) => link);

      const differentItemsLinks = differenceWith(newItemsLinks, oldItemsLinks, isEqual);
      const differentItems = feedItems.filter(({ link }) => differentItemsLinks.includes(link));

      watchedState.items.unshift(...differentItems);
    })
    .catch((e) => e));

  return Promise.all(promises);
};

export default updateRss;
