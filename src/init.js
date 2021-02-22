import 'bootstrap';
import i18n from 'i18next';
import * as yup from 'yup';
import createApp from './App.js';
import resources from './locales';

export default () => {
  i18n.init({
    lng: 'en',
    resources,
  }).then(() => {
    console.log(i18n.t('validationErrors.required'));
    yup.setLocale({
      mixed: {
        required: i18n.t('validationErrors.required'),
      },
      string: {
        url: i18n.t('validationErrors.url'),
      },
    });
    const app = createApp();
    app.setControllers();
    app.getNewPosts();
  });
};
