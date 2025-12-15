import { generateBatchId } from './utils'
import { createClient } from '@supabase/supabase-js'

export interface CalculationResult {
  employee_name: string
  avg_salary: number
  contribution_base: number
  company_fee: number
}

export interface BatchInfo {
  batchId: string
  cityName: string
  totalEmployees: number
  totalCompanyFee: number
}

export async function calculateContributions(cityName: string): Promise<{
  results: CalculationResult[]
  batchInfo: BatchInfo
}> {
  // 1. 生成唯一的批次ID
  const batchId = generateBatchId()

  // 创建 Supabase 客户端
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ''
  const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey)

  try {
    // 2. 获取城市社保标准
    const { data: cityData, error: cityError } = await supabaseAdmin
      .from('cities')
      .select('*')
      .eq('city_name', cityName)
      .order('year', { ascending: false })
      .limit(1)

    if (cityError) {
      console.error('查询城市数据失败:', cityError)
      throw new Error('获取城市数据失败')
    }

    if (!cityData || cityData.length === 0) {
      throw new Error(`未找到城市 ${cityName} 的社保标准数据`)
    }

    const cityStandard = cityData[0] // 取第一条数据

    // 3. 获取所有工资数据
    const { data: salariesData, error: salariesError } = await supabaseAdmin
      .from('salaries')
      .select('*')

    if (salariesError) {
      console.error('查询工资数据失败:', salariesError)
      throw new Error('获取工资数据失败')
    }

    if (!salariesData || salariesData.length === 0) {
      throw new Error('工资数据为空，请先上传工资数据')
    }

    // 4. 按员工分组计算平均工资
    const avgSalaries: { [key: string]: number } = {}
    const employeeMonths: { [key: string]: number } = {}

    salariesData.forEach((record: any) => {
      const name = record.employee_name
      const salary = parseFloat(record.salary_amount)

      if (!avgSalaries[name]) {
        avgSalaries[name] = 0
        employeeMonths[name] = 0
      }
      avgSalaries[name] += salary
      employeeMonths[name]++
    })

    // 计算平均值
    Object.keys(avgSalaries).forEach(name => {
      avgSalaries[name] = avgSalaries[name] / employeeMonths[name]
    })

    // 5. 计算每位员工的缴费基数和公司应缴金额
    const results: CalculationResult[] = []
    let totalCompanyFee = 0

    for (const [employeeName, avgSalary] of Object.entries(avgSalaries)) {
      // 缴费基数规则
      let contributionBase = avgSalary
      if (avgSalary < cityStandard.base_min) {
        contributionBase = cityStandard.base_min
      } else if (avgSalary > cityStandard.base_max) {
        contributionBase = cityStandard.base_max
      }

      // 计算公司应缴金额
      const companyFee = contributionBase * cityStandard.rate
      totalCompanyFee += companyFee

      results.push({
        employee_name: employeeName,
        avg_salary: parseFloat(avgSalary.toFixed(2)),
        contribution_base: parseFloat(contributionBase.toFixed(2)),
        company_fee: parseFloat(companyFee.toFixed(2))
      })
    }

    const batchInfo: BatchInfo = {
      batchId,
      cityName,
      totalEmployees: Object.keys(avgSalaries).length,
      totalCompanyFee: parseFloat(totalCompanyFee.toFixed(2))
    }

    return { results, batchInfo }
  } catch (error) {
    console.error('计算过程出错:', error)
    throw error
  }
}