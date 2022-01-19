import axios from 'axios';
import { uniqueId } from 'lodash';
import domParser from './domParser';

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
