import difference from 'lodash/difference';

function View(rootEl) {
  const fields = {
    url: rootEl.querySelector('#main-form input[name="url"]'),
  };
  const feedback = rootEl.querySelector('.feedback');
  const submitButton = rootEl.querySelector('button[type="submit"]');
  const feedsWrapper = rootEl.querySelector('.feeds');
  const postsWrapper = rootEl.querySelector('.posts');

  const renderFieldsErrors = (errors) => {
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

  const renderProcessError = (error) => {
    feedback.innerHTML = '';
    feedback.classList.remove('text-danger');

    if (error) {
      feedback.innerHTML = error;
      feedback.classList.add('text-danger');
    }
  };

  const renderSuccessFeedback = () => {
    feedback.innerHTML = 'RSS успешно добавлен';
    feedback.classList.remove('text-danger');
    feedback.classList.add('text-success');
  };

  const renderFeeds = (feeds) => {
    feedsWrapper.innerHTML = '';

    const header = document.createElement('h2');
    header.textContent = 'Feeds';
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

  const renderPosts = (posts) => {
    postsWrapper.innerHTML = '';

    const header = document.createElement('h2');
    header.textContent = 'Posts';
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
        renderSuccessFeedback();
        fields.url.setAttribute('value', '');
        break;
      default:
        throw new Error(`Unknown state: ${processState}`);
    }
  };

  this.onChange = (path, current, previous) => {
    switch (path) {
      case 'form.errors':
        renderFieldsErrors(current);
        break;
      case 'form.processError':
        renderProcessError(current);
        break;
      case 'form.processState':
        processStateHandler(current);
        break;
      case 'feeds':
        renderFeeds(difference(current, previous));
        break;
      case 'posts':
        renderPosts(difference(current, previous));
        break;
      default:
        break;
    }
  };
}

export default View;
