import * as yup from 'yup';
import onChange from 'on-change';
import i18next from 'i18next';
import { setLocale, string } from 'yup';
import ru from './locales/ru';

import {
  renderFeeds,
  renderItems,
  renderModal,
  renderMessage,
  markRead,
} from './render';
import { updateRss, downloadRss } from './rss';

const validation = (url, feeds) => {
  setLocale({
    string: {
      min: 'NotBeEmpty',
      url: 'ValidationError',
    },
    mixed: {
      notOneOf: 'DuplicateUrl',
    },
  });

  const schema = yup.object({
    url: string().min(1).url().notOneOf(feeds),
  });

  return schema.validate(url)
    .then((data) => data)
    .catch((e) => e);
};

export default () => {
  const i18nInstance = i18next.createInstance();

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
    inboxUrl: '',
    feeds: [],
    items: [],
    message: '',
    isFormValid: false,
    modalId: '',
    readPosts: [],
    process: 'filling',
    messageType: '',
  };

  const form = document.querySelector('.rss-form');
  const btn = form.querySelector('button[type="submit"]');
  const input = form.querySelector('#url-input');

  const modalAction = (watchedState) => Array
    .from(document.querySelectorAll('button[data-bs-toggle="modal"]'))
    .map((button) => button.addEventListener('click', () => {
      watchedState.modalId = button.dataset.id;
      watchedState.readPosts.push(button.dataset.id);
      watchedState.process = 'modal';
    }));

  const watchedState = onChange(state, (path, value) => {
    switch (state.process) {
      case 'filling':
        input.removeAttribute('readonly');
        btn.disabled = false;
        break;

      case 'successfully':
        renderMessage(state, form, i18nInstance);

        input.removeAttribute('readonly');
        btn.disabled = false;

        renderFeeds(state.feeds, i18nInstance);
        renderItems(state.items, i18nInstance);
        modalAction(watchedState);
        break;

      case 'updated':
        renderItems(state.items, i18nInstance);
        modalAction(watchedState);
        break;

      case 'loading':
        input.setAttribute('readonly', true);
        btn.disabled = true;
        break;

      case 'error':
        renderMessage(state, form, i18nInstance);
        input.removeAttribute('readonly');
        btn.disabled = false;
        break;

      case 'modal':
        renderModal(state.modalId, state.items);
        markRead(state.readPosts);
        break;

      default:
        throw new Error(value);
    }
  });

  const update = () => updateRss(watchedState, state)
    .then(() => {
      setTimeout(update, 5000);
    })
    .catch((e) => console.log('Update RSS error!', e));

  update();

  form.addEventListener('submit', (e) => {
    e.preventDefault();

    const formData = new FormData(e.currentTarget);
    const url = { url: formData.get('url') };
    const feedsUrls = state.feeds.map((feed) => feed.url);

    validation(url, feedsUrls)
      .then((data) => {
        if (data.url) {
          watchedState.process = 'loading';
          downloadRss(watchedState, data.url)
            .then(() => {
              watchedState.message = 'SuccessAdding';
              watchedState.messageType = 'success';
              watchedState.process = 'successfully';
            })
            .catch((err) => {
              watchedState.message = err.message;
              watchedState.messageType = 'error';
              watchedState.process = 'error';
            });
        } else {
          watchedState.message = data.message;
          watchedState.messageType = 'error';
          watchedState.process = 'error';
        }
      });
  });
};
