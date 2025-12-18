import request from '@/utils/request'

// 流程配置相关 API
export function addWorkflow(data) {
  return request({
    url: 'api/workflows',
    method: 'post',
    data
  })
}

export function delWorkflow(ids) {
  return request({
    url: 'api/workflows',
    method: 'delete',
    data: ids
  })
}

export function editWorkflow(data) {
  return request({
    url: 'api/workflows',
    method: 'put',
    data
  })
}

export function getWorkflows(params) {
  return request({
    url: 'api/workflows',
    method: 'get',
    params
  })
}

// 审批任务相关 API
export function getTodoTasks(params) {
  return request({
    url: 'api/workflow/todo',
    method: 'get',
    params
  })
}

export function getDoneTasks(params) {
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

export function batchApproveTasks(data) {
  return request({
    url: 'api/workflow/batch/approve',
    method: 'post',
    data
  })
}

export function batchRejectTasks(data) {
  return request({
    url: 'api/workflow/batch/reject',
    method: 'post',
    data
  })
}

export default { addWorkflow, editWorkflow, delWorkflow, getWorkflows, getTodoTasks, getDoneTasks, approveTask, rejectTask, batchApproveTasks, batchRejectTasks }
