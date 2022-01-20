const renderMessage = (state, value, form, i18nInstance) => {
  const p = form.querySelector('.feedback');
  const input = form.querySelector('input');

  switch (value) {
    case 'SuccessAdding':
      input.classList.remove('is-invalid');
      p.classList.remove('text-danger');
      p.classList.add('text-success');
      p.textContent = i18nInstance.t(`messages.${value}`);
      form.reset();
      input.focus();
      break;

    case 'ValidationError':
    case 'NoValidRss':
    case 'DuplicateUrl':
    case 'NotBeEmpty':
    case 'Network Error':
      input.classList.add('is-invalid');
      p.classList.remove('text-success');
      p.classList.add('text-danger');
      p.textContent = i18nInstance.t(`messages.${value}`);
      break;

    default:
      throw new Error();
  }
  form.append(p);
};

export default renderMessage;
