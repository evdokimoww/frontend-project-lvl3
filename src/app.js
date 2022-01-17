import * as yup from 'yup';
import onChange from 'on-change';
import renderMessage from './validateWatchers';
import ru from './locales/ru';

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
    processState: 'filling',
    urls: [],
    message: '',
  };

  const form = document.querySelector('form');

  const watchedState = onChange(state, (path, value) => {
    switch (path) {
      case 'message':
        renderMessage(state, value, form, i18nInstance);
        state.message = '';
        break;

      case 'urls':
        console.log(value);
        break;

      default:
        throw new Error();
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
        } else if (state.urls.includes(data.url)) {
          watchedState.message = 'DuplicateUrl';
        } else {
          watchedState.message = 'SuccessAdding';
          watchedState.urls.push(data.url);
        }
      });
  });
};
