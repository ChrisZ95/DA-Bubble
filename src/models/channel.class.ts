export class Channel {
    channelName: string;
    channelDescription: string;
    channelMember: {
        userId: string
    }[];
  
    constructor(obj?: any) {
      this.channelName = obj ? obj.channelName : '';
      this.channelDescription = obj ? obj.channelDescription : '';
      this.channelMember = obj && obj.channelMember ? obj.channelMember : [{
        userId: ''
    }]
    }
  
    toJson() {
      return {
        channelName: this.channelName,
        channelDescription: this.channelDescription,
        channelMember : this.channelMember
      };
    }
  }