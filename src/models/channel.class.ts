export class Channel {
    channelId: string;
    users:any;
    name:string;
    description:string;
    author:string;


  constructor(obj?:any){
    this.channelId = obj ? obj.channelId : '';
    this.users = obj ? obj.id : [];
    this.name = obj ? obj.channelName : '';
    this.description = obj ? obj.channelDescription : '';
    this.author = obj ? obj.author : 'Admin';
  
  }

  public toJSON(){
      return{
        channelId: this.channelId,
        name: this.name,
        description: this.description,
        users: this.users,
        author: this.author,
      }
  }
}