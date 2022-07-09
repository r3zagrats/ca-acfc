const middleware = async (callback) => {
  console.log('middleware');
  const res = await callback();
  console.log(res)
};

const greeting = async () => {
  console.log('Hello');
  return true
};

middleware(greeting);
