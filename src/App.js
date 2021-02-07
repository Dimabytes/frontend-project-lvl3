import onChange from 'on-change';
import * as yup from 'yup';
import keyBy from 'lodash/keyBy';
import isEqual from 'lodash/isEqual';
import differenceWith from 'lodash/differenceWith';
import omit from 'lodash/omit';
import axios from 'axios';
import i18n from 'i18next';
import { v4 as uuidv4 } from 'uuid';
import View from './View';
import { getRssDom, parseFeed, parsePosts } from './parseRss';

const routes = {
  proxy: (url) => `https://hexlet-allorigins.herokuapp.com/raw?url=${url}`,
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
};

export default class App {
  constructor(rootEl) {
    this.elements = {
      form: rootEl.querySelector('#main-form'),
    };
    const view = new View(rootEl);
    this.state = onChange(defaultState, view.onChange);
  }

  isFeedExists(url) {
    return this.state.feeds.some((el) => el.rssUrl === url);
  }

  handleFirstFeedResponse(res, rssUrl) {
    const DOM = getRssDom(res.data);
    if (!DOM) {
      this.state.form.processError = i18n.t('processErrors.rssNotFound');
      this.state.form.processState = 'failed';
      return;
    }
    const feed = parseFeed(DOM);
    const posts = parsePosts(DOM);
    this.state.feeds.push({
      ...feed,
      rssUrl,
      id: uuidv4(),
    });
    console.log(posts);
    posts.forEach((post) => {
      this.state.posts.push({
        ...post,
        id: uuidv4(),
      });
    });
    this.state.form.processState = 'finished';
  }

  getNewPosts() {
    const promiseArray = this.state.feeds.map(({ rssUrl }) => axios
      .get(routes.proxy(rssUrl)).then((res) => {
        const DOM = getRssDom(res.data);
        const allFeedPosts = parsePosts(DOM);

        const oldPosts = this.state.posts.map((post) => omit(post, 'id'));
        const newPosts = differenceWith(allFeedPosts, oldPosts, isEqual);

        newPosts.forEach((post) => {
          this.state.posts.push({
            ...post,
            id: uuidv4(),
          });
        });
      }));

    Promise.allSettled(promiseArray).then(() => {
      setTimeout(() => this.getNewPosts(), 5000);
    });
  }

  setControllers() {
    const schema = yup.object().shape({
      url: yup.string().required().url(),
    });

    this.elements.form.addEventListener('submit', (e) => {
      e.preventDefault();
      const formData = Object.fromEntries(new FormData(e.target));
      this.state.form.errors = validate(formData, schema);
      this.state.form.fields = formData;
      this.state.form.isValid = isEqual(this.state.form.errors, {});

      if (this.state.form.isValid) {
        if (this.isFeedExists(formData.url)) {
          this.state.form.processError = i18n.t('processErrors.duplicate');
          this.state.form.processState = 'failed';
          return;
        }

        this.state.form.processState = 'processing';
        axios.get(routes.proxy(formData.url))
          .then((res) => {
            this.handleFirstFeedResponse(res, formData.url);
          }).catch((err) => {
            console.error(err);
            this.state.form.processError = i18n.t('processErrors.network');
            this.state.form.processState = 'failed';
          });
      }
    });
  }
}
