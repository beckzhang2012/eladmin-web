import request from '@/utils/request'

// 获取消息列表
export function getMessages() {
  return request({
    url: '/api/messages',
    method: 'get'
  })
}

// 获取未读消息数量
export function getUnreadMessagesCount() {
  return request({
    url: '/api/messages/unread/count',
    method: 'get'
  })
}

// 标记消息为已读
export function markMessageAsRead(id) {
  return request({
    url: '/api/messages/' + id + '/read',
    method: 'put'
  })
}

// 标记所有消息为已读
export function markAllMessagesAsRead() {
  return request({
    url: '/api/messages/read/all',
    method: 'put'
  })
}

// 删除消息
export function deleteMessage(id) {
  return request({
    url: '/api/messages/' + id,
    method: 'delete'
  })
}

// 发送消息
export function sendMessage(data) {
  return request({
    url: '/api/messages',
    method: 'post',
    data
  })
}
