import { useEffect, useMemo, useRef } from 'react'
import { Empty } from 'antd'
import MonthList from '@/components/MonthList'
import ActivityList from '@/components/ActivityList'
import dayjs from 'dayjs'
import { getMonthsInRange, getDatesOfMonth, groupDatesByWeek, getActivityCountInDay, isOverlap } from '@/utils/tools'
import { isWorkday } from 'cn-workday'
import { GanttDataItem, GanttActivity, GanttDateTooltip, DateBackgroundColorItem, RenderItemBackground } from '@/vite-env'

// Gantt图组件接口的传参类型
declare interface GanttProps {
  scrollHeight?: string
  header?: React.ReactNode
  ganttData: GanttDataItem<any>[]
  itemTitle?: string
  dateTooltipList?: GanttDateTooltip[]
  dateBackgroundColorList?: DateBackgroundColorItem[]
  onActivityClick?: (activity: GanttActivity<any>, activityIndex: number, ganttItem: GanttDataItem<any>, ganttIndex: number) => void
  renderItemBackground?: RenderItemBackground
}

export const activityWidth = 44
export const activityPadding = 2
export const itemWidth = activityWidth * 3

const getActivityWidth = (startDate: string, endDate: string) => {
  const diffNum = dayjs(new Date(endDate)).diff(new Date(startDate), 'hour') / 24
  return `${(diffNum + 1) * activityWidth - (2 * activityPadding)}px`
}
const getActivityLeft = (startDate: string, dateList: { yearMonthDate: string }[]) => {
  const index = dateList.findIndex(item => item?.yearMonthDate === startDate)
  if (index === -1) {
    return `${activityPadding}px`
  }
  return `${index * activityWidth + activityPadding}px`
}
const getActivityTop = (startDate: string, endDate: string, beforeList: GanttActivity<any>[], test?: boolean) => {
  const lastList = beforeList.filter(item =>
    isOverlap(item.startDate, item.endDate, startDate, endDate) && (item.startDate && item.startDate !== '--' && item.endDate && item.endDate !== '--')
  )
  const gridHeight = (activityWidth - 2 * activityPadding) / 2
  let count = lastList.length
  // 首个
  if (!count) {
    return `${activityPadding}px`
  }
  // 前面都是单个日期的
  if (!lastList.filter(item => item.startDate !== item.endDate).length) {
    return `${count * gridHeight + activityPadding}px`
  }
  // 前面还有空位
  const lastTopList = lastList.map(item => (Number(item.style?.top.split('px')?.[0]) - 2) / gridHeight)
  count = 0
  while (lastTopList.includes(count)) {
    count++
  }
  return `${count * gridHeight + activityPadding}px`
}
const soryByTwoDate = (activityList: GanttActivity<any>[]) => {
  if (!activityList?.length) {
    return []
  }
  const arr = [...activityList].sort((a, b) => {
    const aStart = dayjs(a.startDate).valueOf()
    const bStart = dayjs(b.startDate).valueOf()
    const aEnd = dayjs(a.endDate).valueOf()
    const bEnd = dayjs(b.endDate).valueOf()
    if (aStart < bStart) {
      return -1
    }
    if (aStart > bStart) {
      return 1
    }
    if (aEnd < bEnd) {
      return -1
    }
    if (aEnd > bEnd) {
      return 1
    }
    return 0
  })
  return arr
}

