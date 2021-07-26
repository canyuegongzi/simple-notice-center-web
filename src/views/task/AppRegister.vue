<template lang="pug">
    .container
        base-header(title="应用注册" @editRow="editRow" :allowDelete="true" :isDelete="false" @deleteRow="deleteRow")
        base-table(:dataFormat="tableColumn" :allowEdit="false" :isLook="true" @isLook="isLookFun" :allowDelete="false" :isDelete="false" :allowDeleteData="allowDeleteData" :tableData="tableData"  @editRow="editRow" @deleteRow="deleteRow" :handleSelectionChange="handleSelectionChange")
            .search-items(slot="table-tools")
                .search-item
                    el-input(v-model="query.queryStr" @blur="getData('search')"  @keyup.enter.native="getData('search')" placeholder="请输入应用名称搜索" size="mini" suffix-icon="el-icon-search")
            el-pagination(slot="table-pagination" @size-change="handleSizeChange" :current-page.sync="currentPage"
                :page-size="pageSize"  layout="total, sizes, prev, pager, next, jumper" :total="total")
        el-dialog(:visible.sync="dialogVisible" :close-on-click-modal="false" :close-on-press-escape="false" @close="dialogClose" width="550px")
            span(slot="title") {{dialogTitle}}
            div(style="height: 380px;overflow: auto; padding: 0")
                el-scrollbar(style="height:100%;")
                    el-form(:model="appKey" :rules="appKeyRules" ref="form" label-width="140px" class="input-width")
                        el-form-item(label="名称：" prop="name")
                            el-input(v-model="appKey.name" :disabled="dialogTitle.indexOf('编辑' )> -1" size="mini" placeholder="请输入名称" )
                        el-form-item(label="应用有效期：" prop="indateTime")
                            el-date-picker(v-model="appKey.indateTime" :picker-options="selfDateDateOptions1" ref="tracStartTimeSelect" format="yyyy-MM-dd HH:mm:ss" value-format="yyyy-MM-dd HH:mm:ss" :clearable="false" placeholder="应用有效期" type="datetime" style="width: 100%" size="mini")
                        el-form-item(prop="email" label="邮箱：" v-if="!appKey.keyValue")
                            el-input(type="text" style="margin-top: 8px;" size="mini" v-model="appKey.email" auto-complete="off" placeholder="请输入邮箱")
                                template(slot="append")
                                    el-button(type="primary" size="mini"  @click="getEmailCode") {{emailText}}
                        el-form-item(prop="emailCode" label="验证码：" v-if="!appKey.keyValue")
                            el-input(type="text" size="mini" v-model="appKey.emailCode" auto-complete="off" placeholder="请输入邮箱验证码")
                        el-form-item(prop="keyValue" label="秘钥：" v-if="appKey.keyValue")
                            el-input(type="textarea" size="mini" :rows="4" show-password v-model="appKey.keyValue" auto-complete="off")
                        el-form-item(label="状态：" prop="status")
                            el-radio-group(v-model="appKey.status"  size="mini")
                                el-radio(:label="true") 开启
                                el-radio(:label="false") 关闭
            div(slot="footer")
                el-button(@click="cancelFun" size="mini") 取消
                el-button(@click="getKey" size="mini" :disabled="isDisabled1") 获取KEY
                el-button(type="primary" @click="okFun" size="mini" :disabled="isDisabled") 确定
        el-dialog(:visible.sync="dialogVisible1" :close-on-click-modal="false" :close-on-press-escape="false" @close="dialogClose" width="550px")
            span(slot="title") 秘钥查看
            div(style="height: 380px;overflow: auto; padding: 0")
                el-scrollbar(style="height:100%;")
                    el-form(:model="formInfo" ref="form" label-width="140px" class="input-width")
                        el-form-item(label="名称：" prop="name")
                            p {{formInfo.name}}
                        el-form-item(prop="keyValue" label="秘钥：")
                            el-input(type="textarea" :rows="5" size="mini" v-model="formInfo.keyValue" auto-complete="off" placeholder="请输入邮箱验证码")
            div(slot="footer")
                el-button(@click="cancelFun" size="mini") 取消
</template>

