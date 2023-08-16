import dayjs from 'dayjs'
import isBetween from 'dayjs/plugin/isBetween'
import isoWeek from 'dayjs/plugin/isoWeek'

dayjs.extend(isBetween)
dayjs.extend(isoWeek)

/**
 * 获取指定时间范围内的所有月份
 * @param {number} startDate - 起始日期的时间戳
 * @param {number} endDate - 结束日期的时间戳
 * @returns {Array} 返回所有月份的字符串数组，格式为 'YYYY-MM'
 */
export const getMonthsInRange = (startDate: number, endDate: number) => {
  const start = dayjs(startDate)
  const end = dayjs(endDate)
  const months: string[] = []

  let curr = start.clone().startOf('month')
  while (curr.isBefore(end)) {
    months.push(curr.format('YYYY-MM'))
    curr = curr.add(1, 'month')
  }

  return months
}

/**
 * 获取指定月份中的所有日期
 * @param {string} month - 指定月份，格式为 'YYYY-MM'
 * @returns {Array} 返回指定月份中的所有日期的时间戳数组
 */
export const getDatesOfMonth = (month: string) => {
  const dates: number[] = []
  const firstDayOfMonth = dayjs(month).startOf('month')
  const lastDayOfMonth = dayjs(month).endOf('month')
  let currentDate = firstDayOfMonth
  while (currentDate.isBefore(lastDayOfMonth) || currentDate.isSame(lastDayOfMonth)) {
    dates.push(currentDate.valueOf())
    currentDate = currentDate.add(1, 'day')
  }
  return dates
}

/**
 * 将日期数组按照周分组
 * @param {Array} dates - 日期的时间戳数组
 * @returns {Object} 返回一个对象，按照周分组，每个键对应一周的日期数组
 */
export const groupDatesByWeek = (dates: number[]) => {
  const groups: {
    [key: string]: number[]
  } = {}
  dates.forEach((date) => {
    const week = dayjs(date).isoWeek()
    if (!groups[week]) {
      groups[week] = []
    }
    groups[week].push(date)
  })
  return groups
}

/**
 * 获取指定日期的日程数量
 * @param {string} date - 指定日期，格式为 'YYYY-MM-DD'
 * @param {Array} scheduleList - 一个日程数组，数组中每个元素包含起止日期等信息
 * @returns {number} 返回指定日期的日程数量
 */
export const getActivityCountInDay = (date: string, scheduleList: GanttActivity<any>[]) => {
  if (!date || !scheduleList?.length) {
    return 0
  }
  const count = scheduleList.reduce((count: number, current) => {
    if (!current.startDate || current.startDate === '--' || !current.endDate || current.endDate === '--') {
      return count
    }
    // 如果指定日期在当前日程的起止日期之间，计数器加 1
    return dayjs(date).isBetween(current.startDate, current.endDate, null, '[]') ? ++count : count
  }, 0)
  return count
}

/**
 * 检查两个时间范围是否有重叠
 * @param range1Start 第一个时间范围的开始时间
 * @param range1End 第一个时间范围的结束时间
 * @param range2Start 第二个时间范围的开始时间
 * @param range2End 第二个时间范围的结束时间
 * @returns 如果有重叠则返回 true，否则返回 false
 */
export const isOverlap = (
  range1Start: string,
  range1End: string,
  range2Start: string,
  range2End: string,
): boolean => {
  // 检查第一个时间范围是否与第二个时间范围重叠
  return (
    dayjs(range1Start)?.isBetween(range2Start, range2End, null, '[]') ||
    dayjs(range1End)?.isBetween(range2Start, range2End, null, '[]') ||
    // 检查第二个时间范围是否与第一个时间范围重叠
    dayjs(range2Start)?.isBetween(range1Start, range1End, null, '[]') ||
    dayjs(range2End)?.isBetween(range1Start, range1End, null, '[]')
  );
}
