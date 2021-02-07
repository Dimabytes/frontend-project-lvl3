import * as yup from 'yup';
import keyBy from 'lodash/keyBy';
import isEqual from 'lodash/isEqual';
import differenceWith from 'lodash/differenceWith';
import omit from 'lodash/omit';
import axios from 'axios';
import i18n from 'i18next';
import { v4 as uuidv4 } from 'uuid';
import $ from 'jquery';
import getWatchedState from './getWatchedState';
import { getRssDom, parseFeed, parsePosts } from './rss';

const routes = {
  proxy: (url) => `https://hexlet-allorigins.herokuapp.com/get?url=${url}&disableCache=true`,
};

const validate = (fields, schema) => {
  try {
    schema.validateSync(fields, { abortEarly: false });
    return {};
  } catch (e) {
    return keyBy(e.inner, 'path');
  }
};
const createApp = () => {
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
  const watchedState = getWatchedState(defaultState);
  const schema = yup.object().shape({
    url: yup.string().required().url(),
  });

  const isFeedExists = (url) => watchedState.feeds.some((el) => el.rssUrl === url);

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

  const setProcessError = (errorText) => {
    watchedState.form.processError = errorText;
    watchedState.form.processState = 'failed';
  };

  const handleFirstFeedResponse = (res, rssUrl) => {
    const DOM = getRssDom(res.data.contents);
    if (!DOM) {
      setProcessError(i18n.t('processErrors.rssNotFound'));
      return;
    }
    const feed = parseFeed(DOM);
    const posts = parsePosts(DOM);
    addNewFeed(feed, rssUrl);
    addNewPosts(posts);
    watchedState.form.processState = 'finished';
  };

  const getNewPosts = () => {
    const promiseArray = watchedState.feeds.map(({ rssUrl }) => axios
      .get(routes.proxy(rssUrl)).then((res) => {
        const DOM = getRssDom(res.data.contents);
        const allFeedPosts = parsePosts(DOM);

        const oldPosts = watchedState.posts.map((post) => omit(post, 'id'));
        const newPosts = differenceWith(allFeedPosts, oldPosts, isEqual);
        addNewPosts(newPosts);
      }));

    Promise.allSettled(promiseArray).then(() => {
      setTimeout(getNewPosts, 5000);
    });
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    const formData = Object.fromEntries(new FormData(e.target));
    watchedState.form.errors = validate(formData, schema);
    watchedState.form.fields = formData;
    watchedState.form.isValid = isEqual(watchedState.form.errors, {});

    if (watchedState.form.isValid) {
      if (isFeedExists(formData.url)) {
        setProcessError(i18n.t('processErrors.duplicate'));
        watchedState.form.processState = 'failed';
        return;
      }

      watchedState.form.processState = 'processing';
      axios.get(routes.proxy(formData.url))
        .then((res) => {
          handleFirstFeedResponse(res, formData.url);
        }).catch(() => {
          setProcessError(i18n.t('processErrors.network'));
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
