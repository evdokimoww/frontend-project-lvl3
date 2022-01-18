import axios from 'axios';
import { uniqueId } from 'lodash';
import domParser from './domParser';

export default (watchedState, feeds) => {
  console.log('update');
  feeds.forEach((feed) => {
    axios.get(`https://hexlet-allorigins.herokuapp.com/get?disableCache=true&url=${encodeURIComponent(feed.url)}`)
      .then((res) => {
        const data = domParser(res.data.contents);

        const feedItems = data.items.map(({ itemTitle, itemLink, itemDesc }) => ({
          id: uniqueId(),
          feedId: feed.id,
          title: itemTitle,
          description: itemDesc,
          link: itemLink,
        }));
        watchedState.updatedItems.unshift(...feedItems);
      })
      .catch((e) => e);
  });
};
