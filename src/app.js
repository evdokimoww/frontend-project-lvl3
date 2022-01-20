import * as yup from 'yup';
import onChange from 'on-change';
import renderMessage from './validateWatchers';
import ru from './locales/ru';
import downloadRss from './downloadRss';
import renderFeeds from './renderFeeds';
import renderItems from './renderItems';
import updateRss from './updateRss';
import renderModal from './renderModal';
import markRead from './markRead';

const checkDuplicate = (state, inboxUrl) => {
  const duplicate = state.feeds.filter(({ url }) => url === inboxUrl);
  return duplicate.length > 0;
};

const schema = yup.object().shape({
  url: yup.string().url().min(1),
});

const validation = (obj) => (
  schema.validate(obj)
    .then((data) => data)
    .catch((e) => e.message));

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
    inboxUrl: '',
    feeds: [],
    items: [],
    message: '',
    formDisabled: false,
    modalId: '',
    readPosts: [],
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
        }
        break;

      case 'items':
        renderItems(state.items, i18nInstance);
        Array.from(document.querySelectorAll('button[data-bs-toggle="modal"]'))
          .map((button) => button.addEventListener('click', () => {
            watchedState.modalId = button.dataset.id;
            watchedState.readPosts.push(button.dataset.id);
          }));
        markRead(state.readPosts);
        break;

      case 'updatedItems':
        if (watchedState.items.length <= value.length) {
          watchedState.items = value;
          state.updatedItems = [];
        }
        break;

      case 'feeds':
        watchedState.message = 'SuccessAdding';
        watchedState.inboxUrl = '';
        renderFeeds(state.feeds, i18nInstance);
        break;

      case 'formDisabled':
        input.disabled = value;
        btn.disabled = value;
        break;

      case 'modalId':
        renderModal(value, state.items);
        break;

      case 'readPosts':
        markRead(value);
        break;

      default:
        throw new Error('watchedState error');
    }
  });

  let timerId = setTimeout(function update() {
    updateRss(watchedState, state.feeds, state.items);
    timerId = setTimeout(update, 5000);
  }, 5000);

  form.addEventListener('submit', (e) => {
    e.preventDefault();

    const formData = new FormData(e.currentTarget);
    const url = { url: formData.get('url') };

    validation(url)
      .then((data) => {
        if (data === 'url must be a valid URL') {
          watchedState.message = 'ValidationError';
        } else if (data === 'url must be at least 1 characters') {
          watchedState.message = 'NotBeEmpty';
        } else if (checkDuplicate(state, data.url)) {
          watchedState.message = 'DuplicateUrl';
        } else {
          watchedState.inboxUrl = data.url;
          downloadRss(watchedState, data.url, state);
        }
      });
  });
};
