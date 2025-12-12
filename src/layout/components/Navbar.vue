<template>
  <div class="navbar">
    <hamburger id="hamburger-container" :is-active="sidebar.opened" class="hamburger-container" @toggleClick="toggleSideBar" />

    <breadcrumb id="breadcrumb-container" class="breadcrumb-container" />

    <div class="right-menu">
      <template v-if="device!=='mobile'">
        <search id="header-search" class="right-menu-item" />

        <el-tooltip content="消息通知" effect="dark" placement="bottom">
          <el-dropdown class="right-menu-item hover-effect" trigger="click">
            <div class="message-icon-wrapper">
              <i class="el-icon-bell" />
              <span v-if="unreadCount > 0" class="unread-badge">{{ unreadCount }}</span>
            </div>
            <el-dropdown-menu slot="dropdown" class="message-dropdown">
              <div class="message-header">
                <span>最近消息</span>
                <el-button size="mini" @click="markAllAsRead">全部已读</el-button>
              </div>
              <el-scrollbar wrap-class="message-scrollbar">
                <el-dropdown-item v-for="msg in messageList" :key="msg.id" class="message-item">
                  <div class="message-content">
                    <h4>{{ msg.title }}</h4>
                    <p>{{ msg.content }}</p>
                    <span class="message-time">{{ msg.createTime }}</span>
                  </div>
                </el-dropdown-item>
                <div v-if="messageList.length === 0" class="no-message">
                  <p>暂无消息</p>
                </div>
              </el-scrollbar>
              <div class="message-footer">
                <router-link to="/system/message">查看全部</router-link>
              </div>
            </el-dropdown-menu>
          </el-dropdown>
        </el-tooltip>

        <el-tooltip content="项目文档" effect="dark" placement="bottom">
          <Doc class="right-menu-item hover-effect" />
        </el-tooltip>

        <el-tooltip content="全屏缩放" effect="dark" placement="bottom">
          <screenfull id="screenfull" class="right-menu-item hover-effect" />
        </el-tooltip>

        <el-tooltip content="布局设置" effect="dark" placement="bottom">
          <size-select id="size-select" class="right-menu-item hover-effect" />
        </el-tooltip>

      </template>

      <el-dropdown class="avatar-container right-menu-item hover-effect" trigger="click">
        <div class="avatar-wrapper">
          <img :src="user.avatarName ? baseApi + '/avatar/' + user.avatarName : Avatar" class="user-avatar">
          <i class="el-icon-caret-bottom" />
        </div>
        <el-dropdown-menu slot="dropdown">
          <span style="display:block;" @click="show = true">
            <el-dropdown-item>
              布局设置
            </el-dropdown-item>
          </span>
          <router-link to="/user/center">
            <el-dropdown-item>
              个人中心
            </el-dropdown-item>
          </router-link>
          <span style="display:block;" @click="open">
            <el-dropdown-item divided>
              退出登录
            </el-dropdown-item>
          </span>
        </el-dropdown-menu>
      </el-dropdown>
    </div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import Breadcrumb from '@/components/Breadcrumb'
import Hamburger from '@/components/Hamburger'
import Doc from '@/components/Doc'
import Screenfull from '@/components/Screenfull'
import SizeSelect from '@/components/SizeSelect'
import Search from '@/components/HeaderSearch'
import Avatar from '@/assets/images/avatar.png'
import { listMessage, countUnreadMessage, markAllMessageAsRead } from '@/api/system/message'
import { formatDateTime } from '@/utils/datetime'
import settings from '@/settings'

