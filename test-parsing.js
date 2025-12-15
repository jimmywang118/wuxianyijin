// 测试解析功能
const fs = require('fs');
const XLSX = require('xlsx');

// 模拟解析函数
function parseCitiesExcel(filePath) {
  try {
    // 读取文件
    const fileData = fs.readFileSync(filePath);

    // 解析Excel
    const workbook = XLSX.read(fileData, { type: 'buffer' });
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];

    // 使用 raw: true 获取原始值
    const jsonData = XLSX.utils.sheet_to_json(worksheet, { raw: true });

    console.log('=== EXCEL PARSE TEST ===');
    console.log('解析的数据:', jsonData);
    console.log('数据行数:', jsonData.length);

    if (jsonData.length > 0) {
      console.log('\n第一行的所有字段名:', Object.keys(jsonData[0]));
      console.log('\n第一行的完整数据:');
      console.log(JSON.stringify(jsonData[0], null, 2));

      console.log('\n字段检查:');
      console.log('- city_name字段存在:', 'city_name' in jsonData[0]);
      console.log('- city_name的值:', jsonData[0].city_name);
      console.log('- city_name的类型:', typeof jsonData[0].city_name);

      // 验证数据
      const cityName = jsonData[0].city_name;
      console.log('\n验证检查:');
      console.log('- cityName值:', cityName);
      console.log('- 是否为空:', !cityName);
      console.log('- 是否不是字符串:', typeof cityName !== 'string');
      console.log('- trim后是否为空:', cityName ? cityName.trim() === '' : 'N/A');
    }
    console.log('=== END TEST ===\n');

    return jsonData;
  } catch (error) {
    console.error('解析失败:', error);
    return [];
  }
}

// 测试生成的文件
console.log('测试 cities_test.xlsx:');
parseCitiesExcel('./cities_test.xlsx');

console.log('\n测试 cities_example.xlsx:');
parseCitiesExcel('./cities_example.xlsx');