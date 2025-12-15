import { CityData, SalaryData } from './excel-parser'
import { supabase } from './supabase'

export async function uploadCitiesData(data: CityData[]) {
  try {
    const response = await fetch('/api/upload/cities', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ data }),
    })

    const result = await response.json()

    if (!response.ok) {
      throw new Error(result.error || '上传失败')
    }

    return result
  } catch (error) {
    console.error('上传城市数据失败:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : '未知错误'
    }
  }
}

export async function uploadSalariesData(data: SalaryData[]) {
  try {
    const response = await fetch('/api/upload/salaries', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ data }),
    })

    const result = await response.json()

    if (!response.ok) {
      throw new Error(result.error || '上传失败')
    }

    return result
  } catch (error) {
    console.error('上传工资数据失败:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : '未知错误'
    }
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