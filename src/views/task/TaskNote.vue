<template lang="pug">
    .container
        base-header(title="推送日志" :isShowTool="false" @editRow="editRow" :isDelete="false" @deleteRow="deleteRow")
        base-table(:dataFormat="tableColumn" :isDealRow="true" :allowDelete="true" :customTable="true" :allowDeleteData="allowDeleteData" :tableData="tableData"  @editRow="editRow" @deleteRow="deleteRow" :handleSelectionChange="handleSelectionChange")
            .search-items(slot="table-tools")
                .search-item
                    el-input(v-model="query.to" @blur="getData('search')"  @keyup.enter.native="getData('search')" placeholder="请输入接收对象搜索" size="mini" suffix-icon="el-icon-search")
                    el-date-picker(v-model="query.endTime" @change="getData('search')" format="yyyy-MM-dd HH:mm:ss" value-format="timestamp" placeholder="选择任务最后执行时间" type="datetime" size="mini")
            .div(slot="custom-table")
                el-table(:data="tableData" border size="mini"  ref="dataTable" @selection-change="handleSelectionChange")
                    // el-table-column(type="selection" v-if="allowDelete" width="50" align="center" :selectable="allowDeleteData")
                    el-table-column(prop="index" label="序号" type="index" align="center" width="80")
                    el-table-column(prop="taskCode" label="关联任务" align="center" width="140")
                    el-table-column(prop="isSuccess" label="执行结果"  align="center" width="140")
                        template( slot-scope="scope")
                            span {{scope.row.isSuccess ? '成功': '失败'}}
                    el-table-column(prop="from" label="发送人员"  align="center")
                    el-table-column(prop="to" label="接收人员"  align="center")
                    el-table-column(prop="endTime" label="最后执行时间"  align="center")
                        template( slot-scope="scope")
                            span {{scope.row.endTime? formatTime(scope.row.endTime): '--'}}
            el-pagination(slot="table-pagination" @size-change="handleSizeChange" :current-page.sync="currentPage"
                :page-size="pageSize"  layout="total, sizes, prev, pager, next, jumper" :total="total")
</template>

<script lang="ts">
import { Vue, Prop, Watch, Emit, Component } from "vue-property-decorator";
import BaseHeader from '@/components/table-page/BaseHeader.vue';
import BaseTable from '@/components/table-page/BaseTable.vue';
import { $post, $get } from "@/utils/feth";
import { categoryApi, taskLogApi} from '@/api/api';
import {isNumber, validEmail} from "@/utils/validate";
import Rule from "@/type/Rule";
import SelectOption from "@/type/SelectOption";
import { confirmDelete, responseMsg } from "@/utils/response";
import TaskConfigInfo from "@/type/TaskConfigInfo";
import moment from "moment";
@Component({
  components: {
    BaseHeader,
    BaseTable,
  },
})
export default class TaskNote extends Vue {
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
  public statusList = [
    '未执行',
    '执行中',
    '执行成功',
    '执行失败',
    '取消任务',
  ];
  public taskConfigInfoRules = {
    authUser: [new Rule({ message: "authUser不能为空" })],
    authPass: [new Rule({ message: "authPass不能为空" })],
    service: [new Rule({ message: "service不能为空" })],
    ignoreTLS: [new Rule({ message: "ignoreTLS不能为空" })],
    isDefault: [new Rule({ message: "是否默认不能为空" })],
    status: [new Rule({ message: "状态不能为空" })],
    name: [new Rule({ message: "名称不能为空" })],
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
    { prop: "host", label: "host", width: 120 },
    { prop: "port", label: "port", width: 120 },
    { prop: "secure", label: "secure", width: 120 },
    { prop: "service", label: "service" },
    { prop: "ignoreTLSLabel", label: "ignoreTLS" },
    { prop: "authUser", label: "authUser" },
    { prop: "authPass", label: "authPass" },
    { prop: "statusLabel", label: "状态" },
    { prop: "isDefaultLabel", label: "是否默认" },
  ];
  public taskConfigInfo = new TaskConfigInfo();
  public tableData = [];
  public currentPage: number = 1;
  public selectedRow: Array<number | string> = [];
  public pageSize: number = 10;
  public total: number = 0;
  public pageTitle: string = "新增";
  public query: any = {
    from: "",
    to: "",
    taskType: "",
    isDelay: "",
    endTime: "",
    status: '',
    isSuccess: '',
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
  public userSelectOptions: SelectOption[] = [];
  public organizationSelectOptions: SelectOption[] = [];
  public categoryId: any = "";
  public authTreeData: any = [];
  public horizontal: boolean =  false;
  public collapsable: boolean = true;
  public expandAll: boolean = false;

  @Watch("currentPage", { deep: true, immediate: false })
  public currentPageChange(val: any, oldVal: any) {
    this.getData();
  }

  public formatTime(time: any) {
    return moment(Number(time)).format('YYYY-MM-DD HH:mm:ss');
  }
  public editRow(data: any) {
    this.dialogVisible = true;
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
    confirmDelete(taskLogApi.delete.url, this.getData, { id: ids, isDeleteChild: 1 });
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
    const response: any = await $post(taskLogApi.list.url, {
      page: this.currentPage,
      pageSize: this.pageSize,
      to: this.query.to,
      endTime: this.query.endTime,
      isSuccess: this.query.isSuccess,
    });
    this.total = (response.data && response.data.count) || 0;
    this.tableData =
      response.data && response.data.data ? response.data.data : [];
    this.tableData.forEach((item: any) => {
      item.editFlag = 1;
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
    this.taskConfigInfo = new TaskConfigInfo();
  }

  /**
   * 弹窗取消
   */
  private async cancelFun() {
    this.dialogVisible = false;
    this.categoryId = "";
    this.formEditFlag = false;
    this.dialogUserVisible = false;
    this.taskConfigInfo = new TaskConfigInfo();
    await this.getData();
  }

  /**
   * 弹窗确认
   */
  private async okFun() {
    let params: any;
    let api: string = "";
    if (this.dialogTitle.indexOf("新增") > -1) {
      params = { ...this.taskConfigInfo };
      api = taskLogApi.add.url;
    } else {
      params = { ...this.taskConfigInfo, id: this.categoryId };
      api = taskLogApi.update.url;
    }
    this.$refs.form.validate(async (valid: boolean) => {
      if (!valid) {
        return false;
      }
      const res: any = await $post(api, params);
      responseMsg(res.data.success, this.dialogTitle, this.cancelFun);
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
      status: Number(data.status),
      isDefault: Number(data.isDefault),
      ignoreTLS: Number(data.ignoreTLS),
    };
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

