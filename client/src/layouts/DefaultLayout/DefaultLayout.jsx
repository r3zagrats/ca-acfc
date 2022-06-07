import Header from '~/components/Header/Header';
import Sidebar from '~/components/Sidebar/Sidebar';
import Main from '~/components/Main/Main';

import React from 'react';
import Footer from '~/components/Footer/Footer';
import Content from '~/components/Content/Content';

const DefaultLayout = ({ children }) => {
    return (
        <div>
            <Sidebar />
            <Main>
                <Header />
                <Content>{children}</Content>
                <Footer />
            </Main>
        </div>
    );
};

export default DefaultLayout;
