export class Channel {
  users:any;
  name:string;
  description:string;
  author:string;


  constructor(obj?:any){
      this.users = obj ? obj.id : [];
      this.name = obj ? obj.channelName : '';
      this.description = obj ? obj.channelDescription : '';
      this.author = obj ? obj.author : 'Admin';
  
  }

  public toJSON(){
      return{
          name: this.name,
          description: this.description,
          users: this.users,
          author: this.author,
      }
  }
}