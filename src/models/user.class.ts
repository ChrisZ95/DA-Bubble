export class User {
  name: string;
  email: string;
  password: string;
  privacyPolice: boolean;
  uid: string;

  constructor(obj?: any) {
    this.name = obj ? obj.name : '';
    this.email = obj ? obj.email : '';
    this.password = obj ? obj.password : '';
    this.privacyPolice = obj ? obj.PrivacyPolice : '';
    this.uid = obj ? obj.uid : '';
  }

  public toJson() {
    return {
      name: this.name,
      email: this.email,
      password: this.password,
      privacyPolice: this.privacyPolice,
      uid: this.uid,
    };
  }
}
