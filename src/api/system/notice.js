import request from '@/utils/request'

/**
 * 获取通知列表
 * @param query
 * @returns {Promise<*>}
 */
export function getList(query) {
  return request({
    url: '/api/notice',
    method: 'get',
    params: query
  })
}

/**
 * 获取通知详情
 * @param id
 * @returns {Promise<*>}
 */
export function getDetail(id) {
  return request({
    url: `/api/notice/${id}`,
    method: 'get'
  })
}

/**
 * 新增通知
 * @param data
 * @returns {Promise<*>}
 */
export function add(data) {
  return request({
    url: '/api/notice',
    method: 'post',
    data: data
  })
}

/**
 * 修改通知
 * @param data
 * @returns {Promise<*>}
 */
export function edit(data) {
  return request({
    url: `/api/notice/${data.id}`,
    method: 'put',
    data: data
  })
}

/**
 * 删除通知
 * @param id
 * @returns {Promise<*>}
 */
export function del(id) {
  return request({
    url: `/api/notice/${id}`,
    method: 'delete'
  })
}

/**
 * 标记为已读
 * @param id
 * @returns {Promise<*>}
 */
export function markRead(id) {
  return request({
    url: `/api/notice/markRead/${id}`,
    method: 'put'
  })
}

/**
 * 批量标记为已读
 * @param ids
 * @returns {Promise<*>}
 */
export function batchMarkRead(ids) {
  return request({
    url: '/api/notice/batchMarkRead',
    method: 'put',
    data: ids
  })
}

/**
 * 批量删除通知
 * @param ids
 * @returns {Promise<*>}
 */
export function batchDel(ids) {
  return request({
    url: '/api/notice/batchDel',
    method: 'delete',
    data: ids
  })
}

/**
 * 发送系统通知
 * @param data
 * @returns {Promise<*>}
 */
export function sendSystemNotice(data) {
  return request({
    url: '/api/notice/sendSystemNotice',
    method: 'post',
    data: data
  })
}

/**
 * 发送站内消息
 * @param data
 * @returns {Promise<*>}
 */
export function sendInnerNotice(data) {
  return request({
    url: '/api/notice/sendInnerNotice',
    method: 'post',
    data: data
  })
}

/**
 * 发送公告
 * @param data
 * @returns {Promise<*>}
 */
export function sendAnnouncement(data) {
  return request({
    url: '/api/notice/sendAnnouncement',
    method: 'post',
    data: data
  })
}
