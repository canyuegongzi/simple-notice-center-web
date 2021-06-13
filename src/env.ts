// 生产环境
export const ENV = {
    domain: 'http://www.canyuegongzi.xyz',
    casDomain: 'http://www.canyuegongzi.xyz/user-login-cas-web', // cas服务
    noticeBaseWeb: 'http://www.canyuegongzi.xyz/simple-push-center/v1.1',
    // noticeBaseWeb: 'http://148.70.150.131:10001/simple-push-center/v1.1',
    // noticeBaseWeb: 'http://127.0.0.1:10001/simple-push-center/v1.1',
    envBasicInformationManagerWebDomain: '', // 环境基础信息管理系统
    permissionDomain: '', // 权限服务
    userDomain: 'http://www.canyuegongzi.xyz/simple-user-center/v1.0', // 用户服务
    webHomePage: '', // cas跳转地址
    fileDomain: 'http://www.canyuegongzi.xyz/simple-file-center/v1.0', // 文件服务
 };
// @ts-ignore
window.PUSHENV = ENV;
