/**
 * Problem Analytics Module
 * 
 * This module provides analytics and intelligence based on problem sheet data.
 * It reads from the Problem Sheet but NEVER modifies it.
 * All outputs are computed metrics and recommendations shown elsewhere.
 */

import { problems, Problem } from './problems'

export interface ProblemPerformance {
  problemId: number
  solved: boolean
  bookmarked: boolean
  attempts: number
  timeSpent?: number // in minutes
  accuracy?: number // percentage if multiple attempts
  lastAttempted?: Date
}

export interface TopicPerformance {
  topic: string
  totalProblems: number
  solvedProblems: number
  accuracy: number
  averageTime: number
  strength: 'weak' | 'medium' | 'strong'
}

export interface CompanyMapping {
  companyName: string
  problemIds: number[]
  priority: 'high' | 'medium' | 'low'
  interviewStage: 'phone' | 'onsite' | 'system-design'
}

// Company-to-Problem mappings (metadata, not modifying problem sheet)
const COMPANY_PROBLEM_MAPPINGS: CompanyMapping[] = [
  {
    companyName: 'Google',
    problemIds: [1, 5, 33, 56, 117, 144, 181, 206, 266, 301, 326, 364],
    priority: 'high',
    interviewStage: 'onsite'
  },
  {
    companyName: 'Facebook (Meta)',
    problemIds: [3, 13, 36, 58, 119, 145, 182, 207, 267, 302, 327, 365],
    priority: 'high',
    interviewStage: 'onsite'
  },
  {
    companyName: 'Amazon',
    problemIds: [2, 15, 37, 57, 121, 146, 183, 208, 268, 303, 328, 366],
    priority: 'high',
    interviewStage: 'phone'
  },
  {
    companyName: 'Microsoft',
    problemIds: [4, 19, 39, 62, 125, 147, 184, 209, 269, 304, 329, 367],
    priority: 'high',
    interviewStage: 'onsite'
  },
  {
    companyName: 'Apple',
    problemIds: [6, 22, 41, 65, 127, 148, 185, 210, 270, 305, 330, 368],
    priority: 'medium',
    interviewStage: 'onsite'
  }
]

export class ProblemAnalytics {
  private performanceData: Map<number, ProblemPerformance>

  constructor(performanceData: ProblemPerformance[] = []) {
    this.performanceData = new Map()
    performanceData.forEach(perf => {
      this.performanceData.set(perf.problemId, perf)
    })
  }

  /**
   * Calculate topic-wise performance from problem sheet data
   */
  getTopicPerformance(): TopicPerformance[] {
    const topicStats = new Map<string, {
      total: number
      solved: number
      totalTime: number
      timeCount: number
    }>()

    problems.forEach(problem => {
      problem.topics.forEach(topic => {
        if (!topicStats.has(topic)) {
          topicStats.set(topic, { total: 0, solved: 0, totalTime: 0, timeCount: 0 })
        }
        const stats = topicStats.get(topic)!
        stats.total++

        const perf = this.performanceData.get(problem.id)
        if (perf?.solved) {
          stats.solved++
        }
        if (perf?.timeSpent) {
          stats.totalTime += perf.timeSpent
          stats.timeCount++
        }
      })
    })

    const results: TopicPerformance[] = []
    topicStats.forEach((stats, topic) => {
      const solvedPercentage = (stats.solved / stats.total) * 100
      const avgTime = stats.timeCount > 0 ? stats.totalTime / stats.timeCount : 0
      
      let strength: 'weak' | 'medium' | 'strong'
      if (solvedPercentage >= 70) strength = 'strong'
      else if (solvedPercentage >= 40) strength = 'medium'
      else strength = 'weak'

      results.push({
        topic,
        totalProblems: stats.total,
        solvedProblems: stats.solved,
        accuracy: solvedPercentage,
        averageTime: avgTime,
        strength
      })
    })

    return results.sort((a, b) => b.accuracy - a.accuracy)
  }

