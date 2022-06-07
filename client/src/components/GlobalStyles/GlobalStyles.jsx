import React from 'react';
import PropTypes from 'prop-types';
import './GlobalStyles.scss';

GlobalStyles.propTypes = {};

function GlobalStyles({ children }) {
    return <React.Fragment>{children}</React.Fragment>;
}

export default GlobalStyles;
