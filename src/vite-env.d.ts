/// <reference types="vite/client" />

declare interface GanttDateTooltip {
  date: string
  dateTime: string
  content?: JSX.Element
}

declare interface GanttDataItem<T> {
  id: string | number;  // 唯一标识
  title: string | JSX.Element;  // 名称
  activities: GanttActivity<T>[]  // 牵涉到的各项活动
}

declare interface GanttActivity<T> {
  id: string
  title: string
  name: string
  startDate: string
  endDate: string
  data?: T
  statusColor?: string
  tooltip?: JSX.Element
  style?: {
    display?: string
    background: string
    width: string
    height: string
    left: string
    top: string
  }
}

declare type RenderItemBackground = (date: string, ganttItemId: string | number) => string

declare interface DateBackgroundColorItem {
  date: string
  bg: string
}
