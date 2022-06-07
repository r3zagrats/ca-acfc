import React, { useState } from 'react';
import Tippy from '@tippyjs/react/headless';
import Popper from '../Popper/Popper';
import classNames from 'classnames/bind';
import styles from './PopperMenu.module.scss';
import PopperHeader from './PopperHeader';
import PopperMenuItems from './PopperMenuItems';

const cx = classNames.bind(styles);

const PopperMenu = ({ children, menuList = [], onChange = () => {} }) => {
    const [history, setHistory] = useState([{ data: menuList }]);
    const current = history[history.length - 1];

    const renderMenuList = () => {
        return current.data.map((item, index) => {
            let isParent = !!item.children;
            return (
                <PopperMenuItems
                    key={index}
                    item={item}
                    onClick={() => {
                        if (isParent) {
                            setHistory((prev) => [...prev, item.children]);
                        } else {
                            console.log(item);
                            onChange(item);
                        }
                    }}
                />
            );
        });
    };

    return (
        <div>
            <Tippy
                delay={[0, 500]}
                placement="bottom-end"
                interactive
                render={(attrs) => (
                    <div className={cx('menu-list')} tabIndex="-1" {...attrs}>
                        <Popper>
                            {history.length > 1 && (
                                <PopperHeader
                                    title={history[history.length - 1].title}
                                    onBack={() => {
                                        setHistory((prev) => prev.slice(0, prev.length - 1));
                                    }}
                                />
                            )}
                            {renderMenuList()}
                        </Popper>
                    </div>
                )}
                onHide={() => setHistory((prev) => prev.slice(0, 1))}
            >
                {children}
            </Tippy>
        </div>
    );
};

export default PopperMenu;
