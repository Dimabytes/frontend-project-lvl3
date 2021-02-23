import 'bootstrap';
import i18n from 'i18next';
import * as yup from 'yup';
import createApp from './App';
import resources from './locales/index';
import yupLocale from './locales/yup';

const promise = i18n.init({
  lng: 'ru',
  debug: false,
  resources,
});

export default () => promise.then(() => {
  yup.setLocale(yupLocale);
  const app = createApp();
  app.setControllers();
  app.getNewPosts();
});
