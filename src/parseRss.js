export const getRssDom = (str) => {
  const parser = new DOMParser();
  const DOM = parser.parseFromString(str, 'text/xml');
  if (DOM.documentElement.tagName !== 'rss') {
    return false;
  }
  return DOM;
};

export const parsePosts = (DOM) => [...DOM.querySelectorAll('item')].map((post) => ({
  link: post.querySelector('link').textContent,
  title: post.querySelector('title').textContent,
}));

export const parseFeed = (DOM) => ({
  title: DOM.querySelector('channel > title').textContent,
  description: DOM.querySelector('channel > description').textContent,
});
