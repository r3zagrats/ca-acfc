import React from 'react';
import classNames from 'classnames/bind';
import styles from './Home.module.scss'

const cx = classNames.bind(styles)

const Home = () => {
  return (
    <div className={cx('content')}>
      <h2>Home Page</h2>
    </div>
  );
};

export default Home;