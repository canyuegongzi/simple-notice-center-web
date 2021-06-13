<template lang="pug">
  .container
    base-header(title="邮件推送配置" @editRow="editRow" :isDelete="false" @deleteRow="deleteRow")
    base-table(:dataFormat="tableColumn" :allowEdit="true" :allowDeleteData="allowDeleteData" :tableData="tableData"  @editRow="editRow" @deleteRow="deleteRow" :handleSelectionChange="handleSelectionChange")
      .search-items(slot="table-tools")
        .search-item
          el-input(v-model="query.queryStr" @blur="getData('search')"  @keyup.enter.native="getData('search')" placeholder="请输入配置名称搜索" size="mini" suffix-icon="el-icon-search")
    el-dialog(:visible.sync="dialogVisible" :close-on-click-modal="false" @close="dialogClose" width="550px")
      span(slot="title") {{dialogTitle}}
      div(style="height: 380px;overflow: auto; padding: 0")
        el-scrollbar(style="height:100%;")
          el-form(:model="taskConfigInfo" :disabled="isDisabled" :rules="taskConfigInfoRules" ref="form" label-width="140px" class="input-width")
            el-form-item(label="名称：" prop="name")
                el-input(v-model="taskConfigInfo.name" :disabled="dialogTitle.indexOf('编辑' )> -1" size="mini" placeholder="请输入名称" )
            el-form-item(label="用户：" prop="authUser")
              el-input(v-model="taskConfigInfo.authUser" size="mini" placeholder="请输入authUser" )
                  div(slot="append")
                    el-tooltip(class="item" effect="dark" content="邮箱用户名" placement="top-start")
                      i.el-icon-info
            el-form-item(label="授权码：" prop="authPass")
                el-input(v-model="taskConfigInfo.authPass" type="password" size="mini" placeholder="请输入authPass" )
                  div(slot="append")
                      el-tooltip(class="item" effect="dark" content="邮箱用户授权码,此密码不是用户密码，是邮箱的授权码。" placement="top-start")
                        i.el-icon-info
            el-form-item(label="服务：" prop="service")
                el-select(v-model="taskConfigInfo.service" style="width: 360px" @change="serviceChange" filterable size="mini" placeholder="请输入service")
                    el-option(v-for="(item, index) in serviceList" :label="item" :value="item" :key="item")
            el-form-item(label="ignoreTLS：" prop="ignoreTLS")
                el-radio-group(v-model="taskConfigInfo.ignoreTLS"  size="mini")
                    el-radio(:label="1") 开启
                    el-radio(:label="0") 关闭
            el-form-item(label="状态：" prop="status")
                el-radio-group(v-model="taskConfigInfo.status"  size="mini")
                    el-radio(:label="1") 开启
                    el-radio(:label="0") 关闭
            el-form-item(label="是否默认：" prop="isDefault")
                el-radio-group(v-model="taskConfigInfo.isDefault" :disabled="true"  size="mini")
                    el-radio(:label="1") 是
                    el-radio(:label="0") 否
            el-form-item(label="域名：" prop="host")
                el-input(v-model="taskConfigInfo.host" size="mini"  placeholder="请输入host")
            el-form-item(label="端口：" prop="port")
                el-input-number(v-model="taskConfigInfo.port" :min="1" :max="50000" size="mini" placeholder="请输入port")
            el-form-item(label="安全策略：" prop="secure")
                el-input(v-model="taskConfigInfo.secure" size="mini"  placeholder="请输入secure")
      div(slot="footer")
        el-button(@click="cancelFun" size="mini") 取消
        el-button(type="primary" @click="okFun" size="mini" :disabled="isDisabled") 确定
</template>

<script lang="ts">
import { Vue, Prop, Watch, Emit, Component } from "vue-property-decorator";
import BaseHeader from '@/components/table-page/BaseHeader.vue';
import BaseTable from '@/components/table-page/BaseTable.vue';
import { $post, $get } from "@/utils/feth";
import {categoryApi, taskConfigApi, verifyName, verifyCode} from '@/api/api';
import {isNumber, validEmail} from "@/utils/validate";
import Rule from "@/type/Rule";
import { confirmDelete, responseMsg } from "@/utils/response";
import TaskConfigInfo from "@/type/TaskConfigInfo";
import SmtpConfig from "@/api/SmtpConfig";
const nodeEmailConfig = require("@/api/nodeEmailConfig.json");

@Component({
  components: {
    BaseHeader,
    BaseTable,
  },
})
export default class TaskConfig extends Vue {

