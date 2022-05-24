'use strict';
class User {
  constructor(name) {
    this.name = name;
  }
  getName = async () => {
    console.log(this.name);
  };
}

const Quan = new User('Quan');
Quan.getName();
