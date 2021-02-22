/* eslint-disable no-param-reassign */
import i18n from 'i18next';
import onChange from 'on-change';

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

    const link = document.createElement('a');
    link.setAttribute('href', post.link);
    link.setAttribute('class', linkClass);
    link.setAttribute('data-id', post.id);
    link.setAttribute('target', '_blank');
    link.setAttribute('rel', 'noopener noreferrer');
    link.textContent = post.title;

    const button = document.createElement('button');
    button.setAttribute('aria-label', 'preview');
    button.setAttribute('type', 'button');
    button.setAttribute('class', 'btn btn-primary btn-sm');
    button.setAttribute('data-id', post.id);
    button.setAttribute('data-toggle', 'modal');
    button.setAttribute('data-target', '#modal');
    button.textContent = 'Preview';
    li.append(link);
    li.append(button);
    ul.prepend(li);
  });

  postsWrapper.append(ul);
};

const updateModal = (modal, post) => {
  modal.body.innerHTML = post.description;
  modal.link.setAttribute('href', post.link);
  modal.header.innerHTML = post.title;
};

const renderErrorFeedback = (feedbackWrapper, error) => {
  feedbackWrapper.innerHTML = '';
  feedbackWrapper.classList.remove('text-danger', 'text-success');

  if (error) {
    feedbackWrapper.innerHTML = error;
    feedbackWrapper.classList.add('text-danger');
  }
};

const renderFieldsErrors = (fields, errors, feedbackWrapper) => {
  Object.entries(fields).forEach(([name]) => {
    const error = errors[name];
    if (error) {
      renderErrorFeedback(feedbackWrapper, error.message);
    }
  });
};

const renderSuccessFeedback = (feedbackWrapper) => {
  feedbackWrapper.innerHTML = i18n.t('successFeedback');
  feedbackWrapper.classList.remove('text-danger', 'text-success');
  feedbackWrapper.classList.add('text-success');
};

function getWatchedState(state) {
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
        fields.url.removeAttribute('readonly');
        break;
      case 'filling':
        submitButton.disabled = false;
        fields.url.removeAttribute('readonly');
        break;
      case 'processing':
        submitButton.disabled = true;
        fields.url.setAttribute('readonly', 'true');
        break;
      case 'finished':
        submitButton.disabled = false;
        fields.url.removeAttribute('readonly');
        renderSuccessFeedback(feedbackWrapper);
        fields.url.value = '';
        break;
      default:
        throw new Error(`Unknown state: ${processState}`);
    }
  };

  const watchedState = onChange(state, (path, current) => {
    switch (path) {
      case 'form.errors':
        renderFieldsErrors(fields, current, feedbackWrapper);
        break;
      case 'form.processError':
        renderErrorFeedback(feedbackWrapper, current);
        break;
      case 'form.processState':
        processStateHandler(current);
        break;
      case 'feeds':
        renderFeeds(feedsWrapper, current);
        break;
      case 'posts':
        renderPosts(postsWrapper, current, state.uiState.viewedPosts);
        break;
      case 'uiState.viewedPosts':
        renderPosts(postsWrapper, state.posts, current);
        break;
      case 'uiState.modalPostId':
        updateModal(modal, state.posts.find((post) => post.id === current));
        break;
      default:
        break;
    }
  });
  return watchedState;
}

export default getWatchedState;
