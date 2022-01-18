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
    item.classList.add('list-group-item', 'border-0');

    const link = document.createElement('a');
    link.classList.add('fw-bold');
    link.setAttribute('href', post.link);
    link.setAttribute('target', '_blank');
    link.innerHTML = post.title;

    item.append(link);

    return item;
  });

  postList.append(...postItems);
  container.append(postList);
};
