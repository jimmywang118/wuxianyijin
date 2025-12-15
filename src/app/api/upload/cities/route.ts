import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ''

// 使用服务端密钥创建客户端
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey)

export async function POST(request: NextRequest) {
  try {
    const { data } = await request.json()

    if (!Array.isArray(data) || data.length === 0) {
      return NextResponse.json(
        { success: false, error: '数据格式错误或为空' },
        { status: 400 }
      )
    }

    // 验证数据格式
    for (const item of data) {
      if (!item.city_name && !item.city_namte) {
        return NextResponse.json(
          { success: false, error: '缺少城市名称' },
          { status: 400 }
        )
      }
      if (!item.year) {
        return NextResponse.json(
          { success: false, error: '缺少年份' },
          { status: 400 }
        )
      }
      if (typeof item.base_min !== 'number' || item.base_min <= 0) {
        return NextResponse.json(
          { success: false, error: '基数下限必须是正数' },
          { status: 400 }
        )
      }
      if (typeof item.base_max !== 'number' || item.base_max <= 0) {
        return NextResponse.json(
          { success: false, error: '基数上限必须是正数' },
          { status: 400 }
        )
      }
      if (typeof item.rate !== 'number' || item.rate <= 0 || item.rate > 1) {
        return NextResponse.json(
          { success: false, error: '费率必须是0到1之间的数字' },
          { status: 400 }
        )
      }
    }

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
      console.error('数据库错误:', error)
      return NextResponse.json(
        { success: false, error: '数据库操作失败' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      count: processedData.length
    })
  } catch (error) {
    console.error('上传城市数据失败:', error)
    return NextResponse.json(
      { success: false, error: '服务器内部错误' },
      { status: 500 }
    )
  }
}