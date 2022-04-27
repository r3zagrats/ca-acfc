const input = `
  'Bạn đã gởi thông tin cho OA White Space JCS với nội dung:\n' +
  'Họ và Tên: A\n' +
  'Điện thoại: 84382555015\n' +
  'Địa chỉ: A, quận Phú Nhuận, Hồ Chí Minh'
`;
const nameRegex = /(?<=Họ và Tên: ).*/gm;
const phoneRegex = /(?<=Điện thoại: ).*/gm;
const addressRegex = /(?<=Địa chỉ: ).*/gm;

if (nameRegex.exec(input) && phoneRegex.exec(input) && addressRegex.exec(input)) {
  nameRegex.lastIndex = 0
  phoneRegex.lastIndex = 0
  addressRegex.lastIndex = 0
  console.log(nameRegex.exec(input)[0]);
  console.log(phoneRegex.exec(input)[0]);
  console.log(addressRegex.exec(input)[0]);
}
