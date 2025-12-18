import request from '@/utils/request'

// 流程配置相关API
export function addWorkflow(data) {
  return request({
    url: 'api/workflow',
    method: 'post',
    data
  })
}

export function delWorkflow(ids) {
  return request({
    url: 'api/workflow',
    method: 'delete',
    data: ids
  })
}

export function editWorkflow(data) {
  return request({
    url: 'api/workflow',
    method: 'put',
    data
  })
}

export function getWorkflowList(params) {
  return request({
    url: 'api/workflow',
    method: 'get',
    params
  })
}

// 审批任务相关API
export function getTodoList(params) {
  return request({
    url: 'api/workflow/todo',
    method: 'get',
    params
  })
}

export function getDoneList(params) {
  return request({
    url: 'api/workflow/done',
    method: 'get',
    params
  })
}

export function approveTask(data) {
  return request({
    url: 'api/workflow/approve',
    method: 'post',
    data
  })
}

export function rejectTask(data) {
  return request({
    url: 'api/workflow/reject',
    method: 'post',
    data
  })
}

export function batchApprove(data) {
  return request({
    url: 'api/workflow/batchApprove',
    method: 'post',
    data
  })
}

export function getApprovalHistory(taskId) {
  return request({
    url: `api/workflow/history/${taskId}`,
    method: 'get'
  })
}

export default { addWorkflow, editWorkflow, delWorkflow, getWorkflowList, getTodoList, getDoneList, approveTask, rejectTask, batchApprove, getApprovalHistory }
