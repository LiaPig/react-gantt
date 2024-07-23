import { Fragment } from 'react'
import { Popover } from 'antd'
import { DateProps } from '@/components/MonthList'
import { activityPadding, activityWidth } from '@/components/Gantt'
import type {
  GanttDataItem,
  GanttActivity,
  RenderItemBackground,
} from '@/vite-env'

export declare interface GanttDataProps extends GanttDataItem<unknown> {
  height: string | number
}

declare interface Props {
  data: GanttDataProps[]
  dateList: DateProps[]
  onClick?: (
    activity: GanttActivity<unknown>,
    index: number,
    ganttItem: GanttDataProps,
    ganttIndex: number
  ) => unknown
  renderItemBackground?: RenderItemBackground
}

function ActivityList({
  data,
  dateList = [],
  onClick,
  renderItemBackground,
}: Props) {
  const handleClick = async (
    activity: GanttActivity<unknown>,
    index: number,
    ganttItem: GanttDataProps,
    ganttIndex: number
  ) => {
    if (!onClick) {
      return
    }
    await onClick(activity, index, ganttItem, ganttIndex)
  }

  return (
    <div className="gantt-inner-activity-list">
      {data?.map((ganttItem, ganttIndex) => (
        <div
          key={ganttItem.id}
          className="relative flex whitespace-nowrap hover:bg-[#fafafa]"
          style={{
            height: ganttItem.height,
            width: `${dateList?.length * activityWidth}px`,
          }}
        >
          <>
            {/* 背景板 */}
            {dateList.map((item) => (
              <div
                key={`${ganttItem.id}-${item.yearMonthDate}`}
                className="inline-block h-full text-[#333] border-r border-b border-[#EEEEEE]"
                style={{
                  width: `${activityWidth}px`,
                  ...item.style,
                  ...(!item.style?.background && renderItemBackground
                    ? {
                        background: renderItemBackground(
                          item.yearMonthDate,
                          ganttItem.id
                        ),
                      }
                    : {}),
                }}
              ></div>
            ))}
            {/* 活动项 */}
            {ganttItem.activities.map((activity, activityIndex) => (
              <Fragment key={activity.id}>
                {activity?.tooltip && (
                  <Popover content={activity?.tooltip} placement="bottom">
                    <div
                      className="absolute text-center text-[#fff] text-[12px] text-ellipsis overflow-hidden border-solid border-[1px] border-[#fff] hover:opacity-80"
                      style={{
                        minWidth: `${activityWidth - activityPadding * 2}px`,
                        ...activity.style,
                        border: activity.name ? '1px solid #fff' : '0',
                      }}
                      onClick={async () =>
                        await handleClick(
                          activity,
                          activityIndex,
                          ganttItem,
                          ganttIndex
                        )
                      }
                    >
                      {activity.name}
                    </div>
                  </Popover>
                )}
                {!activity?.tooltip && (
                  <div
                    className="absolute text-center text-[#fff] text-[12px] text-ellipsis overflow-hidden border-solid border-[1px] border-[#fff] hover:opacity-80"
                    style={{
                      minWidth: `${activityWidth - activityPadding * 2}px`,
                      ...activity.style,
                      border: activity.name ? '1px solid #fff' : '0',
                    }}
                    onClick={async () =>
                      await handleClick(
                        activity,
                        activityIndex,
                        ganttItem,
                        ganttIndex
                      )
                    }
                  >
                    {activity.name}
                  </div>
                )}
              </Fragment>
            ))}
          </>
        </div>
      ))}
    </div>
  )
}

export default ActivityList
