import axios from 'axios';
import { uniqueId } from 'lodash';
import domParser from './domParser';

const updateRss = (watchedState, feeds, items) => {
  feeds.reverse().forEach((feed) => {
    console.log('update');
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

        const lastItemUrl = items.filter((item) => item.feedId === feed.id)[0].link;

        const last = feedItems.find((item) => item.link === lastItemUrl);
        const index = feedItems.indexOf(last);

        if (index > 0) {
          const newItems = feedItems.slice(0, index);
          watchedState.items.unshift(...newItems);
        }
      })
      .catch((e) => e);
  });
};

export default updateRss;
