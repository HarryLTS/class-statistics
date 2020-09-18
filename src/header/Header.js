import React from 'react';
import './Header.css';

const Header = () => {
  return (
    <header>
      <div className='header-wrapper'>
        <div className='content-wrapper'>
          <div>
            <h1 className='heading-primary'>
              Choose a Course That Suits Your Needs
            </h1>
            <h2 className='heading-secondary'>
              Get comparative analysis based on the performances of previous students similar to you. <a className='learn-more-link' href='/about'>Learn More</a>
            </h2>
          </div>
          <div>
            <h2 className='heading-get-started'>
              Get Started
            </h2>
            <img className='transition-icon' src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9Ii0xMS41IC0xMC4yMzE3NCAyMyAyMC40NjM0OCI+CiAgPHRpdGxlPlJlYWN0IExvZ288L3RpdGxlPgogIDxjaXJjbGUgY3g9IjAiIGN5PSIwIiByPSIyLjA1IiBmaWxsPSIjNjFkYWZiIi8+CiAgPGcgc3Ryb2tlPSIjNjFkYWZiIiBzdHJva2Utd2lkdGg9IjEiIGZpbGw9Im5vbmUiPgogICAgPGVsbGlwc2Ugcng9IjExIiByeT0iNC4yIi8+CiAgICA8ZWxsaXBzZSByeD0iMTEiIHJ5PSI0LjIiIHRyYW5zZm9ybT0icm90YXRlKDYwKSIvPgogICAgPGVsbGlwc2Ugcng9IjExIiByeT0iNC4yIiB0cmFuc2Zvcm09InJvdGF0ZSgxMjApIi8+CiAgPC9nPgo8L3N2Zz4K" alt="" height="20"/>
          </div>
        </div>
      </div>
    </header>
  );
}

export default Header;
