import { v4 as uuidv4 } from 'uuid';

const parseRss = (DOM) => {
  const feedTitle = DOM.querySelector('channel > title').textContent;
  const feedDescription = DOM.querySelector('channel > description').textContent;

  const posts = [...DOM.querySelectorAll('item')].map((post) => ({
    link: post.querySelector('link').textContent,
    title: post.querySelector('title').textContent,
    id: uuidv4(),
  }));

  return {
    feed: {
      title: feedTitle,
      description: feedDescription,
      id: uuidv4(),
    },
    posts,
  };
};

export default parseRss;
