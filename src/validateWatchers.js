const renderMessage = (state, value, form) => {
  const p = form.querySelector('.feedback');
  const input = form.querySelector('input');

  switch (value) {
    case 'success adding':
      input.classList.remove('is-invalid');
      p.classList.remove('text-danger');
      p.classList.add('text-success');
      p.textContent = 'RSS успешно загружен';
      form.reset();
      input.focus();
      break;

    case 'url must be a valid URL':
      input.classList.add('is-invalid');
      p.classList.remove('text-success');
      p.classList.add('text-danger');
      p.textContent = 'Ссылка должна быть валидным URL';
      break;

    case 'duplicate url':
      input.classList.add('is-invalid');
      p.classList.remove('text-success');
      p.classList.add('text-danger');
      p.textContent = 'RSS уже существует';
      break;

    default:
      throw new Error();
  }
  form.append(p);
};

export default renderMessage;
