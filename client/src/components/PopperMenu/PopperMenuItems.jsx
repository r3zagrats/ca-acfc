import classNames from 'classnames/bind';
import React from 'react';
import Button from '../Button/Button';
import styles from './PopperMenu.module.scss';

const cx = classNames.bind(styles);

const PopperMenuItems = ({ item, onClick }) => {
    const classes = cx('menu-item', {
        'separate': item.separate,
    });
    return (
        <Button className={classes} leftIcon={item.icon} to={item.to} onClick={onClick}>
            {item.title}
        </Button>
    );
};

export default PopperMenuItems;
