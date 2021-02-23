import 'bootstrap';
import i18n from 'i18next/dist/cjs/i18next.js';
import * as yup from 'yup';
import createApp from './App.js';
import resources from './locales/index.js';
import yupLocale from './locales/yup.js';

i18n.init({
  lng: 'ru',
  debug: false,
  resources,
});

export default () => Promise.resolve().then(() => {
  yup.setLocale(yupLocale);
  const app = createApp();
  app.setControllers();
  app.getNewPosts();
});
