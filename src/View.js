import i18n from 'i18next';

const renderFieldsErrors = (fields, errors) => {
  Object.entries(fields).forEach(([name, element]) => {
    const errorElement = element.nextElementSibling;
    const error = errors[name];
    if (errorElement) {
      element.classList.remove('is-invalid');
      errorElement.remove();
    }
    if (!error) {
      return;
    }
    const feedbackElement = document.createElement('div');
    feedbackElement.classList.add('invalid-feedback');
    feedbackElement.innerHTML = error.message;
    element.classList.add('is-invalid');
    element.after(feedbackElement);
  });
};

const renderFeeds = (feedsWrapper, feeds) => {
  feedsWrapper.innerHTML = '';

  const header = document.createElement('h2');
  header.textContent = i18n.t('feeds');
  feedsWrapper.append(header);

  const ul = document.createElement('ul');
  ul.className = 'list-group mb-5 feeds';

  feeds.forEach((feed) => {
    const li = document.createElement('li');
    li.className = 'list-group-item';
    li.innerHTML = `
        <h3>${feed.title}</h3>
        <p>${feed.description}</p>
      `;
    ul.prepend(li);
  });

  feedsWrapper.append(ul);
};

const renderPosts = (postsWrapper, posts, viewedPosts) => {
  postsWrapper.innerHTML = '';

  const header = document.createElement('h3');
  header.textContent = i18n.t('posts');
  postsWrapper.append(header);

  const ul = document.createElement('ul');
  ul.className = 'list-group mb-5 feeds';

  posts.forEach((post) => {
    const li = document.createElement('li');
    li.className = 'list-group-item d-flex justify-content-between align-items-start';
    const linkClass = viewedPosts.includes(post.id) ? 'font-weight-normal' : 'font-weight-bold';
    li.innerHTML = `
        <a
          href="${post.link}"
          class="${linkClass}"
          data-id="${post.id}"
          target="_blank"
          rel="noopener noreferrer">
            ${post.title}
        </a>
        <button type="button" class="btn btn-primary btn-sm" data-id="${post.id}" data-toggle="modal" data-target="#modal">Preview</button>
      `;
    ul.prepend(li);
  });

  postsWrapper.append(ul);
};

const updateModal = (modal, post) => {
  modal.body.innerHTML = post.description;
  modal.link.setAttribute('href', post.link);
  modal.header.innerHTML = post.title;
};

const renderProcessError = (feedbackWrapper, error) => {
  feedbackWrapper.innerHTML = '';
  feedbackWrapper.classList.remove('text-danger', 'text-success');

  if (error) {
    feedbackWrapper.innerHTML = error;
    feedbackWrapper.classList.add('text-danger');
  }
};

const renderSuccessFeedback = (feedbackWrapper) => {
  feedbackWrapper.innerHTML = i18n.t('successFeedback');
  feedbackWrapper.classList.remove('text-danger', 'text-success');
  feedbackWrapper.classList.add('text-success');
};

function handleStateChange() {
  const fields = {
    url: document.querySelector('#main-form input[name="url"]'),
  };
  const feedbackWrapper = document.querySelector('.feedback');
  const submitButton = document.querySelector('button[type="submit"]');
  const feedsWrapper = document.querySelector('.feeds');
  const postsWrapper = document.querySelector('.posts');
  const modal = {
    body: document.querySelector('.modal-body'),
    link: document.querySelector('.modal-footer a'),
    header: document.querySelector('.modal-title'),
  };

  const processStateHandler = (processState) => {
    switch (processState) {
      case 'failed':
        submitButton.disabled = false;
        break;
      case 'filling':
        submitButton.disabled = false;
        break;
      case 'processing':
        submitButton.disabled = true;
        break;
      case 'finished':
        submitButton.disabled = false;
        renderSuccessFeedback(feedbackWrapper);
        fields.url.setAttribute('value', '');
        break;
      default:
        throw new Error(`Unknown state: ${processState}`);
    }
  };

  return function handleChange(path, current) {
    switch (path) {
      case 'form.errors':
        renderFieldsErrors(fields, current);
        break;
      case 'form.processError':
        renderProcessError(feedbackWrapper, current);
        break;
      case 'form.processState':
        processStateHandler(current);
        break;
      case 'feeds':
        renderFeeds(feedsWrapper, current);
        break;
      case 'posts':
        renderPosts(postsWrapper, current, this.uiState.viewedPosts);
        break;
      case 'uiState.viewedPosts':
        renderPosts(postsWrapper, this.posts, current);
        break;
      case 'uiState.modalPostId':
        updateModal(modal, this.posts.find((post) => post.id === current));
        break;
      default:
        break;
    }
  };
}

export default handleStateChange;
