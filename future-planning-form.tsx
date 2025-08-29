"use client"

import React, { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Trash2, Plus, Users, Calendar, User } from "lucide-react"

interface FamilyMember {
  id: string
  name: string
  currentAge: number
}

interface FutureExpense {
  id: string
  item: string
  targetAge: number
  amount: number
  description: string
  familyMemberId: string // 新增：關聯的家庭成員ID
}

export function FuturePlanningForm() {
  const [familyMembers, setFamilyMembers] = useState<FamilyMember[]>([
    { id: "1", name: "我", currentAge: 45 },
    { id: "2", name: "配偶", currentAge: 42 },
    { id: "3", name: "長子", currentAge: 15 },
    { id: "4", name: "次女", currentAge: 12 },
  ])

  const [futureExpenses, setFutureExpenses] = useState<FutureExpense[]>([])

  const addFamilyMember = () => {
    const newMember: FamilyMember = {
      id: Date.now().toString(),
      name: "",
      currentAge: 0,
    }
    setFamilyMembers([...familyMembers, newMember])
  }

  const removeFamilyMember = (id: string) => {
    // 移除家庭成員時，也要移除相關的支出項目
    setFutureExpenses(futureExpenses.filter((expense) => expense.familyMemberId !== id))
    setFamilyMembers(familyMembers.filter((member) => member.id !== id))
  }

  const updateFamilyMember = (id: string, field: keyof FamilyMember, value: string | number) => {
    setFamilyMembers(familyMembers.map((member) => (member.id === id ? { ...member, [field]: value } : member)))
  }

  const addFutureExpense = () => {
    const newExpense: FutureExpense = {
      id: Date.now().toString(),
      item: "",
      targetAge: 0,
      amount: 0,
      description: "",
      familyMemberId: familyMembers[0]?.id || "",
    }
    setFutureExpenses([...futureExpenses, newExpense])
  }

  const removeFutureExpense = (id: string) => {
    setFutureExpenses(futureExpenses.filter((expense) => expense.id !== id))
  }

  const updateFutureExpense = (id: string, field: keyof FutureExpense, value: string | number) => {
    setFutureExpenses(futureExpenses.map((expense) => (expense.id === id ? { ...expense, [field]: value } : expense)))
  }

  const calculateYearsFromNow = (targetAge: number, memberAge: number) => {
    return Math.max(0, targetAge - memberAge)
  }

  const calculateTotalExpenses = () => {
    return futureExpenses.reduce((total, expense) => total + expense.amount, 0)
  }

  const getFamilyMemberById = (id: string) => {
    return familyMembers.find((member) => member.id === id)
  }

  // 按家庭成員分組支出
  const getExpensesByMember = () => {
    const grouped: { [key: string]: FutureExpense[] } = {}
    futureExpenses.forEach((expense) => {
      if (!grouped[expense.familyMemberId]) {
        grouped[expense.familyMemberId] = []
      }
      grouped[expense.familyMemberId].push(expense)
    })
    return grouped
  }

  // Word 報告匯出功能
  const exportToWord = () => {
    if (futureExpenses.length === 0) {
      alert('請先新增支出項目才能匯出報告')
      return
    }

    const currentDate = new Date().toLocaleDateString('zh-TW')
    const totalAmount = calculateTotalExpenses()
    const groupedExpenses = getExpensesByMember()

    // 計算更多統計資料
    const avgAge = Math.round(familyMembers.reduce((sum, member) => sum + member.currentAge, 0) / familyMembers.length)
    const totalExpenseItems = futureExpenses.length
    const avgExpenseAmount = totalAmount > 0 ? Math.round(totalAmount / totalExpenseItems) : 0
    const nearestExpense = futureExpenses.reduce((nearest, expense) => {
      const member = getFamilyMemberById(expense.familyMemberId)
      if (!member) return nearest
      const years = calculateYearsFromNow(expense.targetAge, member.currentAge)
      if (!nearest || years < nearest.years) {
        return { expense, years, member }
      }
      return nearest
    }, null as any)

    // 計算未來年份
    const currentYear = new Date().getFullYear()
    const yearColumns: number[] = []
    for (let i = 0; i < 6; i++) {
      yearColumns.push(currentYear + i)
    }

    // 建立 HTML 內容 - 表格格式
    let htmlContent = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>未來家庭支出盤點表</title>
    <style>
        body { 
            font-family: 'Microsoft JhengHei', 'SimHei', Arial, sans-serif; 
            margin: 30px; 
            line-height: 1.4; 
            color: #000;
            background-color: #fff;
        }
        .header {
            text-align: center;
            margin-bottom: 20px;
        }
        .main-title { 
            font-size: 20px; 
            font-weight: bold; 
            margin-bottom: 15px;
            letter-spacing: 1px;
        }
        .info-line {
            text-align: right;
            margin-bottom: 10px;
            font-size: 14px;
        }
        .main-table { 
            width: 100%; 
            border-collapse: collapse; 
            border: 2px solid #000;
            margin: 20px 0;
        }
        .main-table th, .main-table td { 
            border: 1px solid #000; 
            padding: 8px; 
            text-align: center;
            vertical-align: middle;
            font-size: 12px;
        }
        .main-table th {
            background-color: #f0f0f0;
            font-weight: bold;
        }
        .member-header {
            background-color: #e8e8e8;
            font-weight: bold;
            writing-mode: vertical-rl;
            text-orientation: mixed;
            width: 40px;
        }
        .age-row {
            background-color: #f8f8f8;
            font-size: 11px;
        }
        .year-header {
            background-color: #d0d0d0;
            font-weight: bold;
            font-size: 14px;
        }
        .amount-cell {
            min-height: 25px;
            font-size: 11px;
        }
        .expense-item {
            background-color: #f9f9f9;
            font-weight: bold;
            text-align: left;
            padding-left: 10px;
        }
        .total-row {
            background-color: #e0e0e0;
            font-weight: bold;
        }
        .notes {
            margin-top: 30px;
            font-size: 12px;
            line-height: 1.6;
        }
        .notes-title {
            font-weight: bold;
            margin-bottom: 10px;
        }
        .footer {
            margin-top: 40px;
            text-align: center;
            font-size: 10px;
            color: #666;
        }
        @media print {
            body { margin: 15px; }
            .main-table { font-size: 10px; }
        }
    </style>
</head>
<body>
    <div class="header">
        <div class="main-title">未來家庭支出盤點表</div>
        <div class="info-line">姓名：_________________</div>
    </div>

        <table class="main-table">
        <thead>
            <tr>
                <th class="member-header">成員/年齡</th>
                ${yearColumns.map(year => `<th class="year-header">${year}年</th>`).join('')}
            </tr>
        </thead>
        <tbody>`

    // 家庭成員年齡行
    familyMembers.forEach(member => {
      htmlContent += `
            <tr>
                <td class="member-header">${member.name}</td>
                ${yearColumns.map(year => {
                  const ageInYear = member.currentAge + (year - currentYear)
                  return `<td class="age-row">${ageInYear}歲</td>`
                }).join('')}
            </tr>`
    })

    // 支出項目標題行
    htmlContent += `
            <tr>
                <td class="expense-item">項目</td>
                ${yearColumns.map(year => `<th class="year-header">${year}年</th>`).join('')}
            </tr>`

    // 為每個支出項目創建行
    const allExpenseItems: Array<{
      item: string;
      amount: number;
      targetYear: number;
      memberName: string;
    }> = []
    futureExpenses.forEach(expense => {
      const member = getFamilyMemberById(expense.familyMemberId)
      if (member) {
        const targetYear = currentYear + calculateYearsFromNow(expense.targetAge, member.currentAge)
        allExpenseItems.push({
          ...expense,
          targetYear,
          memberName: member.name
        })
      }
    })

    // 按年份和成員排序
    allExpenseItems.sort((a, b) => a.targetYear - b.targetYear || a.memberName.localeCompare(b.memberName))

    // 添加支出項目行 - 只顯示有輸入的項目
    allExpenseItems.forEach(expense => {
      htmlContent += `
            <tr>
                <td class="expense-item">${expense.item} (${expense.memberName})</td>
                ${yearColumns.map(year => {
                  if (expense.targetYear === year) {
                    return `<td class="amount-cell">${expense.amount.toLocaleString()}</td>`
                  }
                  return `<td class="amount-cell"></td>`
                }).join('')}
            </tr>`
    })

    // 總計行
    htmlContent += `
            <tr class="total-row">
                <td class="expense-item">總計</td>
                ${yearColumns.map(year => {
                  const yearTotal = allExpenseItems
                    .filter(item => item.targetYear === year)
                    .reduce((sum, item) => sum + item.amount, 0)
                  return `<td class="amount-cell">${yearTotal > 0 ? yearTotal.toLocaleString() : ''}</td>`
                }).join('')}
            </tr>`

    htmlContent += `
        </tbody>
    </table>

    <div class="notes">
        <div class="notes-title">規劃說明：</div>
        <div>1. 本表格用於記錄家庭未來 ${yearColumns.length} 年內的重要支出規劃</div>
        <div>2. 請根據家庭成員的年齡增長，規劃各年度可能的重大支出</div>
        <div>3. 支出項目包括但不限於：教育費用、結婚費用、購屋費用、醫療費用等</div>
        <div>4. 金額單位為新台幣（元），可依實際需求調整</div>
        <div>5. 建議每年檢視並更新此規劃表</div>
    </div>

    <div class="notes">
        <div class="notes-title">目前規劃項目明細：</div>`

    // 添加詳細項目說明
    Object.entries(getExpensesByMember()).forEach(([memberId, expenses]) => {
      const member = getFamilyMemberById(memberId)
      if (!member) return

      htmlContent += `
        <div style="margin: 15px 0;">
            <strong>${member.name} (${member.currentAge}歲)：</strong>
            <ul style="margin: 5px 0; padding-left: 20px;">`

      expenses.forEach(expense => {
        const yearsFromNow = calculateYearsFromNow(expense.targetAge, member.currentAge)
        const targetYear = currentYear + yearsFromNow
        htmlContent += `
                <li>${expense.item} - ${targetYear}年 (${expense.targetAge}歲) - ${expense.amount.toLocaleString()}元
                    ${expense.description ? ` - ${expense.description}` : ''}
                </li>`
      })

      htmlContent += `
            </ul>
        </div>`
    })

    htmlContent += `
    </div>
</body>
</html>`

    // 建立並下載檔案
    const blob = new Blob([htmlContent], { type: 'application/msword;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `家庭未來支出規劃報告_${new Date().toISOString().split('T')[0]}.doc`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)

    alert('Word 報告已成功匯出！')
  }

  return (
    <div className="space-y-6">
      {/* 家庭成員設定 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            家庭成員設定
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {familyMembers.map((member, index) => (
              <div key={member.id} className="flex items-center gap-4 p-4 border rounded-lg">
                <div className="flex-1 grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor={`name-${member.id}`}>姓名/關係</Label>
                    <Input
                      id={`name-${member.id}`}
                      value={member.name}
                      onChange={(e) => updateFamilyMember(member.id, "name", e.target.value)}
                      placeholder="例如：我、配偶、長子"
                    />
                  </div>
                  <div>
                    <Label htmlFor={`age-${member.id}`}>目前年齡</Label>
                    <Input
                      id={`age-${member.id}`}
                      type="number"
                      value={member.currentAge || ""}
                      onChange={(e) =>
                        updateFamilyMember(member.id, "currentAge", Number.parseInt(e.target.value) || 0)
                      }
                      placeholder="歲"
                    />
                  </div>
                </div>
                {index > 0 && (
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => removeFamilyMember(member.id)}
                    className="text-red-500 hover:text-red-700"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
            ))}
            <Button onClick={addFamilyMember} variant="outline" className="w-full">
              <Plus className="h-4 w-4 mr-2" />
              新增家庭成員
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* 未來支出規劃 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            未來家庭支出盤點
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {futureExpenses.map((expense) => {
              const relatedMember = getFamilyMemberById(expense.familyMemberId)
              return (
                <div key={expense.id} className="p-4 border rounded-lg space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div>
                      <Label htmlFor={`member-${expense.id}`}>相關成員</Label>
                      <Select
                        value={expense.familyMemberId}
                        onValueChange={(value) => updateFutureExpense(expense.id, "familyMemberId", value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="選擇家庭成員" />
                        </SelectTrigger>
                        <SelectContent>
                          {familyMembers.map((member) => (
                            <SelectItem key={member.id} value={member.id}>
                              <div className="flex items-center gap-2">
                                <User className="h-4 w-4" />
                                {member.name} ({member.currentAge}歲)
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor={`item-${expense.id}`}>支出項目</Label>
                      <Input
                        id={`item-${expense.id}`}
                        value={expense.item}
                        onChange={(e) => updateFutureExpense(expense.id, "item", e.target.value)}
                        placeholder="例如：大學學費、結婚費用"
                      />
                    </div>
                    <div>
                      <Label htmlFor={`target-age-${expense.id}`}>
                        目標年齡 {relatedMember && `(${relatedMember.name})`}
                      </Label>
                      <Input
                        id={`target-age-${expense.id}`}
                        type="number"
                        value={expense.targetAge || ""}
                        onChange={(e) =>
                          updateFutureExpense(expense.id, "targetAge", Number.parseInt(e.target.value) || 0)
                        }
                        placeholder="歲"
                      />
                    </div>
                    <div>
                      <Label htmlFor={`amount-${expense.id}`}>預估金額</Label>
                      <Input
                        id={`amount-${expense.id}`}
                        type="number"
                        value={expense.amount || ""}
                        onChange={(e) =>
                          updateFutureExpense(expense.id, "amount", Number.parseInt(e.target.value) || 0)
                        }
                        placeholder="元"
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor={`description-${expense.id}`}>詳細說明</Label>
                    <Input
                      id={`description-${expense.id}`}
                      value={expense.description}
                      onChange={(e) => updateFutureExpense(expense.id, "description", e.target.value)}
                      placeholder="詳細描述這筆支出的用途和重要性"
                    />
                  </div>
                  {relatedMember && expense.targetAge > 0 && (
                    <div className="text-sm text-muted-foreground bg-blue-50 p-3 rounded">
                      <div className="flex items-center gap-2 mb-1">
                        <User className="h-4 w-4" />
                        <span className="font-medium">{relatedMember.name}的規劃</span>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <span>
                          距離目標時間：{calculateYearsFromNow(expense.targetAge, relatedMember.currentAge)}年
                        </span>
                        {expense.amount > 0 && (
                          <span>
                            建議月存：
                            {Math.round(
                              expense.amount /
                                (calculateYearsFromNow(expense.targetAge, relatedMember.currentAge) * 12 || 1),
                            ).toLocaleString()}
                            元
                          </span>
                        )}
                      </div>
                    </div>
                  )}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => removeFutureExpense(expense.id)}
                    className="text-red-500 hover:text-red-700"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    刪除此項目
                  </Button>
                </div>
              )
            })}

            <Button onClick={addFutureExpense} variant="outline" className="w-full">
              <Plus className="h-4 w-4 mr-2" />
              新增未來支出項目
            </Button>

            {/* 按成員分組顯示 */}
            {futureExpenses.length > 0 && (
              <div className="mt-6 space-y-4">
                <h4 className="font-semibold text-lg">支出規劃總覽</h4>

                {/* 總計 */}
                <div className="p-4 bg-blue-50 rounded-lg">
                  <h4 className="font-semibold mb-2">全家支出總計</h4>
                  <div className="text-2xl font-bold text-blue-600">{calculateTotalExpenses().toLocaleString()}元</div>
                  <p className="text-sm text-muted-foreground mt-2">
                    建議總月存金額：
                    {Math.round(
                      calculateTotalExpenses() /
                        (familyMembers[0]?.currentAge ? (65 - familyMembers[0].currentAge) * 12 : 1),
                    ).toLocaleString()}
                    元
                  </p>
                  
                  {/* Word 報告匯出按鈕 */}
                  <div className="mt-4 text-center">
                    <Button 
                      onClick={exportToWord} 
                      className="bg-green-600 hover:bg-green-700 text-white"
                    >
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      匯出 Word 報告
                    </Button>
                  </div>
                </div>

                {/* 按成員分組 */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {Object.entries(getExpensesByMember()).map(([memberId, expenses]) => {
                    const member = getFamilyMemberById(memberId)
                    if (!member) return null

                    const memberTotal = expenses.reduce((sum, exp) => sum + exp.amount, 0)

                    return (
                      <div key={memberId} className="p-4 border rounded-lg">
                        <div className="flex items-center gap-2 mb-3">
                          <User className="h-5 w-5 text-blue-600" />
                          <h5 className="font-semibold">
                            {member.name} ({member.currentAge}歲)
                          </h5>
                        </div>
                        <div className="space-y-2">
                          {expenses.map((expense) => (
                            <div key={expense.id} className="flex justify-between text-sm">
                              <span>{expense.item}</span>
                              <span className="font-medium">{expense.amount.toLocaleString()}元</span>
                            </div>
                          ))}
                          <div className="border-t pt-2 flex justify-between font-semibold">
                            <span>小計</span>
                            <span className="text-blue-600">{memberTotal.toLocaleString()}元</span>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
