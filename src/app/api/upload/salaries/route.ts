import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-server'

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
    const monthPattern = /^\d{4}(0[1-9]|1[0-2])$/
    for (const item of data) {
      if (!item.employee_id || typeof item.employee_id !== 'string') {
        return NextResponse.json(
          { success: false, error: '员工工号缺失或格式错误' },
          { status: 400 }
        )
      }
      if (!item.employee_name || typeof item.employee_name !== 'string') {
        return NextResponse.json(
          { success: false, error: '员工姓名缺失或格式错误' },
          { status: 400 }
        )
      }
      if (!item.month || typeof item.month !== 'string' || !monthPattern.test(item.month)) {
        return NextResponse.json(
          { success: false, error: '月份缺失或格式错误（应为YYYYMM，如202401）' },
          { status: 400 }
        )
      }
      if (typeof item.salary_amount !== 'number' || item.salary_amount <= 0) {
        return NextResponse.json(
          { success: false, error: '工资金额必须是正数' },
          { status: 400 }
        )
      }
    }

    // 先清空现有数据
    await supabaseAdmin.from('salaries').delete().neq('id', 0)

    // 插入新数据
    const { error } = await supabaseAdmin.from('salaries').insert(data)

    if (error) {
      console.error('数据库错误:', error)
      return NextResponse.json(
        { success: false, error: '数据库操作失败' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      count: data.length
    })
  } catch (error) {
    console.error('上传工资数据失败:', error)
    return NextResponse.json(
      { success: false, error: '服务器内部错误' },
      { status: 500 }
    )
  }
}