import classNames from 'classnames/bind';
import React from 'react';
import { Link } from 'react-router-dom';
import images from '~/assets/images';
import styles from './Sidebar.module.scss';
import SidebarMenu from './SidebarMenu/SidebarMenu';

const cx = classNames.bind(styles);

const list = [
    {
        label: 'Zalo Notification Service',
        submenu: [
            {
                label: 'Manage',
                to: '/zns/manage',
            },
            {
                label: 'Detail',
                to: '/zns/detail',
            },
        ],
    },
    {
        label: 'Zalo Message',
        submenu: [
            {
                label: 'Manage',
                to: '/zm/manage',
            },
            {
                label: 'Detail',
                to: '/zm/detail',
            },
        ],
    },
    {
        label: 'SMS',
        submenu: [
            {
                label: 'Manage',
                to: '/sms/manage',
            },
            {
                label: 'Detail',
                to: '/sms/detail',
            },
        ],
    },
    {
        label: 'Facebook Messenger',
        submenu: [
            {
                label: 'Manage',
                to: '/fm/manage',
            },
            {
                label: 'Detail',
                to: '/fm/detail',
            },
        ],
    },
];

const Sidebar = () => {
    return (
        <aside className={cx('wrapper')}>
            <Link to="/">
                <img src={images.logo} className={cx('logo')} alt="logo"></img>
            </Link>
            <SidebarMenu list={list} />
        </aside>
    );
};

export default Sidebar;
