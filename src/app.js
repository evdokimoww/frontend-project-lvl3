import * as yup from 'yup';
import onChange from 'on-change';
import { uniqueId } from 'lodash';
import axios from 'axios';
import renderMessage from './validateWatchers';
import ru from './locales/ru';

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

const downloadRss = (watchedState, url) => {
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
      watchedState.items.push(...feedItems);
    })
    .catch((e) => {
      if (e) {
        // eslint-disable-next-line no-param-reassign
        watchedState.message = 'NoValidRss';
      }
    });
};

const duplicateUrlCheck = (state, inboxUrl) => {
  const duplicate = state.feeds.filter(({ url }) => url === inboxUrl);
  return duplicate.length > 0;
};

const schema = yup.object().shape({
  url: yup.string().url().required(),
});

const validation = (obj) => (
  schema.validate(obj)
    .then((data) => data)
    .catch((e) => e.name));

export default (i18nInstance) => {
  i18nInstance
    .init({
      lng: 'ru',
      debug: false,
      resources: {
        ru,
      },
    })
    .then((t) => t);

  const state = {
    inboxUrl: [],
    feeds: [],
    items: [],
    message: '',
    formDisabled: false,
  };

  const form = document.querySelector('form');
  const btn = form.querySelector('button[type="submit"]');
  const input = form.querySelector('#url-input');

  const watchedState = onChange(state, (path, value) => {
    switch (path) {
      case 'message':
        watchedState.formDisabled = false;
        renderMessage(state, value, form, i18nInstance);
        state.message = '';
        break;

      case 'inboxUrl':
        if (value !== '') {
          watchedState.formDisabled = true;
          downloadRss(watchedState, value);
        }
        break;

      case 'feeds':
        console.log(state);
        watchedState.message = 'SuccessAdding';
        watchedState.inboxUrl = '';
        break;

      case 'formDisabled':
        input.disabled = value;
        btn.disabled = value;
        break;

      case 'items':
        break;

      default:
        throw new Error('watchedState error');
    }
  });

  form.addEventListener('submit', (e) => {
    e.preventDefault();

    const formData = new FormData(e.currentTarget);
    const url = { url: formData.get('url') };

    validation(url)
      .then((data) => {
        if (typeof data === 'string') {
          watchedState.message = data;
        } else if (duplicateUrlCheck(state, data.url)) {
          watchedState.message = 'DuplicateUrl';
        } else {
          watchedState.inboxUrl = data.url;
        }
      });
  });
};
