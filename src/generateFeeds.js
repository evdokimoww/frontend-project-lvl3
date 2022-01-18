export default (feeds, i18nInstance) => {
  const container = document.querySelector('.feeds');
  container.innerHTML = '';

  const title = document.createElement('h3');
  title.textContent = i18nInstance.t('blocksTitle.feeds');
  title.classList.add('px-3');
  container.append(title);

  const feedList = document.createElement('ul');
  feedList.classList.add('list-group', 'border-0');

  const feedItems = feeds.map((feed) => {
    const item = document.createElement('li');
    item.classList.add('list-group-item', 'border-0');

    const itemTitle = document.createElement('h4');
    itemTitle.innerHTML = feed.title;
    itemTitle.classList.add('h6');

    const itemDesc = document.createElement('p');
    itemDesc.classList.add('small', 'text-black-50');
    itemDesc.innerHTML = feed.description;

    item.append(itemTitle, itemDesc);

    return item;
  });

  feedList.append(...feedItems.reverse());
  container.append(feedList);
};
