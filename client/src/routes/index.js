// Layouts
import { HeaderOnly } from '../layouts';

import Home from '~/pages/Home/Home';
import Following from '~/pages/Following/Following';
import Profile from '~/pages/Profile/Profile';
import Upload from '~/pages/Upload/Upload';
import Search from '~/pages/Search/Search';
import ZNSMangePage from '~/features/ZaloNotificationService/Manage/ZNSManagePage';
import ZNSDetailPage from '~/features/ZaloNotificationService/Detail/ZNSDetailPage';
import ZMManagePage from '~/features/ZaloMessage/Manage/ZMManagePage';
import ZMDetailPage from '~/features/ZaloMessage/Detail/ZMDetailPage';
import SMSManagePage from '~/features/SMS/Manage/SMSManagePage';
import SMSDetailPage from '~/features/SMS/Detail/SMSDetailPage';
import FMManagePage from '~/features/FacebookMessenger/Manage/FMManagePage';
import FMDetailPage from '~/features/FacebookMessenger/Detail/FMDetailPage';
import Settings from '~/pages/Settings/Settings';
import Feedback from '~/pages/Feedback/Feedback';

// Public routes
const publicRoutes = [
    { path: '/', component: Home },
    { path: '/following', component: Following },
    {
        path: '/profile',
        component: Profile,
    },
    { path: '/settings', component: Settings },
    { path: '/feedback', component: Feedback },
    {
        path: '/upload',
        component: Upload,
        layout: HeaderOnly,
    },
    { path: '/search', component: Search, layout: null },
    // ZNS
    { path: '/zns/manage', component: ZNSMangePage },
    { path: '/zns/detail', component: ZNSDetailPage },
    // ZM
    { path: '/zm/manage', component: ZMManagePage },
    { path: '/zm/detail', component: ZMDetailPage },
    // SMS
    { path: '/sms/manage', component: SMSManagePage },
    { path: '/sms/detail', component: SMSDetailPage },
    // FM
    { path: '/fm/manage', component: FMManagePage },
    { path: '/fm/detail', component: FMDetailPage },
];

const privateRoutes = [];

export { publicRoutes, privateRoutes };
