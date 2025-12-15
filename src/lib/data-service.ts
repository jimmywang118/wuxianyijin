import { createClient } from '@supabase/supabase-js'
import { CityData, SalaryData } from './excel-parser'
import { supabase } from './supabase'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

// 使用服务端密钥创建客户端，以便有权限删除和插入数据
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey)

export async function uploadCitiesData(data: CityData[]) {
  try {
    // 先清空现有数据
    await supabaseAdmin.from('cities').delete().neq('id', 0)

    // 处理城市名称的拼写错误
    const processedData = data.map(item => ({
      city_name: item.city_name || item.city_namte,
      year: item.year,
      base_min: item.base_min,
      base_max: item.base_max,
      rate: item.rate
    }))

    // 插入新数据
    const { error } = await supabaseAdmin.from('cities').insert(processedData)

    if (error) {
      throw error
    }

    return { success: true, count: processedData.length }
  } catch (error) {
    console.error('上传城市数据失败:', error)
    return { success: false, error: error instanceof Error ? error.message : '未知错误' }
  }
}

export async function uploadSalariesData(data: SalaryData[]) {
  try {
    // 先清空现有数据
    await supabaseAdmin.from('salaries').delete().neq('id', 0)

    // 插入新数据
    const { error } = await supabaseAdmin.from('salaries').insert(data)

    if (error) {
      throw error
    }

    return { success: true, count: data.length }
  } catch (error) {
    console.error('上传工资数据失败:', error)
    return { success: false, error: error instanceof Error ? error.message : '未知错误' }
  }
}

export async function getCitiesList() {
  try {
    const { data, error } = await supabase
      .from('cities')
      .select('city_name, year')
      .order('city_name, year')

    if (error) {
      throw error
    }

    return { success: true, data: data || [] }
  } catch (error) {
    console.error('获取城市列表失败:', error)
    return { success: false, error: error instanceof Error ? error.message : '未知错误' }
  }
}

export async function getSalariesCount() {
  try {
    const { count, error } = await supabase
      .from('salaries')
      .select('*', { count: 'exact', head: true })

    if (error) {
      throw error
    }

    return { success: true, count: count || 0 }
  } catch (error) {
    console.error('获取工资数据数量失败:', error)
    return { success: false, error: error instanceof Error ? error.message : '未知错误' }
  }
}