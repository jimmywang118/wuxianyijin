const XLSX = require('xlsx');

// 创建与用户截图完全一致的数据结构
const data = [
  {
    id: 1,
    city_name: '北京',
    year: '2024',
    base_min: 6326,
    base_max: 33891,
    rate: 0.14
  },
  {
    id: 2,
    city_name: '上海',
    year: '2024',
    base_min: 7310,
    base_max: 36549,
    rate: 0.14
  },
  {
    id: 3,
    city_name: '广州',
    year: '2024',
    base_min: 5284,
    base_max: 26421,
    rate: 0.14
  },
  {
    id: 4,
    city_name: '深圳',
    year: '2024',
    base_min: 5284,
    base_max: 26421,
    rate: 0.14
  }
];

// 创建工作簿
const wb = XLSX.utils.book_new();
const ws = XLSX.utils.json_to_sheet(data);

// 设置列宽以匹配截图
ws['!cols'] = [
  { wch: 8 },  // id列
  { wch: 15 }, // city_name列
  { wch: 10 }, // year列
  { wch: 12 }, // base_min列
  { wch: 12 }, // base_max列
  { wch: 10 }  // rate列
];

XLSX.utils.book_append_sheet(wb, ws, '城市社保标准');
XLSX.writeFile(wb, 'cities_test.xlsx');

console.log('已创建 cities_test.xlsx');
console.log('数据结构:');
console.log('列名:', Object.keys(data[0]));
console.log('第一条数据:', data[0]);

// 验证读取是否正确
const wbRead = XLSX.readFile('cities_test.xlsx');
const wsRead = wbRead.Sheets[wbRead.SheetNames[0]];
const readData = XLSX.utils.sheet_to_json(wsRead);

console.log('\n读取验证:');
console.log('读取的列名:', Object.keys(readData[0] || {}));
console.log('读取的第一条数据:', readData[0]);
console.log('city_name值:', readData[0].city_name);
console.log('city_name类型:', typeof readData[0].city_name);