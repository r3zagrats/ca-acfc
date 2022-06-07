import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import classNames from 'classnames/bind';
import styles from './Button.module.scss';

const cx = classNames.bind(styles);

const Button = ({
    to,
    href,
    type = '',
    size = '',
    disabled = false,
    children,
    className,
    leftIcon,
    rightIcon,
    onClick = () => {},
    ...rest
}) => {
    let Comp = 'button';

    const props = {
        onClick,
        ...rest,
    };

    const classes = cx('wrapper', {
        [className]: className,
        [type]: type,
        [size]: size,
        disabled,
    });

    if (to) {
        props.to = to;
        Comp = Link;
    } else if (href) {
        props.href = href;
        Comp = 'a';
    }

    // Remove event listener
    if (disabled) {
        Object.keys(props).forEach((key) => {
            if (key.startsWith('on') && typeof props[key] === 'function') {
                delete props[key];
            }
        });
        Comp = 'button';
    }

    return (
        <Comp className={classes} {...props}>
            {leftIcon && <span className={cx('icon')}>{leftIcon}</span>}
            <span className={cx('title')}>{children}</span>
            {rightIcon && <span className={cx('icon')}>{rightIcon}</span>}
        </Comp>
    );
};

Button.propTypes = {};

export default Button;
