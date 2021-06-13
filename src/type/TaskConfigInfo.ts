export default class TaskConfigInfo {
    public id?: any = '';
    public authUser?: string = '';
    public authPass?: string = '';
    public status?: number = 0;
    public isDefault?: number = 0;
    public host?: string = '';
    public port?: number | null = null;
    public secure?: string = '';
    public name?: string = '';
    public service?: string = '';
    public ignoreTLS?: number = 0;
    public operateUser?: string = '';
}
