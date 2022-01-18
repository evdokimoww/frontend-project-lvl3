import * as yup from 'yup';
import onChange from 'on-change';
import renderMessage from './validateWatchers';
import ru from './locales/ru';
import downloadRss from './downloadRss';
import generateFeeds from './generateFeeds';
import generateItems from './generateItems';

const checkDuplicate = (state, inboxUrl) => {
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
      debug: true,
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
        watchedState.message = 'SuccessAdding';
        watchedState.inboxUrl = '';
        generateFeeds(state.feeds, i18nInstance);
        break;

      case 'formDisabled':
        input.disabled = value;
        btn.disabled = value;
        break;

      case 'items':
        generateItems(state.items, i18nInstance);
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
        } else if (checkDuplicate(state, data.url)) {
          watchedState.message = 'DuplicateUrl';
        } else {
          watchedState.inboxUrl = data.url;
        }
      });
  });
};
