export class Channel {
  id: string;
  channelName: string;
  channelDescription: string;
  channelMember: {
      username: string
  }[];

  constructor(obj?: any) {
    this.id = obj && obj.id ? obj.id : undefined;
    this.channelName = obj ? obj.channelName : '';
    this.channelDescription = obj ? obj.channelDescription : '';
    this.channelMember = obj?.channelMember || [];
  }

  static create(obj?: any): Channel {
    return new Channel(obj);
  }

  toJson() {
    return {
      channelName: this.channelName,
      channelDescription: this.channelDescription,
      channelMember : this.channelMember
    };
  }
}