<template lang="pug">
    .container
        base-header(title="任务列表" @editRow="editRow" :isShowTool="false" :isDelete="false" @deleteRow="deleteRow")
        base-table(:isDealRow="true" :allowDelete="false" :customTable="true" :allowDeleteData="allowDeleteData" :tableData="tableData"  @editRow="editRow" @deleteRow="deleteRow" :handleSelectionChange="handleSelectionChange")
            .search-items(slot="table-tools")
                .search-item
                    el-input(v-model="query.from" @blur="getData('search')"  @keyup.enter.native="getData('search')" placeholder="请输入发送者" size="mini" suffix-icon="el-icon-search")
                    el-input(v-model="query.to" @blur="getData('search')"  @keyup.enter.native="getData('search')" placeholder="请输入接收者" size="mini" suffix-icon="el-icon-search")
                    el-input(v-model="query.taskCode" @blur="getData('search')"  @keyup.enter.native="getData('search')" placeholder="请输入任务编号" size="mini" suffix-icon="el-icon-search")
                    el-select(v-model="query.isDelay" placeholder="是否延时任务" size="mini" @change="getData('search')")
                        el-option(label="是否延时任务" value="4" :key="3" :disabled="true")
                        el-option(label="全部" value="" :key="322358748")
                        el-option(label="否" :value="0" :key="14")
                        el-option(label="是" :value="1" :key="2")
                    el-select(v-model="query.taskType" placeholder="任务类型" size="mini" @change="getData('search')")
                        el-option(label="任务类型" value="4" :key="31" :disabled="true")
                        el-option(label="全部" value="" :key="311")
                        el-option(label="邮件" :value="1" :key="522")
                        el-option(label="短信" :value="2" :key="4552")
                        el-option(label="socket" :value="3" :key="4")
                    el-select(v-model="query.status" placeholder="状态" size="mini" @change="getData('search')")
                        el-option(label="任务状态" value="4" :key="3565" :disabled="true")
                        el-option(label="全部" value="" :key="3111")
                        el-option(label="未执行" :value="0" :key="55")
                        el-option(label="执行中" :value="1" :key="552")
                        el-option(label="执行成功" :value="2" :key="4544")
                        el-option(label="执行失败" :value="3" :key="5666")
                        el-option(label="任务取消" :value="4" :key="8886")
                    el-date-picker(v-model="query.endTime" @change="getData('search')" format="yyyy-MM-dd HH:mm:ss" value-format="timestamp" placeholder="选择任务最后执行时间" type="datetime" size="mini")
            .div(slot="custom-table")
                el-table(:data="tableData" border size="mini" ref="dataTable" @selection-change="handleSelectionChange")
                    el-table-column(type="selection" width="50" align="center" :selectable="allowDeleteData")
                    el-table-column(prop="index" label="序号" type="index" align="center" width="80")
                    el-table-column(prop="name" label="名称"  align="center" width="100")
                    el-table-column(prop="taskCode" label="任务编号"  align="center" width="100")
                    el-table-column(prop="operateUser" label="任务启动人员"  align="center")
                    el-table-column(prop="status" label="状态"  align="center")
                        template( slot-scope="scope")
                            span {{statusList[scope.row.status]}}
                    el-table-column(prop="taskType" label="任务类型"  align="center")
                        template( slot-scope="scope")
                            span {{scope.row.taskType == '1' ? '邮件': scope.row.taskType == '2' ? '短信' :scope.row.taskType == '3' ? 'socket': '--'}}
                    el-table-column(prop="taskConfig" label="推送模板"  align="center")
                    el-table-column(prop="executeType" label="执行类型"  align="center")
                        template( slot-scope="scope")
                            span {{scope.row.executeType == '1' ? '单次': scope.row.executeType == '2' ? '循环' : '--'}}
                    el-table-column(prop="isDelay" label="延时任务"  align="center")
                        template( slot-scope="scope")
                            span {{scope.row.isDelay == '1' ? '是': scope.row.isDelay == '0' ? '否' : '--'}}
                    el-table-column(prop="executeCount" label="执行次数"  align="center")
                    el-table-column(prop="maxExecuteCount" label="最大执行次数"  align="center")
                    el-table-column(prop="from" label="发送人员"  align="center")
                    el-table-column(prop="to" label="接收人员"  align="center")
                    el-table-column(prop="endTime" label="最后执行时间"  align="center")
                        template( slot-scope="scope")
                            span {{scope.row.endTime? formatTime(scope.row.endTime): '--'}}
                    el-table-column(label="操作"  align="center" width="180")
                        template( slot-scope="scope")
                            a(class="operate edit" v-show="scope.row.taskCode" @click="editRow(scope.row)") 任务日志
                            a(class="operate edit" v-show="scope.row.status >= 2" @click="deleteRow(scope.row)") 删除
                            a(class="operate edit" v-show="scope.row.status < 2" @click="cancleRow(scope.row)") 取消
            el-pagination(slot="table-pagination" @size-change="handleSizeChange" :current-page.sync="currentPage"
                :page-size="pageSize"  layout="total, sizes, prev, pager, next, jumper" :total="total")
        el-dialog(:visible.sync="dialogVisible" @close="dialogClose" width="600px")
            span(slot="title") 任务日志
            div(style="height: 450px;overflow: auto; padding: 0")
                el-scrollbar(style="height:100%;")
                    vue-json-editor(v-model="logging" style="height: 100%" :show-btns="false" :mode="'code'" lang="zh")
</template>

<script lang="ts">
import { Vue, Prop, Watch, Emit, Component } from "vue-property-decorator";
import BaseHeader from '@/components/table-page/BaseHeader.vue';
import BaseTable from '@/components/table-page/BaseTable.vue';
import { $post, $get } from "@/utils/feth";
import {categoryApi, taskApi, taskLogApi} from '@/api/api';
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
export default class TaskList extends Vue {
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
    '任务取消',
  ];
  public logging: any = [];
  public jsoneditor: any = null;
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
    taskCode: ''
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
    this.getConfigInfo(data);
  }

  public deleteRow(data: any) {
    const ids = data == "deleteRow" ? this.selectedRow : [data.id];
    if (ids.length < 1 || ids === null) {
      this.$message({
        message: "请先选择要删除的数据！",
        type: "warning",
      });
      return false;
    }
    confirmDelete(taskApi.delete.url, this.getData, {id : data.id });
  }

  /**
   * 任务取消
   */
  public async  cancleRow(row: any) {
      const type = row.taskType;
      try {
          const res: any = await $post(taskApi.cancle.url, {taskCode: row.taskCode, id: row.id});
          if (res && res.data) {
              this.$message.success('任务取消成功');
              this.getData();
          } else {
              this.$message.error('任务取消失败');
          }
      } catch (e) {
          this.$message.error('任务取消失败');
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
    const response: any = await $post(taskApi.list.url, {
      page: this.currentPage,
      pageSize: this.pageSize,
      from: this.query.from,
      to: this.query.to,
      taskType: this.query.taskType,
      isDelay: this.query.isDelay,
      endTime: this.query.endTime,
      status: this.query.status,
      taskCode: this.query.taskCode
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
      api = taskApi.add.url;
    } else {
      params = { ...this.taskConfigInfo, id: this.categoryId };
      api = taskApi.update.url;
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
  private async getConfigInfo(data: any) {
    if (data.taskCode) {
      const res: any = await $post(taskLogApi.info.url, {taskCode: data.taskCode});
      let logging: any[] = [];
      logging = res.success && res.data ? res.data : [];
      this.logging = logging;
    }
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
<style lang="stylus">
    .jsoneditor-vue
        height 440px !important
</style>

