import { Fragment, memo, useMemo } from 'react'
import { Space, Popover } from 'antd'
import { activityWidth, itemWidth } from '@/components/Gantt'
import { GanttDateTooltip } from '@/vite-env'

export declare interface DateProps {
  date: number;
  dateStr: string;
  day: number;
  dayStr: string;
  isToday: boolean;
  isHoliday: boolean;
  yearMonthDate: string;
  style: {
    background: string
    color: string
    borderBottom: string
  }
}
declare interface MonthProps {
  year: number;
  month: number;
  monthStr: string;
  weekList: {
    value: string;
    data: DateProps[];
  }[];
}

declare interface Props {
  data: MonthProps[]
  dateTooltipList?: GanttDateTooltip[]
}

function TipWrapper({ date, dateTooltipList, children }: { date: string, dateTooltipList?: GanttDateTooltip[], children: JSX.Element }) {
  const dateList = useMemo(() => {
    return dateTooltipList?.filter(item => item.date === date) || []
  }, [date, dateTooltipList])

  if (!dateList?.length) {
    return children
  }
  return (
    <>
      <Popover placement="bottom" content={(
        <Space direction="vertical" size={20}>
          {dateList?.map(item => (
            <div key={item.dateTime}>{item.content}</div>
          ))}
        </Space>
      )}>
        <div className="relative">
          {children}
          <div className="absolute left-[10px] top-[-12px] w-[20px] h-[20px] text-[12px] text-white leading-[20px] whitespace-nowrap  text-center bg-[#ff4d4f] rounded-[10px]">{dateList?.length}</div>
        </div>
      </Popover>
    </>
  )
}

function MonthList({ data, dateTooltipList }: Props) {
  return (
    <div className="gantt-inner-month-list flex bg-white">
      {data?.map(item => (
        <div key={`${item?.year}-${item?.monthStr}`} className={`height-[${itemWidth}px]`}>
          {/* 年-月 */}
          <div
            className="gantt-inner-date-list-item-month flex items-center justify-center text-black font-bold border-t border-r border-b border-[#EEEEEE]"
            style={{ height: `${activityWidth}px`, width: item.weekList?.length === 1 && item.weekList[0].data.length === 1 ? `${activityWidth}px` : 'auto' }}
          >
            {item?.year}-{item?.monthStr}
          </div>
          <div className="gantt-inner-date-list-item-week-list flex">
            {item.weekList?.map(week => (
              <Fragment key={`${item?.year}-${week.value}`}>
                {week?.data?.map(item => (
                  <Space direction="vertical" key={item.date} size={0}>
                    {/* 星期几 */}
                    <TipWrapper date={item.yearMonthDate} dateTooltipList={dateTooltipList}>
                      <div
                        className="flex justify-center items-center text-[#333] border-r border-b border-[#EEEEEE] relative"
                        style={{ width: `${activityWidth}px`, height: `${activityWidth}px`, ...item.style }}
                      >
                        {item?.dayStr}
                      </div>
                    </TipWrapper>
                    {/* 日期 */}
                    <div
                      className="flex justify-center items-center text-[#333] border-r border-b border-[#EEEEEE]"
                      style={{ width: `${activityWidth}px`, height: `${activityWidth}px`, ...item.style }}
                    >
                      {item?.dateStr}
                    </div>
                  </Space>
                ))}
              </Fragment>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}

export default memo(MonthList)