<script lang="ts">
import { Vue, Prop, Watch, Emit, Component } from "vue-property-decorator";
import BaseHeader from '@/components/table-page/BaseHeader.vue';
import BaseTable from '@/components/table-page/BaseTable.vue';
import { $post, $get } from "@/utils/feth";
import {categoryApi, getEmailApi, getKeyApi, taskConfigApi, appKeyApi, verifyCode} from '@/api/api';
import {isNumber, validEmail} from "@/utils/validate";
import Rule from "@/type/Rule";
import SelectOption from "@/type/SelectOption";
import { confirmDelete, responseMsg } from "@/utils/response";
import AppKeyInfo from "@/type/AppKeyInfo";
import moment from "moment";
@Component({
  components: {
    BaseHeader,
    BaseTable,
  },
})
export default class AppRegister extends Vue {

  get currentUserName() {
    return Vue.prototype._user && Vue.prototype._user.name ? Vue.prototype._user.name : '';
  }
  private static validateEmail(rule: Rule, value: string, callback: (error?: Error) => void) {
    if (!validEmail(value)) {
      callback(new Error('邮箱格式不正确'));
    } else {
      callback();
    }
  }
  private static validateNumber(
    rule: Rule,
    value: any,
    callback: (error?: Error) => void,
  ) {
    if (!isNumber(value)) {
      callback(new Error("排序不正确"));
    } else {
      callback();
    }
  }
  public selfDateDateOptions1: any =  this.timeDisabledDate();


  public $refs!: {
    form: HTMLFormElement;
    form1: HTMLFormElement;
  };
  public tableColumn = [
    { prop: "index", label: "序号", width: 60},
    { prop: "name", label: "名称"},
    { prop: "statusLabel", label: "状态" },
    { prop: "expiresTime", label: "过期时间" },
  ];
  public formInfo = {
    name: '',
    keyValue: '',
  };
  public appKey = new AppKeyInfo();
  public tableData = [];
  public currentPage: number = 1;
  public selectedRow: Array<number | string> = [];
  public pageSize: number = 10;
  public total: number = 0;
  public pageTitle: string = "新增";
  public query: any = {
    queryStr: "",
  };
  public organUser: any = {
    orId: '',
    userId: [],
  };
  public dialogVisible: boolean = false;
  public dialogChartAuth: boolean = false;
  public dialogUserVisible: boolean = false;
  public dialogTitle: string = "新增配置";
  public formEditFlag: boolean = false;
  public organizationSelectOptions: SelectOption[] = [];
  public categoryId: any = "";
  public authTreeData: any = [];
  public horizontal: boolean =  false;
  public collapsable: boolean = true;
  public expandAll: boolean = false;
  public loading: any = null;
  public emailText: any = '获取验证码';
  public getCodeIng: boolean = false;
  public appKeyRules = {
    isDefault: [new Rule({ message: "是否默认不能为空" })],
    status: [new Rule({ message: "状态不能为空" })],
    name: [new Rule({ message: "名称不能为空" })],
    keyValue: [new Rule({ message: "秘钥不能为空" })],
    indateTime: [new Rule({ message: "有效期不能为空" })],
    emailCode: [
      {required: true, message: '请输入邮箱验证码', trigger: 'blur'},
      new Rule({ required: true, trigger: 'blur', message: '账号只能是数字、字母、下划线' }, (rule, value, callback) => {
        if (!(/^[A-Za-z0-9_]+$/.test(value))) {
          callback(new Error('账号只能是数字、字母、下划线'));
        } else {
          callback();
        }
      }),
      new Rule({ required: true, trigger: 'blur', message: '验证码错误' }, (rule, value, callback) => {
        if (value != "" && value != null) {
          console.log(this.appKey);
          $post(verifyCode.api, {
            email: this.appKey.email,
            value,
          }).then((response: any) => {
            if (!response.success || !response) {
              callback(new Error('验证码错误'));
            } else {
              callback();
            }
          });
        } else {
          callback();
        }
      }),
    ],
    email: [
      {required: true, message: '请输入邮箱', trigger: 'blur'},
      new Rule({}, AppRegister.validateEmail),
    ],
  };
  private isDisabled: boolean = true;
  private dialogVisible1: boolean = false;
  private isDisabled1: boolean = false;
  private getCodeIngTimer: any = null;
  @Watch("currentPage", { deep: true, immediate: false })
  public currentPageChange(val: any, oldVal: any) {
    this.getData();
  }

