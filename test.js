const obj = '{"name":"foo","age":"bar"}';
const str = 'hello world';

try {
  console.log(JSON.parse(str));
  // console.log(JSON.parse(JSON.stringify(obj)));
} catch (error) {
  console.log('error');
}
