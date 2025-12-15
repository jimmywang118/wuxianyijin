import { NextRequest, NextResponse } from 'next/server'
import { calculateContributions, BatchInfo } from '@/lib/calculations'
import { supabaseAdmin } from '@/lib/supabase-server'

export async function POST(request: NextRequest) {
  try {
    const { cityName } = await request.json()

    if (!cityName) {
      return NextResponse.json(
        { success: false, error: '请选择城市' },
        { status: 400 }
      )
    }

    // 执行计算
    const { results, batchInfo } = await calculateContributions(cityName)

    try {
      // 1. 先存储批次信息
      const { error: batchError } = await supabaseAdmin
        .from('calculation_batches')
        .insert({
          id: batchInfo.batchId,
          city_name: batchInfo.cityName,
          total_employees: batchInfo.totalEmployees,
          total_company_fee: batchInfo.totalCompanyFee,
          description: `${batchInfo.cityName}社保计算 - ${new Date().toLocaleDateString()}`
        })

      if (batchError) {
        console.error('保存批次信息失败:', batchError)
        // 批次保存失败不影响返回结果
      }

      // 2. 存储计算结果到 results 表（如果存在）或 calculation_results 表
      const resultsWithBatch = results.map(result => ({
        ...result,
        batch_id: batchInfo.batchId,
        city_name: batchInfo.cityName,
        calculation_date: new Date().toISOString()
      }))

      // 尝试保存到 calculation_results 表
      const { error: resultsError } = await supabaseAdmin
        .from('calculation_results')
        .insert(resultsWithBatch)

      if (resultsError) {
        console.error('保存到 calculation_results 表失败:', resultsError)
        console.log('尝试保存到 results 表...')

        // 如果 calculation_results 表不存在，尝试保存到 results 表
        const { error: fallbackError } = await supabaseAdmin
          .from('results')
          .insert(resultsWithBatch)

        if (fallbackError) {
          console.error('保存到 results 表也失败:', fallbackError)
          console.log('计算成功但未保存到数据库')
        } else {
          console.log('成功保存到 results 表')
        }
      } else {
        console.log('成功保存到 calculation_results 表')
      }
    } catch (dbError) {
      console.error('数据库保存出错:', dbError)
      // 数据库错误不影响计算结果返回
    }

    return NextResponse.json({
      success: true,
      batchInfo,
      results
    })
  } catch (error) {
    console.error('执行计算失败:', error)
    const errorMessage = error instanceof Error ? error.message : '计算失败'
    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: 500 }
    )
  }
}