import React from 'react';
import classNames from 'classnames/bind';
import styles from './Content.module.scss';

const cx = classNames.bind(styles);

const Content = ({ children }) => {
    return <div className={cx('wrapper')}>{children}</div>;
};

export default Content;
