"use client"

import React, { useState } from "react"
import { FuturePlanningForm } from "../future-planning-form"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

import { Calculator, Users, TrendingUp } from "lucide-react"


export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            家庭未來支出規劃系統
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            幫助您規劃家庭未來的重要支出，包括教育費用、結婚費用等，並產出詳細的規劃報告
          </p>
        </div>

        {/* Main Content */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              家庭支出規劃
            </CardTitle>
          </CardHeader>
          <CardContent>
            <FuturePlanningForm />
          </CardContent>
        </Card>

        {/* Features Section */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Users className="h-5 w-5 text-blue-600" />
                家庭成員管理
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                新增和管理家庭成員資訊，包括年齡和關係，為每個成員規劃專屬的未來支出。
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <TrendingUp className="h-5 w-5 text-green-600" />
                支出規劃
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                為每個家庭成員規劃未來的重要支出項目，包括教育、結婚等重大人生事件。
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Calculator className="h-5 w-5 text-purple-600" />
                報告匯出
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                將完整的支出規劃結果匯出為 Word 報告，方便保存和分享給家人討論。
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
