<template lang="pug">
    .container.flex.fz-18
        span 消息推送平台V1.1
        .up-right
            el-dropdown.login(@command='userAction')
                img.avatar(src="~assets/images/avatar.png")
                el-dropdown-menu(slot='dropdown')
                    el-dropdown-item(command='logout') 登出
                    el-dropdown-item(command='help') 使用帮助
        el-dialog(:visible.sync="dialogVisible" lock-scroll fullscreen append-to-body)
            el-scrollbar(style="height:100%;")
                div(v-html="helpHtml")
</template>

<script lang="ts">
import { Vue, Prop, Watch, Emit, Component } from "vue-property-decorator";
import {MimeStorage} from "@/utils/localStorage";
import {$get, $post} from "@/utils/feth";
@Component
export default class Header extends Vue {
  private mineLocalStore = new MimeStorage();
  private dialogVisible: boolean = false;
  private helpHtml: string = '';
  private token: string = '';

  @Emit('pushChangePassword')
  public pushChangePassword(): any {
    return 'pushChangePassword';
  }

  @Emit('userCenter')
  public userCenter(): any {
    return 'userCenter';
  }

  private userAction(val: string) {
    console.log(val);
    console.log(4444);
    switch (val) {
      case 'logout':
        this.loginOut();
        break;
      case 'notice':
        this.pushNotice();
        break;
      case 'changePassword':
        this.pushChangePassword();
        break;
      case 'userCenter':
        this.userCenter();
        break;
      case 'help':
        this.getHelp();
        break;
      default:
        return;
    }
  }
  private loginOut() {
    this.mineLocalStore.removeItem('token');
    window.location.reload();
  }

  @Emit('help')
  private async getHelp() {
    console.log('获取帮助');
    try {
      const res: any = await $get('/help/info', {token: this.token});
      console.log(res);
      this.dialogVisible = true;
      this.helpHtml = res;
    } catch (e) {
      console.log(e);
    }
    return 'userCenter';
  }
  private pushNotice() {
    this.$router.push('/noticeManage/userNoticeList');
  }

  private async created() {
    const mimeStorage = new MimeStorage();
    const token: any = mimeStorage.getItem('token');
    this.token = token;
  }


}
</script>

<style lang="stylus" scoped>
    .container
        height 100%
        width 100%
        display flex
        justify-content space-between
        p
            line-height 48px
            display block
            font-size 16px
</style>
