// 导入消息API
import { getUnreadMessagesCount } from '@/api/message'

// 消息状态管理
const state = {
  unreadCount: 0
}

const mutations = {
  SET_UNREAD_COUNT: (state, count) => {
    state.unreadCount = count
  }
}

const actions = {
  // 获取未读消息数量
  getUnreadMessagesCount({ commit }) {
    return new Promise((resolve, reject) => {
      getUnreadMessagesCount().then(response => {
        const { data } = response
        commit('SET_UNREAD_COUNT', data)
        resolve(data)
      }).catch(error => {
        reject(error)
      })
    })
  }
}

const getters = {
  unreadCount: state => state.unreadCount
}

export default {
  namespaced: true,
  state,
  mutations,
  actions,
  getters
}
