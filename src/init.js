import 'bootstrap';
import i18n from 'i18next';
import * as yup from 'yup';
import createApp from './App.js';
import resources from './locales/index.js';
import yupLocale from './locales/yup.js';

export default () => {
  const i18nInstance = i18n.createInstance();
  return i18nInstance.init({
    lng: 'ru',
    debug: false,
    resources,
  }).then(() => {
    yup.setLocale(yupLocale);
    const app = createApp(i18nInstance);
    app.setControllers();
    app.getNewPosts();
  });
};
