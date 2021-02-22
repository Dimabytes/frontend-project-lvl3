import 'bootstrap';
import i18n from 'i18next';
import { setLocale } from 'yup';
import createApp from './App.js';
import resources from './locales';
import yupLocale from './locales/yup';

export default () => i18n.init({
  lng: 'ru',
  debug: false,
  resources,
}).then(() => {
  setLocale(yupLocale);
  const app = createApp();
  app.setControllers();
  app.getNewPosts();
});
