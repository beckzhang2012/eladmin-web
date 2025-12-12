// 导入Vuex状态管理
import store from '@/store'

class WebSocketClient {
  constructor() {
    // 获取当前用户ID
    this.userId = store.state.user.user ? store.state.user.user.id : null
    // WebSocket连接地址
    this.url = this.userId ? `${window.location.protocol === 'https:' ? 'wss://' : 'ws://'}${window.location.host}/ws/message/${this.userId}/` : null
    // WebSocket实例
    this.socket = null
    // 重连定时器
    this.reconnectTimer = null
    // 重连次数
    this.reconnectCount = 0
    // 最大重连次数
    this.maxReconnectCount = 5
    // 重连间隔时间（毫秒）
    this.reconnectInterval = 3000
  }

  // 连接WebSocket
  connect() {
    // 如果用户未登录，不连接WebSocket
    if (!this.userId) {
      console.log('用户未登录，不连接WebSocket')
      return
    }

    // 创建WebSocket实例
    this.socket = new WebSocket(this.url)

    // 连接成功回调
    this.socket.onopen = () => {
      console.log('WebSocket连接成功')
      // 重置重连次数
      this.reconnectCount = 0
      // 清除重连定时器
      if (this.reconnectTimer) {
        clearTimeout(this.reconnectTimer)
        this.reconnectTimer = null
      }
    }

    // 接收消息回调
    this.socket.onmessage = (event) => {
      // 解析消息
      const message = JSON.parse(event.data)
      // 处理消息
      this.handleMessage(message)
    }

    // 连接关闭回调
    this.socket.onclose = () => {
      console.log('WebSocket连接关闭')
      // 重连
      this.reconnect()
    }

    // 连接错误回调
    this.socket.onerror = (error) => {
      console.error('WebSocket连接错误', error)
      // 重连
      this.reconnect()
    }
  }

  // 处理消息
  handleMessage(message) {
    // 显示消息通知
    window.vm.$notify({
      title: '新消息',
      message: message.content,
      type: 'info',
      duration: 5000
    })
    // 更新未读消息数量
    store.dispatch('message/getUnreadMessagesCount')
  }

  // 重连
  reconnect() {
    // 检查重连次数是否超过最大值
    if (this.reconnectCount >= this.maxReconnectCount) {
      console.error('WebSocket重连次数超过最大值')
      return
    }

    // 增加重连次数
    this.reconnectCount++
    // 设置重连定时器
    this.reconnectTimer = setTimeout(() => {
      console.log(`WebSocket第${this.reconnectCount}次重连`)
      // 连接WebSocket
      this.connect()
    }, this.reconnectInterval * this.reconnectCount)
  }

  // 关闭WebSocket连接
  close() {
    // 关闭WebSocket实例
    if (this.socket) {
      this.socket.close()
    }
    // 清除重连定时器
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer)
      this.reconnectTimer = null
    }
  }
}

// 创建WebSocket实例
const websocket = new WebSocketClient()

// 导出WebSocket实例
export default websocket
