<template lang="pug">
  .container
    base-header(title="短信推送配置" @editRow="editRow" :isDelete="false" @deleteRow="deleteRow")
    base-table(:dataFormat="tableColumn" :allowDeleteData="allowDeleteData" :tableData="tableData"  @editRow="editRow" @deleteRow="deleteRow" :handleSelectionChange="handleSelectionChange")
      .search-items(slot="table-tools")
        .search-item
          el-input(v-model="query.queryStr" @blur="getData('search')"  @keyup.enter.native="getData('search')" placeholder="请输入配置名称搜索" size="mini" suffix-icon="el-icon-search")
    el-dialog(:visible.sync="dialogVisible" :close-on-click-modal="false" v-if="dialogVisible" @close="dialogClose" width="550px")
      span(slot="title") {{dialogTitle}}
      div(style="height: 380px;overflow: auto; padding: 0")
        el-scrollbar(style="height:100%;")
          el-form(:model="taskMessageConfigInfo" :disabled="isDisabled" :rules="taskMessageConfigInfoRules" ref="form" label-width="150px" class="input-width")
            el-form-item(label="名称：" prop="name")
                el-input(v-model="taskMessageConfigInfo.name" :disabled="dialogTitle.indexOf('编辑' )> -1"  size="mini" placeholder="请输入名称" )
            el-form-item(label="secretAccessKey：" prop="secretAccessKey")
              el-input(v-model="taskMessageConfigInfo.secretAccessKey" size="mini" placeholder="请输入secretAccessKey" )
            el-form-item(label="accessKeyId：" prop="accessKeyId")
                el-input(v-model="taskMessageConfigInfo.accessKeyId" size="mini" placeholder="请输入accessKeyId" )
            el-form-item(label="签名：" prop="signName")
                el-input(v-model="taskMessageConfigInfo.signName" size="mini" placeholder="请输入signName" )
                  div(slot="append")
                      el-tooltip(class="item" effect="dark" content="阿里云短信推送签名" placement="top-start")
                        i.el-icon-info
            el-form-item(label="模板：" prop="templateCode")
                el-input(v-model="taskMessageConfigInfo.templateCode" size="mini" placeholder="请输入templateCode" )
                  div(slot="append")
                      el-tooltip(class="item" effect="dark" content="阿里云短信推送模板code" placement="top-start")
                        i.el-icon-info
            el-form-item(label="参数说明：" prop="paramsNote")
                el-input(v-model="taskMessageConfigInfo.paramsNote" size="mini" placeholder="请输入推送数据参数说明" )
            el-form-item(label="状态：" prop="status")
                el-radio-group(v-model="taskMessageConfigInfo.status"  size="mini")
                    el-radio(:label="1") 开启
                    el-radio(:label="0") 关闭
            el-form-item(label="是否默认：" prop="isDefault" )
                el-radio-group(v-model="taskMessageConfigInfo.isDefault"  size="mini" :disabled="true")
                    el-radio(:label="1") 是
                    el-radio(:label="0") 否
      div(slot="footer")
        el-button(@click="cancelFun" size="mini") 取消
        el-button(type="primary" @click="okFun" size="mini"  :disabled="isDisabled") 确定
</template>

<script lang="ts">
import { Vue, Prop, Watch, Emit, Component } from "vue-property-decorator";
import BaseHeader from '@/components/table-page/BaseHeader.vue';
import BaseTable from '@/components/table-page/BaseTable.vue';
import { $post } from "@/utils/feth";
import {taskMessageConfigApi, verifyName} from '@/api/api';
import {isNumber} from "@/utils/validate";
import Rule from "@/type/Rule";
import SelectOption from "@/type/SelectOption";
import { confirmDelete, responseMsg } from "@/utils/response";
import TaskMessageConfigInfo from "@/type/TaskMessageConfigInfo";
@Component({
  components: {
    BaseHeader,
    BaseTable,
  },
})
export default class TaskMessageConfig extends Vue {

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
  public taskMessageConfigInfoRules = {
    signName: [new Rule({ message: "signName不能为空" })],
    accessKeyId: [new Rule({ message: "accessKeyId不能为空" })],
    secretAccessKey: [new Rule({ message: "secretAccessKey不能为空" })],
    status: [new Rule({ message: "状态不能为空" })],
    paramsNote: [new Rule({ message: "参数说明不能为空" })],
    name: [
      new Rule({ message: "名称不能为空" }),
    ],
    templateCode: [new Rule({ message: "模板不能为空" })],
  };
  public organUserRules = {
    orId: [new Rule({ message: "组织不能为空" })],
  };
  public $refs!: {
    form: HTMLFormElement;
    form1: HTMLFormElement;
  };
  public tableColumn = [
    { prop: "name", label: "名称"},
    { prop: "signName", label: "签名" },
    { prop: "templateCode", label: "模板"},
    { prop: "statusLabel", label: "状态" },
    { prop: "isDefaultLabel", label: "是否默认" },
    { prop: "paramsNote", label: "参数说明" },
  ];
  public taskMessageConfigInfo = new TaskMessageConfigInfo();
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
  public dialogTitle: string = "";
  public formEditFlag: boolean = false;
  public userSelectOptions: SelectOption[] = [];
  public organizationSelectOptions: SelectOption[] = [];
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
    confirmDelete(taskMessageConfigApi.delete.url, this.getData, { id: ids, isDeleteChild: 1 });
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
    const response: any = await $post(taskMessageConfigApi.list.url, {
      page: this.currentPage,
      pageSize: this.pageSize,
      name: this.query.queryStr,
    });
    this.total = (response.data && response.data.data.count) || 0;
    this.tableData =
      response.data && response.data.data ? response.data.data : [];
    this.tableData.forEach((item: any) => {
      item.editFlag = 1;
      item.ignoreTLSLabel = item.ignoreTLS === 1 ? '开启' : '关闭';
      item.statusLabel = item.status === 1 ? '开启' : '关闭';
      item.isDefaultLabel = item.isDefault === 1 ? '是' : '否';
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
    const res = data.map((item: TaskMessageConfigInfo) => {
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
    this.taskMessageConfigInfo = new TaskMessageConfigInfo();
  }

  /**
   * 弹窗取消
   */
  private async cancelFun() {
    this.dialogVisible = false;
    this.categoryId = "";
    this.formEditFlag = false;
    this.dialogUserVisible = false;
    this.taskMessageConfigInfo = new TaskMessageConfigInfo();
    await this.getData();
  }

  /**
   * 弹窗确认
   */
  private async okFun() {
    let params: any;
    let api: string = "";
    if (this.dialogTitle.indexOf("新增") > -1) {
      params = { ...this.taskMessageConfigInfo };
      api = taskMessageConfigApi.add.url;
    } else {
      params = { ...this.taskMessageConfigInfo, id: this.categoryId };
      api = taskMessageConfigApi.update.url;
    }
    this.$refs.form.validate(async (valid: boolean) => {
      if (!valid) {
        return false;
      }
      $post(verifyName.api, {name: this.taskMessageConfigInfo.name, type: 'message'}).then(async (response: any) => {
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
  private async getConfigInfo(data: TaskMessageConfigInfo) {
    this.taskMessageConfigInfo = {
      name: data.name,
      accessKeyId: data.accessKeyId,
      signName: data.signName,
      templateCode: data.templateCode,
      secretAccessKey: data.secretAccessKey,
      paramsNote: data.paramsNote,
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

