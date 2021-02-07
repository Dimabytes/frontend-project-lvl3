import onChange from 'on-change';
import * as yup from 'yup';
import keyBy from 'lodash/keyBy';
import isEqual from 'lodash/isEqual';
import axios from 'axios';
import i18n from 'i18next';
import View from './View';
import parseRss from './parseRss';

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

  handleProxyResponse(res, rssUrl) {
    const parser = new DOMParser();
    const DOM = parser.parseFromString(res.data, 'text/xml');
    if (DOM.documentElement.tagName !== 'rss') {
      this.state.form.processError = i18n.t('processErrors.rssNotFound');
      this.state.form.processState = 'failed';
      return;
    }

    const { feed, posts } = parseRss(DOM);
    this.state.feeds.push({
      ...feed,
      rssUrl,
    });
    this.state.posts = [...this.state.posts, ...posts];
    this.state.form.processState = 'finished';
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
        axios.get(`https://hexlet-allorigins.herokuapp.com/raw?url=${formData.url}`)
          .then((res) => {
            this.handleProxyResponse(res, formData.url);
          }).catch((err) => {
            console.error(err);
            this.state.form.processError = i18n.t('processErrors.network');
            this.state.form.processState = 'failed';
          });
      }
    });
  }
}
