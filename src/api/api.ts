export const categoryApi = {
  add: {
    method: 'post',
    url: '/category/add',
  },
  addUser: {
    method: 'post',
    url: '/category/add',
  },
  update: {
    method: 'update',
    url: '/category/update',
  },
  delete: {
    method: 'delete',
    url: '/category/delete',
  },
  info: {
    method: 'get',
    url: '/category/info',
  },
  list: {
    method: 'get',
    url: '/category/list',
  },
  tree: {
    method: 'get',
    url: '/category/categoryTree',
  },
};
export const fileApi = {
  qiniu: {
    method: 'post',
    url: '/qiniu/uploadQiniu',
  },
  disk: {
    method: 'post',
    url: '/upload/add',
  },
  multipleQiniu: {
    method: 'post',
    url: '/qiniu/multipleQiniu',
  },
  multipleDisk: {
    method: 'post',
    url: '/upload/multipleDisk',
  },
  add: {
    method: 'post',
    url: '/file/add',
  },
  update: {
    method: 'update',
    url: '/file/update',
  },
  delete: {
    method: 'delete',
    url: '/file/delete',
  },
  deleteQiniu: {
    method: 'delete',
    url: '/qiniu/deleteFile',
  },
  info: {
    method: 'get',
    url: '/file/info',
  },
  list: {
    method: 'get',
    url: '/file/list',
  },
  all: {
    method: 'get',
    url: '/file/all',
  },
};

export const qiNiuConfigApi = {
  info: {
    method: 'get',
    url: '/file/config',
  },
  edit: {
    method: 'post',
    url: '/file/editConfig',
  },
};
export const taskConfigApi = {
  add: {
    method: 'post',
    url: '/taskConfig/email/add',
  },
  update: {
    method: 'update',
    url: '/taskConfig/email/update',
  },
  delete: {
    method: 'delete',
    url: '/taskConfig/email/del',
  },
  info: {
    method: 'get',
    url: 'taskConfig/email/list',
  },
  list: {
    method: 'get',
    url: 'taskConfig/email/list',
  },
  defaultList: {
    method: 'post',
    url: 'taskConfig/common/default/list',
  },
  tree: {
    method: 'get',
    url: '/task/category/categoryTree',
  },
};
export const taskMessageConfigApi = {
  add: {
    method: 'post',
    url: '/taskConfig/message/add',
  },
  update: {
    method: 'update',
    url: '/taskConfig/message/update',
  },
  delete: {
    method: 'delete',
    url: '/taskConfig/message/del',
  },
  info: {
    method: 'get',
    url: '/taskConfig/message/list',
  },
  list: {
    method: 'get',
    url: '/taskConfig/message/list',
  },
  canSubmit: {
    method: 'post',
    url: '/task/can/submit',
  },
};
export const taskApi = {
  authApp: {
    method: 'post',
    url: '/task/auth/app',
  },
  add: {
    method: 'post',
    url: '/task/email/add',
  },
  messageAdd: {
    method: 'post',
    url: '/task/message/add',
  },
  update: {
    method: 'update',
    url: '/task/email/cancle',
  },
  delete: {
    method: 'delete',
    url: '/task/del',
  },
  info: {
    method: 'get',
    url: '/taskConfig/email/list',
  },
  list: {
    method: 'get',
    url: '/task/list',
  },
  tree: {
    method: 'get',
    url: '/category/categoryTree',
  },
  cancle: {
    method: 'post',
    url: '/task/cancle',
  },
};
export const taskLogApi = {
  add: {
    method: 'post',
    url: '/task/email/add',
  },
  update: {
    method: 'update',
    url: '/task/email/cancle',
  },
  delete: {
    method: 'delete',
    url: '/task/del',
  },
  info: {
    method: 'get',
    url: '/task/log/info',
  },
  list: {
    method: 'get',
    url: '/task/log/list',
  },
  tree: {
    method: 'get',
    url: '/category/categoryTree',
  },
};
export const getEmailApi = {
  api: '/app/getEmailCode',
};
export const appKeyApi = {
  add: {
    method: 'post',
    url: '/app/add',
  },
  update: {
    method: 'update',
    url: '/task/email/cancle',
  },
  delete: {
    method: 'delete',
    url: '/app/del',
  },
  info: {
    method: 'get',
    url: '/task/log/info',
  },
  list: {
    method: 'get',
    url: '/app/list',
  },
  tree: {
    method: 'get',
    url: '/category/categoryTree',
  },
  systemConfigEdit: {
    url: '/app/systemConfig/edit',
    method: 'get',
  },
  systemConfigInfo: {
    url: '/app/systemConfig/info',
    method: 'get',
  },
};

export const verifyCode = {
  api: '/app/verifyCode',
};

export const verifyName = {
  api: '/taskConfig/common/uniqueName',
};

export const getKeyApi = {
  api: '/app/getKey',
};