function Gantt({
  scrollHeight,
  header,
  ganttData = [],
  itemTitle = '人员',
  dateTooltipList = [],
  dateBackgroundColorList = [],
  renderItemBackground,
  onActivityClick
}: GanttProps) {
  const scrollXRef = useRef<HTMLDivElement>(null)
  const getDateBackground = (date: string) => {
    if (!date) {
      return ''
    }
    const item = dateBackgroundColorList?.find(item => item.date === date)
    if (!item || !item.bg) {
      return ''
    }
    return item.bg
  }
  const onClick = (activity: GanttActivity<any>, activityIndex: number, ganttItem: GanttDataItem<any>, ganttIndex: number) => {
    if (onActivityClick && typeof onActivityClick === 'function') {
      onActivityClick(activity, activityIndex, ganttItem, ganttIndex)
    }
  }

  const monthList = useMemo(() => {
    const tipTimeList = dateTooltipList?.map(item => new Date(item.date).getTime()).reverse() || []
    const dayList = ganttData.map(item => item?.activities?.map(item => [item.startDate, item.endDate]).flat()).flat()
    const dayTimeList = Array.from(new Set([...tipTimeList, ...dayList?.map(item => item ? new Date(item).getTime() : 0).filter(item => !!item)]))
    const minDay = Math.min(...dayTimeList)
    const maxDay = Math.max(...dayTimeList)
    //
    return getMonthsInRange(minDay, maxDay).map(item => {
      const currentMonth = dayjs(item)
      const datesOfMonth = getDatesOfMonth(item)
        ?.filter(item => (
          item >= minDay - (24 * 60 * 60 * 1000) && item <= maxDay
        ))
      const weeksOfMonth = Object.entries(groupDatesByWeek(datesOfMonth)).map(([value, list]) => ({
        value,
        data: list?.map((item: number) => {
          const current = dayjs(item)
          const isToday = current.format('YYYY-MM-DD') === dayjs(new Date()).format('YYYY-MM-DD')
          const isHoliday = !isWorkday(new Date(item))
          const yearMonthDate = current.format('YYYY-MM-DD')
          return {
            date: current.date(),
            dateStr: current.format('DD'),
            day: current.day(),
            dayStr: current.format('dd'),
            isToday,
            isHoliday,
            yearMonthDate,
            style: {
              background: isToday
                ? '#409eff'
                : isHoliday
                  ? '#0A0A0A0A'
                  : getDateBackground(yearMonthDate),
              color: isToday ? '#fff' : isHoliday ? '#40404040' : '',
              borderBottom: `1px solid ${isToday ? '#409eff' : '#EEEEEE'}`,
            }
          }
        })
      }))
      return {
        year: currentMonth.year(),
        month: currentMonth.month() + 1,
        monthStr: currentMonth.format('MM'),
        weekList: weeksOfMonth
      }
    })
  }, [ganttData, dateTooltipList])
  const dateList = useMemo(() => {
    return monthList.map(item => item?.weekList).flat().map(item => item.data).flat()
  }, [monthList])
  const itemHeightList = useMemo(() => {
    return ganttData.map(ganttItem => {
      const dateActivityNumList = dateList.map(item => getActivityCountInDay(item.yearMonthDate, ganttItem.activities))
      const maxActivitiesNum = Math.max(...dateActivityNumList)
      const gridHeight = (activityWidth - 2 * activityPadding) / 2
      const height = maxActivitiesNum <= 1 ? activityWidth : `${(maxActivitiesNum * gridHeight) + 2 * activityPadding}px`
      return {
        title: ganttItem.title,
        maxActivitiesNum,
        height
      }
    })
  }, [ganttData, dateList])
  const activityData = useMemo(() => {
    return ganttData?.map((item, index) => {
      const activities = soryByTwoDate(item.activities)
      const newActivities: GanttActivity<any>[] = []
      activities.forEach((activity) => {
        const width = getActivityWidth(activity.startDate, activity.endDate)
        const height = `${(activityWidth - 2 * activityPadding) / 2}px`
        const left = getActivityLeft(activity.startDate, dateList)
        const top = getActivityTop(activity.startDate, activity.endDate, newActivities, index === 0)
        newActivities.push({
          ...activity,
          style: {
            ...(activity.startDate === '--' || activity.endDate === '--' ? { display: 'none' } : {}),
            background: activity?.statusColor || '#BDD4F9',
            width,
            height,
            left,
            top
          }
        })
      })
      return {
        ...item,
        height: itemHeightList?.[index].height,
        activities: newActivities
      }
    })
  }, [ganttData, itemHeightList, dateList])

  useEffect(() => {
    const index = dateList.findIndex(item => item.isToday)
    const todayOffsetLeft = index * activityWidth
    if (!scrollXRef.current) {
      return
    }
    if (todayOffsetLeft > 0) {
      scrollXRef.current.scrollLeft = todayOffsetLeft - (scrollXRef.current.clientWidth / 2)
    } else {
      scrollXRef.current.scrollLeft = scrollXRef.current.scrollWidth
    }
  }, [dateList])

  return (
    <div className="gantt relative max-w-full">
      <div className="gantt-header w-full bg-white" style={{ height: `${activityWidth}px` }}>
        {header}
      </div>
      <div
        className="gantt-content relative flex w-full"
        style={scrollHeight ? { maxHeight: scrollHeight || `calc(100vh-${(activityWidth - activityPadding) * 2}px)` } : { maxHeight: `calc(100vh-${(activityWidth - activityPadding) * 2}px)` }}
      >
        {ganttData?.length > 0 && (
          <>
            <div
              className="gantt-guide absolute left-0 top-0 bg-[#fff] border-solid border-r-[1px] border-[#EEEEEE] z-30"
              style={{ width: `${itemWidth}px` }}
            >
              <div
                className="gantt-guide-title relative w-full font-[#000] font-bold border-solid boder-[1px] border-t-[1px] border-l-[1px] border-b-[1px] border-[#EEEEEE] bg-white"
                style={{ height: `${itemWidth}px` }}
              >
                <div
                  className="absolute left-0 top-0 h-[1px] bg-[#EEEEEE] transform rotate-45 origin-top-left"
                  style={{ width: `${(activityWidth + activityPadding) * 4}px` }}
                ></div>
                <div className="absolute top-[16px] right-[16px]">日期</div>
                <div className="absolute bottom-[16px] left-[16px]">{itemTitle}</div>
              </div>
            </div>
            <div ref={scrollXRef} className="gantt-inner relative overflow-x-auto">
              <div
                className="z-10 sticky top-0"
                style={{ paddingLeft: `${itemWidth}px`, width: `${dateList?.length * activityWidth + itemWidth}px` }}
              >
                <MonthList
                  data={monthList}
                  dateTooltipList={dateTooltipList}
                />
              </div>
              <div className="flex" style={{ width: `${dateList?.length * activityWidth + itemWidth}px` }}>
                <div className="bg-[#fff] w-full absolute">1</div>
                <div className="gantt-guide-content sticky left-0 text-center bg-[#fff] z-10">
                  {ganttData?.map((item, index) => (
                    <div
                      key={item?.id}
                      className="p-x-[10px] p-y-[2px] flex justify-center items-center font-[14px] text-[#333] border-solid border-[#EEEEEE] border-l-[1px] border-r-[1px] border-b-[1px]"
                      style={{ width: `${itemWidth}px`, height: itemHeightList?.[index].height }}
                    >
                      {item?.title}
                    </div>
                  ))}
                </div>
                <ActivityList
                  data={activityData}
                  dateList={dateList}
                  renderItemBackground={renderItemBackground}
                  onClick={onClick}
                />
              </div>
            </div>
          </>
        )}
        {ganttData?.length === 0 && (
          <div className="w-full p-8 border-[1px] border-solid border-[#EEEEEE]">
            <Empty />
          </div>
        )}
      </div>
    </div>
  )
}

export default Gantt
