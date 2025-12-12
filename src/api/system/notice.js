import request from '@/utils/request'

export default {
  // 获取消息列表
  list(query) {
    return request({
      url: '/api/notice',
      method: 'get',
      params: query
    })
  },
  // 获取消息详情
  get(id) {
    return request({
      url: `/api/notice/${id}`,
      method: 'get'
    })
  },
  // 标记为已读
  markRead(ids) {
    return request({
      url: '/api/notice/mark-read',
      method: 'put',
      data: ids
    })
  },
  // 删除单个消息
  delete(id) {
    return request({
      url: `/api/notice/${id}`,
      method: 'delete'
    })
  },
  // 批量删除
  deleteBatch(ids) {
    return request({
      url: '/api/notice/batch-delete',
      method: 'delete',
      data: ids
    })
  },
  // 发送消息
  send(data) {
    return request({
      url: '/api/notice/send',
      method: 'post',
      data: data
    })
  }
}