  /**
   * 获取邮箱验证码
   */
  public async  getEmailCode() {
    if (this.getCodeIng) {
      return;
    }
    if (!this.appKey.email) {
      this.$message.error('请填写名称或者邮箱');
      return;
    }
    const getEmailCode: any = await $post(getEmailApi.api, {userName: this.appKey.name, email: this.appKey.email});
    if (getEmailCode.success) {
      this.$message.success('验证码发送成功，请注意查收');
      this.getCodeIng = true;
      this.emailText = 180;
      this.getCodeIngTimer = setInterval(() => {
        this.emailText --;
        if (this.emailText <= 0) {
          clearInterval(this.getCodeIngTimer);
          this.emailText = '获取验证码';
          this.getCodeIng = false;
        }
      }, 1000);
    } else {
      this.$message.success('验证码发送失败，请联系管理员');
    }
  }
  public editRow(data: any) {
    // this.appKey = new AppKeyInfo();
    this.dialogVisible = true;
    this.isDisabled = true;
    this.isDisabled1 = false;
    this.dialogTitle = data != "editRow" ? "编辑应用" : "新增应用";
    /*if (data != "editRow") {
      this.categoryId = data.row.id;
      this.formEditFlag = true;
      this.getConfigInfo(data.row);
    }*/
  }

  public deleteRow(data: any) {
    const ids = data == "deleteRow" ? this.selectedRow : [data.row.id];
    if (ids.length < 1) {
      this.$message({
        message: "请先选择要删除的数据！",
        type: "warning",
      });
      return false;
    }
    confirmDelete(appKeyApi.delete.url, this.getData, { ids: ids });
  }

  /**
   * 查看详情
   */
  public isLookFun(data: any) {
    this.dialogVisible1 = true;
    this.isDisabled = true;
    this.isDisabled1 = false;
    this.dialogTitle = '查看秘钥';
    this.formInfo.name = data.row.name;
    this.formInfo.keyValue = data.row.keyValue;
  }

  /**
   * 当前行是否可删除
   * @param row {object}
   * @returns {boolean}
   */
  public allowDeleteData(row: any) {
    return true;
  }

  /**
   * 多选
   * @param val
   * @returns {string}
   */
  public handleSelectionChange(val: any) {
    const selectedIds: Array<string | number> = [];
    for (let i = 0; i < val.length; i++) {
      selectedIds.push(val[i].id);
    }
    this.selectedRow = selectedIds;
    return selectedIds.join(",");
  }
  /**
   * 获取数据
   * @param flag
   */
  public async getData(flag?: string) {
    if (flag == "search") {
      this.currentPage = 1;
    }
    const response: any = await $post(appKeyApi.list.url, {
      page: this.currentPage,
      pageSize: this.pageSize,
      name: this.query.queryStr,
    });
    this.total = (response.data && response.data.count) || 0;
    this.tableData =
      response.data && response.data.data ? response.data.data : [];
    this.tableData.forEach((item: any, index: number) => {
      item.statusLabel = item.status === true ? '开启' : '关闭';
      item.index = index + 1;
    });
    const totalPageNumber = Math.ceil(this.total / this.pageSize);
    if (totalPageNumber < this.currentPage && this.total !== 0) {
      this.currentPage = totalPageNumber;
      this.getData();
    } else if (this.total === 0) {
      this.currentPage = 1;
    }
    return false;
  }

  /**
   * pageSize修改
   * @param val
   */
  public handleSizeChange(val: number) {
    this.pageSize = val;
    this.getData();
    return false;
  }

  private timeDisabledDate() {
    const that = this;
    return {
      disabledDate(time: any) {
        return (time.getTime() <= moment().startOf("hour").valueOf());
},
    };

  }

  /**
   * 处理功能列表
   */
  private dealCtegoryListData(data: any) {
    const res = data.map((item: AppKeyInfo) => {
      return {
        label: item.name,
        value: item.id,
      };
    });
    return res;
  }
  /**
   * 弹窗关闭
   */
  private dialogClose() {
    this.dialogVisible = false;
    this.dialogChartAuth = false;
    this.dialogUserVisible = false;
    this.categoryId = "";
    this.formEditFlag = false;
    this.appKey = new AppKeyInfo();
  }

