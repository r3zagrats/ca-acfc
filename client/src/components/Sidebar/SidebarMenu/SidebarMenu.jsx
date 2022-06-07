import classNames from 'classnames/bind';
import React, { useState } from 'react';
import styled from 'styled-components';
import CustomLink from '~/components/CustomLink/CustomLink';
import SidebarArrow from './SidebarArrow';
import styles from './SidebarMenu.module.scss';

const cx = classNames.bind(styles);

const Item = styled.div`
    display: flex;
    padding: 12px 18px;
    padding-left: ${(props) => `${props.dept * 18}px`};
    align-items: center;
`;

const SidebarMenu = ({ list }) => {
    const [activeMenus, setActiveMenus] = useState([]);

    const handleMenuClick = (data) => {
        console.log(data);
    };

    const handleArrowClick = (menuName) => {
        let newActiveMenus = [...activeMenus];

        if (newActiveMenus.includes(menuName)) {
            var index = newActiveMenus.indexOf(menuName);
            if (index > -1) {
                newActiveMenus.splice(index, 1);
            }
        } else {
            newActiveMenus.push(menuName);
        }

        setActiveMenus(newActiveMenus);
    };

    const MenuItem = ({ dept, data, hasSubMenu, menuName, menuIndex, to }) => (
        <li>
            <Item dept={dept} onClick={() => handleArrowClick(menuName)}>
                {to ? (
                    <CustomLink
                        to={to}
                        className={cx('menu-item-link')}
                        onClick={() => handleMenuClick(data)}
                    >
                        {data.label}{' '}
                    </CustomLink>
                ) : (
                    <span className={cx('menu-item-label')} onClick={() => handleMenuClick(data)}>
                        {data.label}{' '}
                    </span>
                )}
                {hasSubMenu && <SidebarArrow toggle={activeMenus.includes(menuName)} />}
            </Item>
            {hasSubMenu && (
                <SubMenu
                    dept={dept}
                    data={data.submenu}
                    toggle={activeMenus.includes(menuName)}
                    menuIndex={menuIndex}
                />
            )}
        </li>
    );

    const SubMenu = ({ dept, data, toggle, menuIndex }) => {
        if (!toggle) {
            return null;
        }

        dept = dept + 1;

        return (
            <ul className={cx('menu-list')}>
                {data.map((menu, index) => {
                    const menuName = `sidebar-submenu-${dept}-${menuIndex}-${index}`;

                    return (
                        <MenuItem
                            dept={dept}
                            data={menu}
                            hasSubMenu={menu.submenu}
                            menuName={menuName}
                            key={menuName}
                            menuIndex={index}
                            to={menu.to}
                        />
                    );
                })}
            </ul>
        );
    };

    return (
        <ul className={cx('menu-list')}>
            {list.map((menu, index) => {
                const dept = 1;
                const menuName = `sidebar-menu-${dept}-${index}`;

                return (
                    <MenuItem
                        dept={dept}
                        data={menu}
                        hasSubMenu={menu.submenu}
                        menuName={menuName}
                        key={menuName}
                        menuIndex={index}
                        to={menu.to}
                    />
                );
            })}
        </ul>
    );
};

export default SidebarMenu;
