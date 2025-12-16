"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { TrendingUp, TrendingDown, Activity, Utensils, Bath, Heart, Calendar } from "lucide-react"
import { Label } from "@/components/ui/label"
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select"

interface Stats {
  totalEntries: number
  thisWeek: number
  lastWeek: number
  byType: {
    food: number
    exercise: number
    bath: number
    health: number
    medication: number
    grooming: number
    other: number
  }
  recentActivity: Array<{ date: string; count: number }>
}

export function StatisticsSection() {
  const [stats, setStats] = useState<Stats>({
    totalEntries: 0,
    thisWeek: 0,
    lastWeek: 0,
    byType: {
      food: 0,
      exercise: 0,
      bath: 0,
      health: 0,
      medication: 0,
      grooming: 0,
      other: 0,
    },
    recentActivity: [],
  })

  const [filters, setFilters] = useState({
    dogId: "all" as string,
    dateRange: "7days" as "7days" | "30days" | "90days" | "year" | "all",
    type: "all" as string,
  })

  const [dogs, setDogs] = useState<any[]>([])

  useEffect(() => {
    const savedDogs = localStorage.getItem("dogs")
    if (savedDogs) {
      setDogs(JSON.parse(savedDogs))
    }
  }, [])

  useEffect(() => {
    const entries = JSON.parse(localStorage.getItem("meevi_diary_entries") || "[]")

    let filteredEntries = entries

    // Filter by dog
    if (filters.dogId !== "all") {
      filteredEntries = filteredEntries.filter((e: any) => e.dogId === filters.dogId)
    }

    // Filter by type
    if (filters.type !== "all") {
      filteredEntries = filteredEntries.filter((e: any) => e.type === filters.type)
    }

    // Filter by date range
    const now = new Date()
    let dateThreshold = new Date(0)

    switch (filters.dateRange) {
      case "7days":
        dateThreshold = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
        break
      case "30days":
        dateThreshold = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
        break
      case "90days":
        dateThreshold = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000)
        break
      case "year":
        dateThreshold = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000)
        break
      case "all":
        dateThreshold = new Date(0)
        break
    }

    filteredEntries = filteredEntries.filter((e: any) => new Date(e.date) >= dateThreshold)

    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
    const twoWeeksAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000)

    const thisWeekEntries = filteredEntries.filter((e: any) => new Date(e.date) >= weekAgo)
    const lastWeekEntries = filteredEntries.filter(
      (e: any) => new Date(e.date) >= twoWeeksAgo && new Date(e.date) < weekAgo,
    )

    const byType = filteredEntries.reduce((acc: any, entry: any) => {
      acc[entry.type] = (acc[entry.type] || 0) + 1
      return acc
    }, {})

    // Calculate activity for display period
    const daysToShow = filters.dateRange === "7days" ? 7 : filters.dateRange === "30days" ? 30 : 7
    const recentActivity = []
    for (let i = daysToShow - 1; i >= 0; i--) {
      const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000)
      const dateString = date.toISOString().split("T")[0]
      const count = filteredEntries.filter((e: any) => e.date === dateString).length
      recentActivity.push({
        date: dateString,
        count,
      })
    }

    setStats({
      totalEntries: filteredEntries.length,
      thisWeek: thisWeekEntries.length,
      lastWeek: lastWeekEntries.length,
      byType,
      recentActivity,
    })
  }, [filters])

  const weekComparison = stats.thisWeek - stats.lastWeek
  const weekComparisonPercent = stats.lastWeek > 0 ? ((weekComparison / stats.lastWeek) * 100).toFixed(0) : 0

  const maxActivity = Math.max(...stats.recentActivity.map((a) => a.count), 1)

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 py-4 sm:py-6 space-y-4 sm:space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-lg sm:text-xl md:text-2xl font-bold mb-1 sm:mb-2">Estatísticas e Relatórios</h2>
        <p className="text-xs sm:text-sm text-muted-foreground">Acompanhe a rotina e saúde do seu pet</p>
      </div>

      {/* Filters Card */}
      <Card className="p-3 sm:p-4">
        <h3 className="font-semibold text-sm sm:text-base mb-3 sm:mb-4">Filtros Avançados</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4">
          {/* Dog filter */}
          <div>
            <Label htmlFor="dogFilter" className="text-xs sm:text-sm mb-1.5 sm:mb-2 block">
              Cachorro
            </Label>
            <Select value={filters.dogId} onValueChange={(value) => setFilters({ ...filters, dogId: value })}>
              <SelectTrigger id="dogFilter" className="h-9 sm:h-10">
                <SelectValue placeholder="Todos os cachorros" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os cachorros</SelectItem>
                {dogs.map((dog) => (
                  <SelectItem key={dog.id} value={dog.id}>
                    {dog.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Date range filter */}
          <div>
            <Label htmlFor="dateFilter" className="text-xs sm:text-sm mb-1.5 sm:mb-2 block">
              Período
            </Label>
            <Select
              value={filters.dateRange}
              onValueChange={(value: any) => setFilters({ ...filters, dateRange: value })}
            >
              <SelectTrigger id="dateFilter" className="h-9 sm:h-10">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7days">Últimos 7 dias</SelectItem>
                <SelectItem value="30days">Últimos 30 dias</SelectItem>
                <SelectItem value="90days">Últimos 90 dias</SelectItem>
                <SelectItem value="year">Último ano</SelectItem>
                <SelectItem value="all">Todo o período</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Type filter */}
          <div>
            <Label htmlFor="typeFilter" className="text-xs sm:text-sm mb-1.5 sm:mb-2 block">
              Categoria
            </Label>
            <Select value={filters.type} onValueChange={(value) => setFilters({ ...filters, type: value })}>
              <SelectTrigger id="typeFilter" className="h-9 sm:h-10">
                <SelectValue placeholder="Todas as categorias" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas as categorias</SelectItem>
                <SelectItem value="food">Alimentação</SelectItem>
                <SelectItem value="exercise">Exercício</SelectItem>
                <SelectItem value="bath">Banho</SelectItem>
                <SelectItem value="health">Saúde</SelectItem>
                <SelectItem value="medication">Medicação</SelectItem>
                <SelectItem value="grooming">Tosa</SelectItem>
                <SelectItem value="other">Outro</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </Card>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4">
        <Card className="p-4 sm:p-6">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs sm:text-sm text-muted-foreground">Total de Registros</p>
            <Activity className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
          </div>
          <p className="text-2xl sm:text-3xl font-bold">{stats.totalEntries}</p>
          <p className="text-[10px] sm:text-xs text-muted-foreground mt-1">Desde o início</p>
        </Card>

        <Card className="p-4 sm:p-6">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs sm:text-sm text-muted-foreground">Esta Semana</p>
            <Calendar className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
          </div>
          <div className="flex items-end gap-2">
            <p className="text-2xl sm:text-3xl font-bold">{stats.thisWeek}</p>
            {weekComparison !== 0 && (
              <Badge
                variant="outline"
                className={`mb-1 text-[10px] sm:text-xs ${weekComparison > 0 ? "bg-green-500/10 text-green-700 border-green-500/20" : "bg-red-500/10 text-red-700 border-red-500/20"}`}
              >
                {weekComparison > 0 ? (
                  <TrendingUp className="w-3 h-3 mr-1" />
                ) : (
                  <TrendingDown className="w-3 h-3 mr-1" />
                )}
                {Math.abs(Number(weekComparisonPercent))}%
              </Badge>
            )}
          </div>
          <p className="text-[10px] sm:text-xs text-muted-foreground mt-1">vs semana anterior: {stats.lastWeek}</p>
        </Card>

        <Card className="p-4 sm:p-6">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs sm:text-sm text-muted-foreground">Média Diária</p>
            <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
          </div>
          <p className="text-2xl sm:text-3xl font-bold">{(stats.thisWeek / 7).toFixed(1)}</p>
          <p className="text-[10px] sm:text-xs text-muted-foreground mt-1">Registros por dia</p>
        </Card>
      </div>

      {/* Activity Chart */}
      <Card className="p-4 sm:p-6">
        <h3 className="font-semibold text-sm sm:text-base mb-3 sm:mb-4">
          Atividade dos Últimos {filters.dateRange === "7days" ? "7" : filters.dateRange === "30days" ? "30" : "7"} Dias
        </h3>
        <div className="space-y-2 sm:space-y-3">
          {stats.recentActivity.map((activity) => {
            const date = new Date(activity.date)
            const isToday = activity.date === new Date().toISOString().split("T")[0]
            const percentage = (activity.count / maxActivity) * 100

            return (
              <div key={activity.date} className="space-y-1">
                <div className="flex items-center justify-between text-xs sm:text-sm">
                  <span className={`${isToday ? "font-semibold text-primary" : "text-muted-foreground"}`}>
                    {date.toLocaleDateString("pt-BR", { weekday: "short", day: "numeric", month: "short" })}
                  </span>
                  <span className="font-semibold">{activity.count}</span>
                </div>
                <div className="w-full bg-secondary rounded-full h-1.5 sm:h-2 overflow-hidden">
                  <div
                    className="bg-primary h-full rounded-full transition-all duration-500"
                    style={{ width: `${percentage}%` }}
                  />
                </div>
              </div>
            )
          })}
        </div>
      </Card>

      {/* Type Breakdown */}
      <Card className="p-4 sm:p-6">
        <h3 className="font-semibold text-sm sm:text-base mb-3 sm:mb-4">Distribuição por Categoria</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
          <div className="flex items-center gap-2 sm:gap-3 p-2 sm:p-3 bg-orange-500/10 rounded-lg">
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-orange-500/20 rounded-full flex items-center justify-center flex-shrink-0">
              <Utensils className="w-4 h-4 sm:w-5 sm:h-5 text-orange-600" />
            </div>
            <div className="min-w-0">
              <p className="text-xl sm:text-2xl font-bold">{stats.byType.food || 0}</p>
              <p className="text-[10px] sm:text-xs text-muted-foreground truncate">Alimentação</p>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3 p-2 sm:p-3 bg-blue-500/10 rounded-lg">
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-blue-500/20 rounded-full flex items-center justify-center flex-shrink-0">
              <Activity className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
            </div>
            <div className="min-w-0">
              <p className="text-xl sm:text-2xl font-bold">{stats.byType.exercise || 0}</p>
              <p className="text-[10px] sm:text-xs text-muted-foreground truncate">Exercícios</p>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3 p-2 sm:p-3 bg-purple-500/10 rounded-lg">
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-purple-500/20 rounded-full flex items-center justify-center flex-shrink-0">
              <Bath className="w-4 h-4 sm:w-5 sm:h-5 text-purple-600" />
            </div>
            <div className="min-w-0">
              <p className="text-xl sm:text-2xl font-bold">{stats.byType.bath || 0}</p>
              <p className="text-[10px] sm:text-xs text-muted-foreground truncate">Banhos</p>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3 p-2 sm:p-3 bg-red-500/10 rounded-lg">
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-red-500/20 rounded-full flex items-center justify-center flex-shrink-0">
              <Heart className="w-4 h-4 sm:w-5 sm:h-5 text-red-600" />
            </div>
            <div className="min-w-0">
              <p className="text-xl sm:text-2xl font-bold">{stats.byType.health || 0}</p>
              <p className="text-[10px] sm:text-xs text-muted-foreground truncate">Saúde</p>
            </div>
          </div>
        </div>
      </Card>

      {/* Insights */}
      <Card className="p-4 sm:p-6 bg-primary/5 border-primary/20">
        <h3 className="font-semibold text-sm sm:text-base mb-2 sm:mb-3">Insights e Recomendações</h3>
        <div className="space-y-2 text-xs sm:text-sm">
          {stats.byType.exercise < 7 && (
            <p className="flex items-start gap-2">
              <span className="text-yellow-600 flex-shrink-0">⚠️</span>
              <span>Seu pet precisa de exercícios diários. Tente aumentar a frequência de atividades físicas.</span>
            </p>
          )}
          {stats.byType.food / 7 < 2 && stats.totalEntries > 0 && (
            <p className="flex items-start gap-2">
              <span className="text-blue-600 flex-shrink-0">💡</span>
              <span>Registre as refeições do seu pet para manter um histórico completo de alimentação.</span>
            </p>
          )}
          {weekComparison > 0 && (
            <p className="flex items-start gap-2">
              <span className="text-green-600 flex-shrink-0">✓</span>
              <span>Parabéns! Você está mais ativo no cuidado do seu pet esta semana.</span>
            </p>
          )}
        </div>
      </Card>
    </div>
  )
}