  /**
   * 弹窗取消
   */
  private async cancelFun() {
    this.dialogVisible = false;
    this.dialogVisible1 = false;
    this.categoryId = "";
    this.formEditFlag = false;
    this.dialogUserVisible = false;
    this.appKey = new AppKeyInfo();
    await this.getData();
  }

  private async getKey() {
      this.$refs.form.validate(async (valid: boolean) => {
        if (!valid) {
          return false;
        }
        let res: any = null;
        try {
          res = await $post(getKeyApi.api, { name: this.appKey.name, email: this.appKey.email, expiresTime: this.appKey.indateTime });
          this.loading = this.$loading({
            lock: true,
            text: '正在生成秘钥中，请耐心等待',
            spinner: 'el-icon-loading',
            background: 'rgba(0, 0, 0, 0.7)',
          });
          setTimeout(() => {
            if (res && res.data && res.data.accessToken) {
              this.appKey.keyValue = res.data.accessToken;
              this.appKey.secret = res.data.secret;
              this.isDisabled = false;
              this.isDisabled1 = true;
            } else {
              this.$message.error('服务正在维护中。。。');
            }
            this.loading.close();
          }, 1000);
        } catch (e) {
          this.$message.error('服务正在维护中。。。');
          this.loading.close();
        }

      });

  }

  /**
   * 弹窗确认
   */
  private async okFun() {
    let params: any;
    let api: string = "";
    if (this.dialogTitle.indexOf("新增") > -1) {
      params = { ...this.appKey };
      api = appKeyApi.add.url;
    } else {
      params = { ...this.appKey, id: this.categoryId };
      api = taskConfigApi.add.url;
    }
    params.operateUser = Vue.prototype._user.name;
    params.emailCode = this.appKey.emailCode;
    params.expiresTime = this.appKey.indateTime;
    params.email = this.appKey.email;
    params.secret = this.appKey.secret;
    delete params.indateTime;
    // this.appKey.
    this.$refs.form.validate(async (valid: boolean) => {
      if (!valid) {
        return false;
      }
      const res: any = await $post(api, params);
      responseMsg(res.success, this.dialogTitle, this.cancelFun);
    });
  }

  /**
   * 获取配置info
   */
  private async getConfigInfo(data: AppKeyInfo) {
    this.appKey = {
      host: data.host,
      port: data.port,
      secure: data.secure,
      name: data.name,
      operateUser: data.operateUser,
      status: Number(data.status),
      isDefault: Number(data.isDefault),
    };
    this.isDisabled = (this.currentUserName != data.operateUser &&  this.dialogTitle.indexOf('编辑') > -1);
  }

  private openChartAuth() {
    this.dialogChartAuth = true;
  }

  private renderContent(h: any, data: any) {
    return data.name;
  }

  private onExpand(e: any, data: any) {
    if ("expand" in data) {
      data.expand = !data.expand;
      if (!data.expand && data.children) {
        this.collapse(data.children);
      }
    } else {
      this.$set(data, "expand", true);
    }
  }

  private collapse(list: any) {
    const that = this;
    list.forEach((child: any) =>  {
      if (child.expand) {
        child.expand = false;
      }
      child.children && that.collapse(child.children);
    });
  }

  private expandChange() {
    this.toggleExpand(this.authTreeData, this.expandAll);
  }

  /**
   * 切花展开关闭
   */
  private toggleExpand(data: any, val: any) {
    const that = this;
    if (Array.isArray(data)) {
      data.forEach((item) => {
        that.$set(item, "expand", val);
        if (item.children) {
          that.toggleExpand(item.children, val);
        }
      });
    } else {
      this.$set(data, "expand", val);
      if (data.children) {
        that.toggleExpand(data.children, val);
      }
    }
  }

  /**
   * 节点点击
   * @param e
   * @param data
   */
  private onNodeClick(e: any, data: any) {

  }

  private async mounted() {
    console.log(561456);
    this.$nextTick(async () => {
       await this.getData();
    });
  }
}
</script>

<style lang="stylus" scoped>
    .options
        >>>.el-input
            .el-input__inner
                height 28px !important
</style>

