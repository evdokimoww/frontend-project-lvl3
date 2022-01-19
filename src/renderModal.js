export default (inboxId, posts) => {
  const modalPost = posts.filter(({ id }) => id === inboxId)[0];
  const modal = document.querySelector('#modal');

  const modalTitle = modal.querySelector('.modal-title');
  modalTitle.innerHTML = modalPost.title;

  const modalBody = modal.querySelector('.modal-body');
  modalBody.innerHTML = modalPost.description;

  const articleLinkButton = modal.querySelector('.full-article');
  articleLinkButton.setAttribute('href', modalPost.link);
};
