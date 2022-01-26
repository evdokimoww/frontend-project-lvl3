import * as yup from 'yup';
import onChange from 'on-change';
import i18next from 'i18next';
import ru from './locales/ru';

import {
  renderFeeds,
  renderItems,
  renderModal,
  renderMessage,
  markRead,
} from './render';
import { updateRss, downloadRss } from './rss';

const checkDuplicate = (state, inboxUrl) => {
  const duplicate = state.feeds.filter(({ url }) => url === inboxUrl);
  return duplicate.length > 0;
};

const schema = yup.object().shape({
  url: yup.string().min(1).url(),
});

const validation = (obj) => (
  schema.validate(obj)
    .then((data) => data)
    .catch((e) => e.message));

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
        renderItems(watchedState, state.items, i18nInstance);
        modalAction(watchedState);
        break;

      case 'updated':
        renderItems(watchedState, state.items, i18nInstance);
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

    validation(url)
      .then((data) => {
        if (data === 'url must be a valid URL') {
          watchedState.message = 'ValidationError';
          watchedState.process = 'error';
        } else if (data === 'url must be at least 1 characters') {
          watchedState.message = 'NotBeEmpty';
          watchedState.process = 'error';
        } else if (checkDuplicate(state, data.url)) {
          watchedState.message = 'DuplicateUrl';
          watchedState.process = 'error';
        } else {
          watchedState.process = 'loading';
          downloadRss(watchedState, data.url)
            .then(() => {
              watchedState.message = 'SuccessAdding';
              watchedState.process = 'successfully';
            })
            .catch((err) => {
              watchedState.message = err.message;
              watchedState.process = 'error';
            });
        }
      });
  });
};
