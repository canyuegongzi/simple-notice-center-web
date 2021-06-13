<template lang="pug">
    .container.mg0
        form-page-head(:pageTitle="pageTitle" :isShowButton="false" @goBack="goBack")
        el-form(:model="peakConfigInfo" :rules="addTaskInfoRules" ref="form" label-width="250px" class="demo-ruleForm" size="mini")
            // el-row(type="flex" justify="center" :gutter="0")
            //     el-col(:span="12")
            //         el-form-item(label="kafka配置：" prop="KAFKA_CONFIG")
            //             el-input(v-model="peakConfigInfo.KAFKA_CONFIG" size="mini" placeholder="请输入kafka配置")
            el-row(type="flex" justify="center" :gutter="0")
                el-col(:span="12")
                    el-form-item(label="最大循环延时并发量：" prop="MAX_ING_TASK")
                        el-input-number(v-model="peakConfigInfo.MAX_ING_TASK" :min="1" :max="100" size="mini")
            el-row(type="flex" justify="center" :gutter="0")
                el-col(:span="12")
                    el-form-item(label="最大短信推送次数(体验)：" prop="MAX_MESSAGE_TOOT_CONFIG_NUM")
                        el-input-number(v-model="peakConfigInfo.MAX_MESSAGE_TOOT_CONFIG_NUM" :min="1" :max="100" size="mini")
            el-row(type="flex" justify="center" :gutter="0")
                el-col(:span="12")
                    el-form-item(label="最大邮件推送次数(体验)：" prop="MAX_EMAIL_TOOT_CONFIG_NUM")
                        el-input-number(v-model="peakConfigInfo.MAX_EMAIL_TOOT_CONFIG_NUM" :min="1" :max="100" size="mini")
            el-row(type="flex" justify="center" :gutter="0" v-if="currentUserInfo.name === 'root'")
                el-col(:span="12")
                    .footer
                        el-button(type="primary" @click="okFun" size="mini") 确定
                        el-button(@click="cancelFun" size="mini") 重置
</template>

<<script lang="ts">
import {MimeStorage} from "@/utils/localStorage";
import { Vue, Component } from "vue-property-decorator";
import Rule from "@/type/Rule";
import BaseHeader from "@/components/table-page/BaseHeader.vue";
import BaseTable from "@/components/table-page/BaseTable.vue";
import { $post} from "@/utils/feth";
import {appKeyApi} from "@/api/api";
import FormPageHead from "@/components/form/FormPageHead.vue";
import PeakConfigInfo from "@/type/PeakConfig";
@Component({
  components: {
    BaseHeader,
    BaseTable,
    FormPageHead,
  },
})
export default class PeakConfig extends Vue {
  public peakConfigInfo: PeakConfigInfo = new PeakConfigInfo();
  public currentRow: any;
  public pageTitle: string = '其他配置';
  public addTaskInfoRules = {
    MAX_ING_TASK: [
      new Rule({message: 'MAX_ING_TASK不能为空'}),
    ],
    MAX_MESSAGE_TOOT_CONFIG_NUM: [
      new Rule({message: 'MAX_MESSAGE_TOOT_CONFIG_NUM不能为空'}),
    ],
    MAX_EMAIL_TOOT_CONFIG_NUM: [
      new Rule({message: 'MAX_EMAIL_TOOT_CONFIG_NUM不能为空'}),
    ],
  };
  public $refs!: {
    form: HTMLFormElement,
    form1: HTMLFormElement,
  };
  public formInfo: any =  null;
  public hoursTimeList: any =  [];
  public appList: any =  [];
  public id: number | string = '';
  public loading: any = null;
  public query: any = {
    queryStr:  '',
  };
  private token: any;
  private currentUserInfo: any = {name: ''};

  public goBack()  {
    this.$router.back();
  }

  public cancelFun() {}
  public async getUserInfo() {
    try {
      const res: any = await $post('/user/findUserToken', {token: this.token}, 'scus');
      this.currentUserInfo = res.data;
    } catch (e) {
      console.log(e);
    }
  }

  /**
   * 添加任务
   */
  private async okFun() {
    let params: any;
    params = { ...this.peakConfigInfo };
    this.$refs.form.validate(async (valid: boolean) => {
      if (!valid) {
        return false;
      }
      const res: any = await $post(appKeyApi.systemConfigEdit.url, params);
      if (res.success) {
        this.$message({
          message: '操作成功',
          type: "success",
          center: true,
        });
        this.getConfigInfo();
      } else {
        this.$message({
          message: '操作失败',
          type: "error",
          center: true,
        });
      }
      this.loading.close();
    });
  }
  private async getConfigInfo() {
    try {
      const res: any = await $post(appKeyApi.systemConfigInfo.url, {});
      this.peakConfigInfo = res.data ? res.data : new PeakConfigInfo();
      console.log(res);
    } catch (e) {
      this.peakConfigInfo = new PeakConfigInfo();
    }
  }
  private async created() {
    const mimeStorage = new MimeStorage();
    const token: any = mimeStorage.getItem('token');
    this.token = token;
    await this.getConfigInfo();
    await this.getUserInfo();
  }
}
</script>

<style scoped lang="stylus">
    .footer
        justify-content center
        display flex
        margin-top 32px
        margin-bottom 32px
    .demo-ruleForm
        margin-top 32px
</style>
