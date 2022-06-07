import { faBell, faCircleQuestion, faUser } from '@fortawesome/free-regular-svg-icons';
import {
    faEllipsisVertical,
    faGear,
    faGlobe,
    faRightToBracket,
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import classNames from 'classnames/bind';
import { Container } from 'reactstrap';
import Button from '~/components/Button/Button';
import PopperMenu from '~/components/PopperMenu/PopperMenu';
import { MessageIcon } from '~/components/Icons';
import styles from './Header.module.scss';
import Image from '../Image/Image';

const cx = classNames.bind(styles);

const MENU_LIST = [
    {
        icon: <FontAwesomeIcon icon={faGlobe} />,
        title: 'Language',
        children: {
            title: 'Language1',
            data: [
                {
                    code: 'vi',
                    title: 'Tiếng Việt1',
                    children: {
                        title: 'Language2',
                        data: [
                            {
                                code: 'vi',
                                title: 'Tiếng Việt2',
                                children: {
                                    title: 'Language3',
                                    data: [
                                        {
                                            code: 'vi',
                                            title: 'Tiếng Việt3',
                                        },
                                        {
                                            code: 'en',
                                            title: 'English3',
                                        },
                                    ],
                                },
                            },
                            {
                                code: 'en',
                                title: 'English2',
                            },
                        ],
                    },
                },
                {
                    code: 'en',
                    title: 'English1',
                },
            ],
        },
    },
    {
        icon: <FontAwesomeIcon icon={faCircleQuestion} />,
        title: 'Feedback and help',
        to: '/feedback',
    },
];

const currentUser = true;

const userMenu = [
    {
        icon: <FontAwesomeIcon icon={faUser} />,
        title: 'Profile',
        to: '/profile',
    },
    {
        icon: <FontAwesomeIcon icon={faGear} />,
        title: 'Settings',
        to: '/settings',
    },
    ...MENU_LIST,
    {
        icon: <FontAwesomeIcon icon={faRightToBracket} />,
        title: 'Log out',
        separate: true,
    },
];

const Header = () => {

    const handleOnChange = (menuItem) => {
        console.log(menuItem);
    };
    
    return (
        <header className={cx('wrapper')}>
            <Container>
                <div className={cx('header')}>
                    {currentUser ? (
                        <>
                            <button className={cx('actions-button')}>
                                <FontAwesomeIcon icon={faBell} />
                            </button>
                            <button className={cx('actions-button')}>
                                <MessageIcon />
                            </button>
                        </>
                    ) : (
                        <>
                            <Button type="outline">Log in</Button>
                            <Button type="primary">Sign up</Button>
                        </>
                    )}
                    <PopperMenu
                        menuList={currentUser ? userMenu : MENU_LIST}
                        onchange={handleOnChange}
                    >
                        {currentUser ? (
                            <Image
                                className={cx('user-avatar')}
                                src="ttps://yt3.ggpht.com/yti/APfAmoGkcnUQtmKdjjYxrnE1_3H30hRaN55jm0oRp17o=s88-c-k-c0x00ffffff-no-rj-mo"
                                alt="avatar"
                                // fallback="https://yt3.ggpht.com/wgneNTiW753q5G6XMnjyNLAzReR4TVFJryTKTpIqJefrKMyhABPwfnyNWIoT5NNGstFlva1tgw=s88-c-k-c0x00ffffff-no-rj"
                            />
                        ) : (
                            <button className={cx('more-button')}>
                                <FontAwesomeIcon icon={faEllipsisVertical} />
                            </button>
                        )}
                    </PopperMenu>
                </div>
            </Container>
        </header>
    );
};

export default Header;
