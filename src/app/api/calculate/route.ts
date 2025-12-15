import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'
import { calculateContributions, BatchInfo } from '@/lib/calculations'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ''

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey)

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

    // 使用事务存储数据
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
      return NextResponse.json(
        { success: false, error: '保存计算批次失败' },
        { status: 500 }
      )
    }

    // 2. 存储计算结果
    const resultsWithBatch = results.map(result => ({
      ...result,
      batch_id: batchInfo.batchId,
      city_name: batchInfo.cityName,
      calculation_date: new Date().toISOString()
    }))

    const { error: resultsError } = await supabaseAdmin
      .from('results')
      .insert(resultsWithBatch)

    if (resultsError) {
      console.error('保存计算结果失败:', resultsError)
      return NextResponse.json(
        { success: false, error: '保存计算结果失败' },
        { status: 500 }
      )
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