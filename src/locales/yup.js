export default {
  string: {
    url: () => ({ key: 'url' }),
    unique: () => ({ key: 'duplicate' }),
  },
  mixed: {
    required: () => ({ key: 'required' }),
  },
};
