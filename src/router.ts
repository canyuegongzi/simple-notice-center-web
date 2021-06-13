import Router from 'vue-router';
import { RouteItem } from '@/type/route';
import {Message} from 'element-ui';
import Storage from '@/utils/storage';
export const route = [
    {
      path: '/',
      redirect: {
        name: 'task-index',
      },
    },
    {
      path: '/taskManage/TaskList',
      name: 'task-index',
      component: () => import( './views/task/TaskList.vue'),
    },
    {
      path: '/taskManage/AddTask',
      name: 'task-add',
      component: () => import( './views/task/AddTask.vue'),
    },
    {
      path: '/taskManage/TaskNote',
      name: 'task-add',
      component: () => import( './views/task/TaskNote.vue'),
    },
    {
      path: '/taskManage/TaskEmailConfig',
      name: 'task-add',
      component: () => import( './views/task/TaskEmailConfig.vue'),
    },
    {
      path: '/taskManage/peakConfig',
      name: 'task-peak',
      component: () => import( './views/task/PeakConfig.vue'),
    },
    {
      path: '/taskManage/AppRegister',
      name: 'App-register',
      component: () => import( './views/task/AppRegister.vue'),
    },
    {
      path: '/taskManage/TaskMessageConfig',
      name: 'task-add',
      component: () => import( './views/task/TaskMessageConfig.vue'),
    },
  ];

function beforeEach(to: { matched: { length: number; }; }, from: any, next: () => void) {
  if (to.matched.length > 0) {
    const location = window.location;
    const token: string =  Storage.localGet('token') || '';
    // if (!token) {
    //   const url = location.href;
    //     // @ts-ignore
    //   window.location.replace(window.PUSHENV.domain + window.PUSHENV.casDomain + '?redirectUrl=' + url);
    // } else {
    //   next();
    // }
    next();

  } else {
    Message.error('没有相应的权限，请联系管理员！');
  }
}

export const getRouter = (allMenus: RouteItem[]) => {
  const router = new Router({routes: route});
  router.beforeEach(beforeEach);
  return router;
};