  /**
   * Get next recommended problems based on weaknesses
   */
  getRecommendedProblems(limit: number = 5): Problem[] {
    const topicPerformance = this.getTopicPerformance()
    const weakTopics = topicPerformance
      .filter(tp => tp.strength === 'weak')
      .map(tp => tp.topic)

    // Find unsolved problems in weak topics
    const recommended: Problem[] = []
    const solvedIds = new Set(
      Array.from(this.performanceData.values())
        .filter(p => p.solved)
        .map(p => p.problemId)
    )

    // Prioritize easy problems in weak topics
    problems.forEach(problem => {
      if (!solvedIds.has(problem.id)) {
        const hasWeakTopic = problem.topics.some(topic => weakTopics.includes(topic))
        if (hasWeakTopic && problem.difficulty === 'Easy') {
          recommended.push(problem)
        }
      }
    })

    return recommended.slice(0, limit)
  }

  /**
   * Get company-specific preparation roadmap
   */
  getCompanyRoadmap(companyName: string): {
    company: string
    recommendedProblems: Problem[]
    progress: number
    readiness: 'not-ready' | 'preparing' | 'ready'
  } {
    const mapping = COMPANY_PROBLEM_MAPPINGS.find(m => m.companyName === companyName)
    if (!mapping) {
      return {
        company: companyName,
        recommendedProblems: [],
        progress: 0,
        readiness: 'not-ready'
      }
    }

    const companyProblems = problems.filter(p => mapping.problemIds.includes(p.id))
    const solvedIds = new Set(
      Array.from(this.performanceData.values())
        .filter(p => p.solved)
        .map(p => p.problemId)
    )

    const solved = companyProblems.filter(p => solvedIds.has(p.id)).length
    const progress = (solved / companyProblems.length) * 100

    let readiness: 'not-ready' | 'preparing' | 'ready'
    if (progress >= 80) readiness = 'ready'
    else if (progress >= 50) readiness = 'preparing'
    else readiness = 'not-ready'

    const recommendedProblems = companyProblems
      .filter(p => !solvedIds.has(p.id))
      .slice(0, 10)

    return {
      company: companyName,
      recommendedProblems,
      progress,
      readiness
    }
  }

  /**
   * Calculate overall interview readiness score
   */
  getInterviewReadinessScore(): number {
    const totalProblems = problems.length
    const solvedProblems = Array.from(this.performanceData.values())
      .filter(p => p.solved).length

    const baseScore = (solvedProblems / totalProblems) * 60 // 60% weight on completion

    // Add 20% for difficulty distribution
    const easySolved = problems.filter(p => 
      p.difficulty === 'Easy' && this.performanceData.get(p.id)?.solved
    ).length
    const mediumSolved = problems.filter(p => 
      p.difficulty === 'Medium' && this.performanceData.get(p.id)?.solved
    ).length
    const hardSolved = problems.filter(p => 
      p.difficulty === 'Hard' && this.performanceData.get(p.id)?.solved
    ).length

    const difficultyScore = (
      (easySolved / 150) * 10 +
      (mediumSolved / 150) * 15 +
      (hardSolved / 150) * 15
    ) * 20 / 40

    // Add 20% for topic coverage
    const topicPerformance = this.getTopicPerformance()
    const strongTopics = topicPerformance.filter(tp => tp.strength === 'strong').length
    const topicScore = (strongTopics / topicPerformance.length) * 20

    return Math.min(100, Math.round(baseScore + difficultyScore + topicScore))
  }

  /**
   * Get daily study plan
   */
  getDailyStudyPlan(targetProblemsPerDay: number = 3): {
    problems: Problem[]
    focusArea: string
    estimatedTime: number
  } {
    const recommended = this.getRecommendedProblems(targetProblemsPerDay)
    const topicPerformance = this.getTopicPerformance()
    const weakTopic = topicPerformance.find(tp => tp.strength === 'weak')?.topic || 'Arrays'
    
    const estimatedTime = recommended.reduce((sum, p) => {
      const perf = this.performanceData.get(p.id)
      if (perf?.timeSpent) {
        return sum + perf.timeSpent
      }
      // Estimate based on difficulty
      const baseTime = p.difficulty === 'Easy' ? 15 : p.difficulty === 'Medium' ? 30 : 45
      return sum + baseTime
    }, 0)

    return {
      problems: recommended,
      focusArea: weakTopic,
      estimatedTime
    }
  }
}
