const testfnc = async (data) => {
  try {
    if (data === 1) {
      console.log('data =', 1);
    } else if (typeof data !== 'number') {
      throw new Error('data must be a number');
    }
    console.log('processing...');
  } catch (error) {
    console.error('catch an error: ', error);
  }
};

testfnc(1);
testfnc('haha');
