import onChange from 'on-change';
import * as yup from 'yup';
import keyBy from 'lodash/keyBy';
import isEqual from 'lodash/isEqual';
import differenceWith from 'lodash/differenceWith';
import omit from 'lodash/omit';
import axios from 'axios';
import i18n from 'i18next';
import { v4 as uuidv4 } from 'uuid';
import $ from 'jquery';
import handleStateChange from './View';
import { getRssDom, parseFeed, parsePosts } from './parseRss';

const routes = {
  proxy: (url) => {
    const proxyUrl = new URL('/get', 'https://hexlet-allorigins.herokuapp.com');
    proxyUrl.searchParams.set('url', url);
    proxyUrl.searchParams.set('disableCache', 'true');
    return proxyUrl.toString();
  },
};

const validate = (fields, schema) => {
  try {
    schema.validateSync(fields, { abortEarly: false });
    return {};
  } catch (e) {
    return keyBy(e.inner, 'path');
  }
};

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

const createApp = () => {
  const elements = {
    form: document.querySelector('#main-form'),
  };
  const state = onChange(defaultState, handleStateChange());
  const schema = yup.object().shape({
    url: yup.string().required().url(),
  });

  const isFeedExists = (url) => state.feeds.some((el) => el.rssUrl === url);

  const addNewFeed = (feed, rssUrl) => {
    state.feeds.push({
      ...feed,
      rssUrl,
      id: uuidv4(),
    });
  };

  const addNewPosts = (posts) => {
    posts.forEach((post) => {
      state.posts.push({
        ...post,
        id: uuidv4(),
      });
    });
  };

  const setProcessError = (errorText) => {
    state.form.processError = errorText;
    state.form.processState = 'failed';
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
    state.form.processState = 'finished';
  };

  const getNewPosts = () => {
    const promiseArray = state.feeds.map(({ rssUrl }) => axios
      .get(routes.proxy(rssUrl)).then((res) => {
        const DOM = getRssDom(res.data.contents);
        const allFeedPosts = parsePosts(DOM);

        const oldPosts = state.posts.map((post) => omit(post, 'id'));
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
    state.form.errors = validate(formData, schema);
    state.form.fields = formData;
    state.form.isValid = isEqual(state.form.errors, {});

    if (state.form.isValid) {
      if (isFeedExists(formData.url)) {
        setProcessError(i18n.t('processErrors.duplicate'));
        state.form.processState = 'failed';
        return;
      }

      state.form.processState = 'processing';
      axios.get(routes.proxy(formData.url))
        .then((res) => {
          handleFirstFeedResponse(res, formData.url);
        }).catch((err) => {
          console.error(err);
          setProcessError(i18n.t('processErrors.network'));
        });
    }
  };

  const handlePostClick = (e) => {
    const postId = e.target.dataset.id;
    if (!state.uiState.viewedPosts.includes(postId)) {
      state.uiState.viewedPosts.push(postId);
    }
    state.uiState.modalPostId = postId;
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
