const data = {
  name: 'Quan',
  age: '12',
};

const log = () => {
  Object.keys(data).forEach((key) => {
    console.log(key, data[key]);
  });
};

log();
