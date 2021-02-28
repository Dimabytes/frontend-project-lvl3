import * as yup from 'yup';
import isEqual from 'lodash/isEqual';
import differenceWith from 'lodash/differenceWith';
import omit from 'lodash/omit';
import axios from 'axios';
import { v4 as uuidv4 } from 'uuid';
import $ from 'jquery';
import getWatchedState from './getWatchedState.js';
import parseRss from './rss.js';

const routes = {
  proxy: (targetUrl) => {
    const proxyUrl = new URL('/get', 'https://hexlet-allorigins.herokuapp.com');
    proxyUrl.searchParams.set('disableCache', 'true');
    proxyUrl.searchParams.set('url', targetUrl);
    return proxyUrl.toString();
  },
};

const validate = (fields, schema) => {
  try {
    schema.validateSync(fields, { abortEarly: false });
    return null;
  } catch (e) {
    return e.message.key;
  }
};
const createApp = (i18nInstance) => {
  const defaultState = {
    form: {
      processState: 'filling',
      processError: null,
      fields: {
        url: '',
      },
      errors: {},
      isValid: true,
    },
    feeds: [],
    posts: [],
    uiState: {
      modalPostId: null,
      viewedPosts: [],
    },
  };

  const elements = {
    form: document.querySelector('#main-form'),
  };

  const watchedState = getWatchedState(defaultState, i18nInstance);

  const addNewFeed = (feed, rssUrl) => {
    watchedState.feeds.push({
      ...feed,
      rssUrl,
      id: uuidv4(),
    });
  };

  const addNewPosts = (posts) => {
    posts.forEach((post) => {
      watchedState.posts.push({
        ...post,
        id: uuidv4(),
      });
    });
  };

  const setProcessError = (errorKey) => {
    watchedState.form.processError = errorKey;
    watchedState.form.processState = 'failed';
  };

  const handleFirstFeedResponse = (res, rssUrl) => {
    try {
      const { feed, posts } = parseRss(res.data.contents);
      addNewFeed(feed, rssUrl);
      addNewPosts(posts);
      watchedState.form.processState = 'finished';
    } catch (e) {
      setProcessError('rssNotFound');
    }
  };

  const getNewPosts = () => {
    const promiseArray = watchedState.feeds.map(({ rssUrl }) => axios
      .get(routes.proxy(rssUrl)).then((res) => {
        const { posts } = parseRss(res.data.contents);

        const oldPosts = watchedState.posts.map((post) => omit(post, 'id'));
        const newPosts = differenceWith(posts, oldPosts, isEqual);
        addNewPosts(newPosts);
      }));

    Promise.allSettled(promiseArray).then(() => {
      setTimeout(getNewPosts, 5000);
    });
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    const formData = Object.fromEntries(new FormData(e.target));
    const feedUrls = watchedState.feeds.map((feed) => feed.rssUrl);
    const schema = yup.string().required().url().notOneOf(feedUrls);
    watchedState.form.error = validate(formData.url, schema);
    watchedState.form.fields = formData;
    watchedState.form.isValid = watchedState.form.error === null;

    if (watchedState.form.isValid) {
      watchedState.form.processState = 'processing';
      axios.get(routes.proxy(formData.url))
        .then((res) => {
          handleFirstFeedResponse(res, formData.url);
        }).catch(() => {
          setProcessError('network');
        });
    }
  };

  const handlePostClick = (e) => {
    const postId = e.target.dataset.id;
    if (!watchedState.uiState.viewedPosts.includes(postId)) {
      watchedState.uiState.viewedPosts.push(postId);
    }
    watchedState.uiState.modalPostId = postId;
  };

  const setControllers = () => {
    elements.form.addEventListener('submit', handleFormSubmit);
    $('.posts').on('click', 'button', handlePostClick);
  };

  return {
    setControllers,
    getNewPosts,
  };
};

export default createApp;