export default {
  components: {
    Breadcrumb,
    Hamburger,
    Screenfull,
    SizeSelect,
    Search,
    Doc
  },
  data() {
    return {
      Avatar: Avatar,
      dialogVisible: false,
      messageList: [],
      unreadCount: 0,
      stompClient: null
    }
  },
  computed: {
    ...mapGetters([
      'sidebar',
      'device',
      'user',
      'baseApi'
    ]),
    show: {
      get() {
        return this.$store.state.settings.showSettings
      },
      set(val) {
        this.$store.dispatch('settings/changeSetting', {
          key: 'showSettings',
          value: val
        })
      }
    }
  },
  created() {
    this.getMessages()
    this.getUnread()
    // 每隔30秒刷新一次未读消息数量
    setInterval(() => {
      this.getUnread()
    }, 30000)
    // 连接WebSocket
    this.connectWebSocket()
  },
  beforeDestroy() {
    if (this.stompClient) {
      this.stompClient.disconnect()
    }
  },
  methods: {
    toggleSideBar() {
      this.$store.dispatch('app/toggleSideBar')
    },
    open() {
      this.$confirm('确定注销并退出系统吗？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.logout()
      })
    },
    logout() {
      this.$store.dispatch('LogOut').then(() => {
        location.reload()
      })
    },
    // 连接WebSocket
    connectWebSocket() {
      const socket = new this.$SockJS(settings.websocketUrl + '/ws')
      this.stompClient = this.$Stomp.over(socket)
      this.stompClient.connect({}, (frame) => {
        console.log('Connected: ' + frame)
        // 订阅消息通知
        this.stompClient.subscribe('/topic/message', (message) => {
          const msg = JSON.parse(message.body)
          // 显示消息通知
          this.$notify({
            title: '新消息',
            message: msg.content,
            type: 'info',
            duration: 5000
          })
          // 刷新消息列表和未读数量
          this.getMessages()
          this.getUnread()
        })
      }, (error) => {
        console.error('WebSocket连接失败:', error)
        // 尝试重新连接
        setTimeout(() => {
          this.connectWebSocket()
        }, 5000)
      })
    },
    // 获取消息列表
    getMessages() {
      listMessage({ page: 0, size: 10 }).then(res => {
        this.messageList = res.content.map(msg => {
          msg.createTime = formatDateTime(msg.createTime)
          return msg
        })
      })
    },
    // 获取未读消息数量
    getUnread() {
      countUnreadMessage().then(res => {
        this.unreadCount = res
      })
    },
    // 标记所有消息为已读
    markAllAsRead() {
      markAllMessageAsRead().then(() => {
        this.unreadCount = 0
        this.$message.success('已标记所有消息为已读')
      })
    }
  }
}
</script>

<style lang="scss" scoped>
.navbar {
  height: 50px;
  overflow: hidden;
  position: relative;
  background: #fff;
  box-shadow: 0 1px 4px rgba(0,21,41,.08);

  .hamburger-container {
    line-height: 46px;
    height: 100%;
    float: left;
    cursor: pointer;
    transition: background .3s;
    -webkit-tap-highlight-color:transparent;

    &:hover {
      background: rgba(0, 0, 0, .025)
    }
  }

  .breadcrumb-container {
    float: left;
  }

  .errLog-container {
    display: inline-block;
    vertical-align: top;
  }

  .right-menu {
    float: right;
    height: 100%;
    line-height: 50px;

    &:focus {
      outline: none;
    }

    .right-menu-item {
      display: inline-block;
      padding: 0 8px;
      height: 100%;
      font-size: 18px;
      color: #5a5e66;
      vertical-align: text-bottom;

      &.hover-effect {
        cursor: pointer;
        transition: background .3s;

        &:hover {
          background: rgba(0, 0, 0, .025)
        }
      }
    }

    .avatar-container {
      margin-right: 30px;

      .avatar-wrapper {
        margin-top: 5px;
        position: relative;

        .user-avatar {
          cursor: pointer;
          width: 40px;
          height: 40px;
          border-radius: 10px;
        }

        .el-icon-caret-bottom {
          cursor: pointer;
          position: absolute;
          right: -20px;
          top: 25px;
          font-size: 12px;
        }
      }
    }

    .message-icon-wrapper {
      position: relative;

      .unread-badge {
        position: absolute;
        top: 8px;
        right: 5px;
        background-color: #f56c6c;
        color: #fff;
        border-radius: 50%;
        width: 18px;
        height: 18px;
        line-height: 18px;
        text-align: center;
        font-size: 12px;
      }
    }

    .message-dropdown {
      width: 350px;
      padding: 0;

      .message-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 10px 20px;
        border-bottom: 1px solid #e6e6e6;
      }

      .message-scrollbar {
        height: 300px;
        padding: 10px 0;

        .message-item {
          padding: 10px 20px;
          cursor: pointer;
          transition: background 0.3s;

          &:hover {
            background: #f5f7fa;
          }

          .message-content {
            h4 {
              margin: 0 0 5px 0;
              font-size: 14px;
              font-weight: bold;
            }

            p {
              margin: 0 0 5px 0;
              font-size: 13px;
              color: #666;
            }

            .message-time {
              font-size: 12px;
              color: #999;
            }
          }
        }

        .no-message {
          text-align: center;
          padding: 50px 0;
          color: #999;
        }
      }

      .message-footer {
        padding: 10px 20px;
        border-top: 1px solid #e6e6e6;
        text-align: center;
      }
    }
  }
}
</style>
