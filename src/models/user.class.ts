export class User {
  name: string;
  email: string;
  password: string;

  constructor(obj?: any) {
    this.name = obj ? obj.name : '';
    this.email = obj ? obj.email : '';
    this.password = obj ? obj.password : '';
  }

  public toJson() {
    return {
      name: this.name,
      email: this.email,
      password: this.password,

    }
  }
}
