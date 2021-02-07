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

const renderPosts = (postsWrapper, posts) => {
  postsWrapper.innerHTML = '';

  const header = document.createElement('h3');
  header.textContent = i18n.t('posts');
  postsWrapper.append(header);

  const ul = document.createElement('ul');
  ul.className = 'list-group mb-5 feeds';

  posts.forEach((post) => {
    const li = document.createElement('li');
    li.className = 'list-group-item d-flex justify-content-between align-items-start';
    li.innerHTML = `
        <a
          href="${post.link}"
          class="font-weight-bold"
          data-id="${post.id}"
          target="_blank"
          rel="noopener noreferrer">
            ${post.title}
        </a>
      `;
    ul.prepend(li);
  });

  postsWrapper.append(ul);
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

function View(rootEl) {
  const fields = {
    url: rootEl.querySelector('#main-form input[name="url"]'),
  };
  const feedbackWrapper = rootEl.querySelector('.feedback');
  const submitButton = rootEl.querySelector('button[type="submit"]');
  const feedsWrapper = rootEl.querySelector('.feeds');
  const postsWrapper = rootEl.querySelector('.posts');

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

  this.onChange = (path, current) => {
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
        renderPosts(postsWrapper, current);
        break;
      default:
        break;
    }
  };
}

export default View;
