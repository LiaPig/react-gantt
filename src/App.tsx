import { ConfigProvider } from 'antd'
import zhCN from 'antd/locale/zh_CN'
import Gantt from '@/components/Gantt'
import dayjs from 'dayjs'
import 'dayjs/locale/zh-cn'

dayjs.locale('zh-cn')

function App() {
  return (
    <div className="p-[20px]">
      <ConfigProvider locale={zhCN}>
        <Gantt
          header={<h3>张三李四的甘特图</h3>}
          ganttData={[
            {
              id: 1,
              title: <div className="text-[#1677FF]">张三</div>,
              activities: [
                {
                  id: '1-1',
                  name: '项目1',
                  startDate: '2023-08-01',
                  endDate: '2023-08-11',
                  statusColor: '#1677FF',
                  tooltip: <div className="text-[#1677FF]">开始忙活项目1</div>,
                },
                {
                  id: '1-2',
                  name: '吃饭',
                  startDate: '2023-08-01',
                  endDate: '2023-08-01',
                  statusColor: '#673AEF',
                },
                {
                  id: '1-3',
                  name: '睡觉',
                  startDate: '2023-08-01',
                  endDate: '2023-08-01',
                  statusColor: '#367B31',
                },
                {
                  id: '1-4',
                  name: '打豆豆',
                  startDate: '2023-08-01',
                  endDate: '2023-08-01',
                  statusColor: '#827315',
                },
                {
                  id: '1-5',
                  name: '项目2',
                  startDate: '2023-08-11',
                  endDate: '2023-08-18',
                  tooltip: '开始忙活项目2',
                },
                {
                  id: '1-6',
                  name: '打豆豆',
                  startDate: '2023-08-14',
                  endDate: '2023-08-14',
                  statusColor: '#827315',
                },
              ],
            },
            {
              id: 2,
              title: '李四',
              activities: [
                {
                  id: '2-1',
                  name: '项目1',
                  startDate: '2023-08-10',
                  endDate: '2023-08-11',
                  statusColor: '#1677FF',
                },
                {
                  id: '2-2',
                  name: '项目2',
                  startDate: '2023-08-14',
                  endDate: '2023-08-18',
                  statusColor: 'rgb(133, 63, 175)',
                },
              ],
            },
          ]}
          dateTooltipList={[
            {
              date: '2023-08-01',
              content: <div className="text-[#1677FF]">张三今天很忙呀</div>,
            },
            {
              date: '2023-08-01',
              content: '李四今天就不忙',
            },
            {
              date: '2023-08-10',
              content: '李四开始忙起来了',
            },
            {
              date: '2023-08-14',
              content: '周三又打豆豆了',
            },
          ]}
          renderItemBackground={(
            date: string,
            ganttItemId: string | number
          ) => {
            if (
              ganttItemId === 1 &&
              dayjs(date)?.isBetween('2023-08-01', '2023-08-11', null, '[]')
            ) {
              return 'rgb(215, 255, 255)'
            }
            if (
              ganttItemId === 2 &&
              dayjs(date)?.isBetween('2023-08-14', '2023-08-18', null, '[]')
            ) {
              return 'rgb(230, 230, 250)'
            }
            return '' // 默认有颜色 #BDD4F9
          }}
        />
      </ConfigProvider>
    </div>
  )
}

export default App
