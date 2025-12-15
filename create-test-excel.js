const XLSX = require('xlsx');

// 创建城市社保标准示例数据
function createCitiesExample() {
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
    }  ];

  const ws = XLSX.utils.json_to_sheet(data);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, '城市社保标准');
  XLSX.writeFile(wb, 'cities_example.xlsx');
  console.log('已创建 cities_example.xlsx，包含字段顺序：id, city_name, year, base_min, base_max, rate');
}

// 创建员工工资示例数据
function createSalariesExample() {
  const data = [
    {
      employee_id: '0001',
      employee_name: '张三',
      month: '202401',
      salary_amount: 10000
    },
    {
      employee_id: '0002',
      employee_name: '李四',
      month: '202401',
      salary_amount: 12000
    },
    {
      employee_id: '0003',
      employee_name: '王五',
      month: '202401',
      salary_amount: 8000
    },
    {
      employee_id: '0001',
      employee_name: '张三',
      month: '202402',
      salary_amount: 10000
    },
    {
      employee_id: '0002',
      employee_name: '李四',
      month: '202402',
      salary_amount: 12000
    }
  ];

  const ws = XLSX.utils.json_to_sheet(data);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, '员工工资');
  XLSX.writeFile(wb, 'salaries_example.xlsx');
  console.log('已创建 salaries_example.xlsx');
}

// 创建示例文件
createCitiesExample();
createSalariesExample();