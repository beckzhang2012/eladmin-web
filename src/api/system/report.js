import request from '@/utils/request'

// 查询报表列表
export function listReport(query) {
  return request({
    url: '/system/report/list',
    method: 'get',
    params: query
  })
}

// 查询报表详细
export function getReport(id) {
  return request({
    url: '/system/report/' + id,
    method: 'get'
  })
}

// 新增报表
export function addReport(data) {
  return request({
    url: '/system/report',
    method: 'post',
    data: data
  })
}

// 修改报表
export function updateReport(data) {
  return request({
    url: '/system/report',
    method: 'put',
    data: data
  })
}

// 删除报表
export function delReport(id) {
  return request({
    url: '/system/report/' + id,
    method: 'delete'
  })
}

// 获取数据源列表
export function listDatasource() {
  return request({
    url: '/system/report/datasource/list',
    method: 'get'
  })
}

// 获取图表类型列表
export function listChartType() {
  return request({
    url: '/system/report/chartType/list',
    method: 'get'
  })
}

// 获取报表数据
export function getReportData(id) {
  return request({
    url: '/system/report/data/' + id,
    method: 'get'
  })
}
