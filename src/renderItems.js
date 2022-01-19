export default (posts, i18nInstance) => {
  const container = document.querySelector('.posts');
  container.innerHTML = '';

  const title = document.createElement('h3');
  title.textContent = i18nInstance.t('blocksTitle.posts');
  title.classList.add('px-3');
  container.append(title);

  const postList = document.createElement('ul');
  postList.classList.add('list-group', 'border-0');

  const postItems = posts.map((post) => {
    const item = document.createElement('li');
    item.classList.add(
      'list-group-item',
      'border-0',
      'd-flex',
      'justify-content-between',
      'align-items-start',
    );

    const link = document.createElement('a');
    link.classList.add('fw-bold');
    link.setAttribute('href', post.link);
    link.setAttribute('target', '_blank');
    link.setAttribute('data-id', post.id);
    link.innerHTML = post.title;

    const button = document.createElement('button');
    button.classList.add('btn', 'btn-outline-primary', 'btn-sm');
    button.innerHTML = i18nInstance.t('buttons.view');
    button.setAttribute('type', 'button');
    button.setAttribute('data-bs-toggle', 'modal');
    button.setAttribute('data-bs-target', '#modal');
    button.setAttribute('data-id', post.id);

    item.append(link, button);

    return item;
  });

  postList.append(...postItems);
  container.append(postList);
};
