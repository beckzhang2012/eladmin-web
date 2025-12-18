import request from '@/utils/request'

// 查询报表列表
export function listReport(query) {
  return request({
    url: '/api/reports',
    method: 'get',
    params: query
  })
}

// 查询报表详细
export function getReport(id) {
  return request({
    url: '/api/reports/' + id,
    method: 'get'
  })
}

// 新增报表
export function addReport(data) {
  return request({
    url: '/api/reports',
    method: 'post',
    data: data
  })
}

// 修改报表
export function updateReport(id, data) {
  return request({
    url: '/api/reports/' + id,
    method: 'put',
    data: data
  })
}

// 删除报表
export function delReport(id) {
  return request({
    url: '/api/reports/' + id,
    method: 'delete'
  })
}

// 获取数据源列表
export function listDataSources() {
  return request({
    url: '/api/data-sources',
    method: 'get'
  })
}

// 获取报表数据
export function getReportData(id, params) {
  return request({
    url: '/api/reports/' + id + '/data',
    method: 'get',
    params: params
  })
}
