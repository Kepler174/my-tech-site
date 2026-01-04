import React from 'react';
import Layout from '@theme/Layout';
import Heading from '@theme/Heading';

const books = [
  {
    title: 'Linux Kernel Development',
    author: 'Robert Love',
    cover: 'https://m.media-amazon.com/images/I/51s-R8kFj+L._SX379_BO1,204,203,200_.jpg',
    pdf: '#', 
  },
  {
    title: 'Pro Git',
    author: 'Scott Chacon',
    cover: 'https://git-scm.com/images/progit2.png',
    pdf: 'https://github.com/progit/progit2/releases/download/2.1.431/progit.pdf',
  },
];

export default function Books(): JSX.Element {
  return (
    <Layout title="Bookshelf" description="My collection of books">
      <main className="container margin-vert--lg">
        <Heading as="h1">📚 My Bookshelf</Heading>
        <div className="row">
          {books.map((book, idx) => (
            <div key={idx} className="col col--3 margin-bottom--lg">
              <div className="card">
                <div className="card__image">
                  <img
                    src={book.cover}
                    alt={book.title}
                    style={{height: '300px', objectFit: 'cover', width: '100%'}}
                  />
                </div>
                <div className="card__body">
                  <Heading as="h3">{book.title}</Heading>
                  <p>{book.author}</p>
                </div>
                <div className="card__footer">
                  <a href={book.pdf} target="_blank" rel="noopener noreferrer" className="button button--primary button--block">
                    Read PDF
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>
    </Layout>
  );
}
