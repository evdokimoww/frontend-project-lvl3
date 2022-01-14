import * as yup from 'yup';
import onChange from 'on-change';
import renderMessage from './validateWatchers';

const schema = yup.object().shape({
  url: yup.string().url().required(),
});

const validation = (obj) => (
  schema.validate(obj)
    .then((data) => data)
    .catch((e) => e.message));

export default () => {
  const state = {
    processState: 'filling',
    urls: [],
    message: '',

  };

  const form = document.querySelector('form');

  const watchedState = onChange(state, (path, value) => {
    switch (path) {
      case 'message':
        renderMessage(state, value, form);
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
          watchedState.message = 'duplicate url';
        } else {
          watchedState.message = 'success adding';
          watchedState.urls.push(data.url);
        }
      });
  });
};
