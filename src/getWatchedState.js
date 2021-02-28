/* eslint-disable no-param-reassign */
import onChange from 'on-change';

const renderFeeds = (feedsWrapper, feeds, i18nInstance) => {
  feedsWrapper.innerHTML = '';

  const header = document.createElement('h2');
  header.textContent = i18nInstance.t('feeds');
  feedsWrapper.append(header);

  const ul = document.createElement('ul');
  ul.className = 'list-group mb-5 feeds';

  feeds.forEach((feed) => {
    const li = document.createElement('li');
    li.className = 'list-group-item';
    const h3 = document.createElement('h3');
    h3.textContent = feed.title;
    const p = document.createElement('p');
    p.textContent = feed.description;
    li.append(h3);
    li.append(p);
    ul.prepend(li);
  });

  feedsWrapper.append(ul);
};

const renderPosts = (postsWrapper, posts, viewedPosts, i18nInstance) => {
  postsWrapper.innerHTML = '';

  const header = document.createElement('h3');
  header.textContent = i18nInstance.t('posts');
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
    link.setAttribute('role', 'link');
    link.setAttribute('data-id', post.id);
    link.setAttribute('target', '_blank');
    link.setAttribute('rel', 'noopener noreferrer');
    link.textContent = post.title;

    const button = document.createElement('button');
    button.setAttribute('role', 'button');
    button.setAttribute('type', 'button');
    button.setAttribute('class', 'btn btn-primary btn-sm');
    button.setAttribute('data-id', post.id);
    button.setAttribute('data-toggle', 'modal');
    button.setAttribute('data-target', '#modal');
    button.textContent = i18nInstance.t('openModalBtn');
    li.append(link);
    li.append(button);
    ul.prepend(li);
  });

  postsWrapper.append(ul);
};

const updateModal = (modal, post) => {
  modal.body.textContent = post.description;
  modal.link.setAttribute('href', post.link);
  modal.header.textContent = post.title;
};

const renderErrorFeedback = (feedbackWrapper, errorKey, i18nInstance) => {
  feedbackWrapper.innerHTML = '';
  feedbackWrapper.classList.remove('text-danger', 'text-success');

  if (errorKey) {
    feedbackWrapper.innerHTML = i18nInstance.t(`errors.${errorKey}`);
    feedbackWrapper.classList.add('text-danger');
  }
};

const renderSuccessFeedback = (feedbackWrapper, i18nInstance) => {
  feedbackWrapper.innerHTML = i18nInstance.t('successFeedback');
  feedbackWrapper.classList.remove('text-danger', 'text-success');
  feedbackWrapper.classList.add('text-success');
};

function getWatchedState(state, i18nInstance) {
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
        renderSuccessFeedback(feedbackWrapper, i18nInstance);
        fields.url.value = '';
        break;
      default:
        throw new Error(`Unknown state: ${processState}`);
    }
  };

  const watchedState = onChange(state, (path, current) => {
    switch (path) {
      case 'form.error':
        renderErrorFeedback(feedbackWrapper, current, i18nInstance);
        break;
      case 'form.processError':
        renderErrorFeedback(feedbackWrapper, current, i18nInstance);
        break;
      case 'form.processState':
        processStateHandler(current);
        break;
      case 'feeds':
        renderFeeds(feedsWrapper, current, i18nInstance);
        break;
      case 'posts':
        renderPosts(postsWrapper, current, state.uiState.viewedPosts, i18nInstance);
        break;
      case 'uiState.viewedPosts':
        renderPosts(postsWrapper, state.posts, current, i18nInstance);
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
