import axios from 'axios';
import { uniqueId } from 'lodash';
import domParser from './domParser';

export default (watchedState, url) => {
  axios.get(`https://hexlet-allorigins.herokuapp.com/get?disableCache=true&url=${encodeURIComponent(url)}`)
    .then((res) => {
      const data = domParser(res.data.contents);

      const feedId = uniqueId();
      watchedState.feeds.push({
        id: feedId,
        title: data.channelTitle,
        description: data.channelDescription,
        url,
      });

      const feedItems = data.items.map(({ title, link, description }) => ({
        id: uniqueId(),
        feedId,
        title,
        link,
        description,
      }));

      watchedState.items.unshift(...feedItems);
    })
    .catch((e) => {
      watchedState.message = e.message;
    });
};