  get currentUserName() {
    return Vue.prototype._user && Vue.prototype._user.name ? Vue.prototype._user.name : '';
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
  public taskConfigInfoRules = {
    authUser: [new Rule({ message: "authUser不能为空" })],
    authPass: [new Rule({ message: "authPass不能为空" })],
    service: [new Rule({ message: "service不能为空" })],
    ignoreTLS: [new Rule({ message: "ignoreTLS不能为空" })],
    isDefault: [new Rule({ message: "是否默认不能为空" })],
    status: [new Rule({ message: "状态不能为空" })],
    name: [new Rule({ message: "名称不能为空" })],
    host: [new Rule({ message: "host不能为空" })],
    port: [new Rule({ message: "port不能为空" })],
  };
  public organUserRules = {
    orId: [new Rule({ message: "组织不能为空" })],
  };
  public $refs!: {
    form: HTMLFormElement;
    form1: HTMLFormElement;
  };
  public tableColumn = [
    { prop: "name", label: "名称", width: 120 },
    { prop: "operateUser", label: "创建者", width: 120 },
    { prop: "host", label: "域名", width: 120 },
    { prop: "port", label: "端口", width: 120 },
    { prop: "secure", label: "安全策略", width: 120 },
    { prop: "service", label: "服务" },
    { prop: "ignoreTLSLabel", label: "ignoreTLS" },
    { prop: "authUser", label: "用户" },
    { prop: "statusLabel", label: "状态" },
    { prop: "isDefaultLabel", label: "是否默认" },
  ];
  public taskConfigInfo = new TaskConfigInfo();
  public tableData = [];
  public serviceList = SmtpConfig;
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
  public categoryId: any = "";
  public authTreeData: any = [];
  public horizontal: boolean =  false;
  public collapsable: boolean = true;
  public expandAll: boolean = false;
  private isDisabled: boolean = false;

  @Watch("currentPage", { deep: true, immediate: false })
  public currentPageChange(val: any, oldVal: any) {
    this.getData();
  }
  public editRow(data: any) {
    this.dialogVisible = true;
    this.isDisabled = false;
    this.dialogTitle = data != "editRow" ? "编辑配置" : "新增配置";
    if (data != "editRow") {
      this.categoryId = data.row.id;
      this.formEditFlag = true;
      this.getConfigInfo(data.row);
    }else {
      this.taskConfigInfo = new TaskConfigInfo()
    }
  }

  public deleteRow(data: any) {
    const ids = data == "deleteRow" ? this.selectedRow : [data.row.id];
    if (ids.length < 1 || ids === null) {
      this.$message({
        message: "请先选择要删除的数据！",
        type: "warning",
      });
      return false;
    }
    confirmDelete(taskConfigApi.delete.url, this.getData, { id: ids, isDeleteChild: 1 });
  }

  /**
   * service修改
   */
  public serviceChange(value: string) {
    if (nodeEmailConfig[value]) {
      const {host, port, secure } = nodeEmailConfig[value]
      this.taskConfigInfo.host = host;
      this.taskConfigInfo.port = port;
      this.taskConfigInfo.secure = secure || null;
    }
  }

  /**
   * 当前行是否可删除
   * @param row {object}
   * @returns {boolean}
   */
  public allowDeleteData(row: any) {
    if (row.parentId === -1 || row.num !== 0 ) {
      return false;
    }
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
    const response: any = await $post(taskConfigApi.list.url, {page: this.currentPage, pageSize: this.pageSize, name: this.query.queryStr});
    this.total = (response.data && response.data.data.count) || 0;
    this.tableData =
      response.data && response.data.data ? response.data.data : [];
    this.tableData.forEach((item: any) => {
      item.editFlag = 1;
      item.ignoreTLSLabel = item.ignoreTLS === 1 ? '开启' : '关闭';
      item.statusLabel = item.status === 1 ? '开启' : '关闭';
      item.isDefaultLabel = item.isDefault === 1 ? '是' : '否';
      item.secure = item.secure ? item.secure : '';
      item.host = item.host ? item.host : '';
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

  /**
   * 处理功能列表
   */
  private dealCtegoryListData(data: any) {
    const res = data.map((item: TaskConfigInfo) => {
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
    // this.taskConfigInfo = new TaskConfigInfo();
  }

  /**
   * 弹窗取消
   */
  private async cancelFun() {
    this.dialogVisible = false;
    this.categoryId = "";
    this.formEditFlag = false;
    this.dialogUserVisible = false;
    // this.taskConfigInfo = new TaskConfigInfo();
    await this.getData();
  }

  /**
   * 弹窗确认
   */
  public async okFun() {
    let params: any;
    let api: string = "";
    console.log(this.taskConfigInfo)
    if (this.dialogTitle.indexOf("新增") > -1) {
      params = { ...this.taskConfigInfo };
      api = taskConfigApi.add.url;
    } else {
      params = { ...this.taskConfigInfo, id: this.categoryId };
      api = taskConfigApi.update.url;
    }
    console.log(params);
    this.$refs.form.validate(async (valid: boolean) => {
      if (!valid) return false;
      $post(verifyName.api, {name: params.name, type: 'email'}).then(async (response: any) => {
        if (!response && this.dialogTitle.indexOf("新增") > -1) {
          this.$message.warning('配置名已占用');
        } else {
          const res: any = await $post(api, params);
          responseMsg(res.success, this.dialogTitle, this.cancelFun);
        }
      });

    });
  }

  /**
   * 获取配置info
   */
  private async getConfigInfo(data: TaskConfigInfo) {
    this.taskConfigInfo = {
      host: data.host,
      port: data.port,
      secure: data.secure,
      service: data.service,
      authPass: data.authPass,
      name: data.name,
      authUser: data.authUser,
      operateUser: data.operateUser,
      status: Number(data.status),
      isDefault: Number(data.isDefault),
      ignoreTLS: Number(data.ignoreTLS),
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

  private async created() {
    await this.getData();
  }
}
</script>

<style lang="stylus" scoped>
  .options
    >>>.el-input
      .el-input__inner
        height 28px !important
</style>

