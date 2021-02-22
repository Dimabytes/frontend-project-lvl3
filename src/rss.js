const getRssDom = (str) => {
  const parser = new DOMParser();
  const DOM = parser.parseFromString(str, 'text/xml');
  if (DOM.documentElement.nodeName === 'parsererror') {
    throw new Error('Ошибка парсинга rss');
  }
  return DOM;
};

const parsePosts = (DOM) => [...DOM.querySelectorAll('item')]
  .reverse()
  .map((post) => ({
    link: post.querySelector('link').textContent,
    title: post.querySelector('title').textContent,
    description: post.querySelector('description').textContent,
  }));

const parseFeed = (DOM) => ({
  title: DOM.querySelector('channel > title').textContent,
  description: DOM.querySelector('channel > description').textContent,
});

const parseRss = (str) => {
  const DOM = getRssDom(str);
  const feed = parseFeed(DOM);
  const posts = parsePosts(DOM);
  return {
    feed,
    posts,
  };
};

export default parseRss;
