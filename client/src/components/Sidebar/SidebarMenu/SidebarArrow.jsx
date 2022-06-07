import { faChevronRight } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import React from 'react';
import classNames from 'classnames/bind';
import styles from './SidebarMenu.module.scss';

const cx = classNames.bind(styles);

const SidebarArrow = ({ toggle, ...props }) => {
    const className = cx('menu-item-icon', {
        toggle,
    });
    
    return (
        <div className={className}>
            <FontAwesomeIcon icon={faChevronRight} {...props} />
        </div>
    );
};

export default SidebarArrow;
