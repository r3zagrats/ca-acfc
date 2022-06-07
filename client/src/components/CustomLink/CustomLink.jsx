import React from 'react';
import { Link } from 'react-router-dom';
import classNames from 'classnames/bind';
import styles from './CustomLink.module.scss';

const cx = classNames.bind(styles);

const CustomLink = ({ to, onClick = () => {}, className, children,...props }) => {
    return (
        <div className={cx('custom-link', { className })} onClick={onClick} {...props}>
            <Link to={to}>{children}</Link>
        </div>
    );
};

export default CustomLink;
