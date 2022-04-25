const regex = /(?<=:)[^\:\s]*$/gm

const test = regex.exec('Contact:MasterRecord:Birthday__c');
console.log(test);
