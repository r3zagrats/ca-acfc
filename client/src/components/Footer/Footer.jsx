import { faCopyright } from '@fortawesome/free-regular-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import classNames from 'classnames/bind';
import React from 'react';
import styles from './Footer.module.scss';

const cx = classNames.bind(styles);

const Footer = () => {
    return (
        <div className={cx('wrapper')}>
            <div className={cx('copyright')}>
                <FontAwesomeIcon icon={faCopyright} />
                <span>White Space</span>
            </div>
            <div className={cx('contact')}>
                <span>haquan@whitespace.vn</span>
            </div>
        </div>
    );
};

export default Footer;
