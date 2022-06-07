import { faChevronLeft } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import classNames from 'classnames/bind';
import React from 'react';
import styles from './PopperMenu.module.scss';

const cx = classNames.bind(styles);

const PopperHeader = ({ title, onBack }) => {
    return (
        <header className={cx('menu-header')} onClick={onBack}>
            <button className={cx('back-button')}>
                <FontAwesomeIcon icon={faChevronLeft} />
            </button>
            <h4 className={cx('menu-title')}>{title}</h4>
        </header>
    );
};

export default PopperHeader;
