<template>
  <div class="navbar">
    <hamburger id="hamburger-container" :is-active="sidebar.opened" class="hamburger-container" @toggleClick="toggleSideBar" />

    <breadcrumb id="breadcrumb-container" class="breadcrumb-container" />

    <div class="right-menu">
      <template v-if="device!=='mobile'">
        <search id="header-search" class="right-menu-item" />

        <el-tooltip content="项目文档" effect="dark" placement="bottom">
          <Doc class="right-menu-item hover-effect" />
        </el-tooltip>

        <el-tooltip content="全屏缩放" effect="dark" placement="bottom">
          <screenfull id="screenfull" class="right-menu-item hover-effect" />
        </el-tooltip>

        <el-tooltip content="布局设置" effect="dark" placement="bottom">
          <size-select id="size-select" class="right-menu-item hover-effect" />
        </el-tooltip>

        <el-tooltip content="个人中心" placement="bottom">
          <router-link to="/profile" class="right-menu-item hover-effect">
            <i class="el-icon-user" />
          </router-link>
        </el-tooltip>

        <el-tooltip content="消息通知" effect="dark" placement="bottom">
          <el-dropdown trigger="click" class="right-menu-item hover-effect message-notification">
            <span class="el-dropdown-link notification-wrapper">
              <i class="el-icon-bell" />
              <el-badge :value="unreadCount" :hidden="unreadCount === 0" class="badge message-badge" />
            </span>
            <el-dropdown-menu slot="dropdown" class="message-dropdown">
              <div class="message-header">
                <span>消息通知</span>
                <el-button size="mini" type="text" @click="markAllAsRead">标记全部已读</el-button>
              </div>
              <el-scrollbar style="height: 300px;">
                <el-dropdown-item v-for="message in messages" :key="message.id" class="message-item" @click.native="markMessageAsRead(message.id)">
                  <div class="message-content" :class="{ unread: !message.read }">
                    <div class="message-title">{{ message.title }}</div>
                    <div class="message-time">{{ message.createTime }}</div>
                    <div class="message-text">{{ message.content }}</div>
                  </div>
                </el-dropdown-item>
                <div v-if="messages.length === 0" class="no-message">暂无消息</div>
              </el-scrollbar>
            </el-dropdown-menu>
          </el-dropdown>
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
import { getMessages, markMessageAsRead, markAllMessagesAsRead } from '@/api/message'

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
      messages: [],
      intervalId: null
    }
  },
  computed: {
    ...mapGetters([
      'sidebar',
      'device',
      'user',
      'baseApi',
      'unreadCount'
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
  mounted() {
    this.getMessages()
    this.getUnreadMessagesCount()
    // 定时轮询获取未读消息数量
    this.intervalId = setInterval(() => {
      this.getUnreadMessagesCount()
    }, 30000)
  },
  beforeDestroy() {
    if (this.intervalId) {
      clearInterval(this.intervalId)
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
    // 获取消息列表
    getMessages() {
      getMessages().then(res => {
        this.messages = res.data
      })
    },
    // 获取未读消息数量
    getUnreadMessagesCount() {
      this.$store.dispatch('message/getUnreadMessagesCount')
    },
    // 标记消息为已读
    markMessageAsRead(id) {
      markMessageAsRead(id).then(() => {
        this.getMessages()
        this.getUnreadMessagesCount()
      })
    },
    // 标记所有消息为已读
    markAllAsRead() {
      markAllMessagesAsRead().then(() => {
        this.getMessages()
        this.getUnreadMessagesCount()
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

    .message-notification {
      .notification-wrapper {
        position: relative;
        display: inline-block;
        padding: 0 15px;
        cursor: pointer;
        transition: background .3s;
        &:hover {
          background: rgba(0, 0, 0, 0.025);
        }
      }

      .message-badge {
        position: absolute;
        top: 8px;
        right: 8px;
        transform: translate(50%, -50%);
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
        border-bottom: 1px solid #f0f0f0;
      }

      .message-item {
        padding: 15px 20px;
        border-bottom: 1px solid #f0f0f0;
        cursor: pointer;
        transition: background .3s;

        &:hover {
          background: #f5f7fa;
        }

        .message-content {
          .message-title {
            font-weight: bold;
            margin-bottom: 5px;
          }

          .message-time {
            font-size: 12px;
            color: #909399;
            margin-bottom: 5px;
          }

          .message-text {
            font-size: 14px;
            color: #606266;
            line-height: 1.5;
          }

          &.unread {
            background: #f5f7fa;
          }
        }
      }

      .no-message {
        text-align: center;
        padding: 20px;
        color: #909399;
      }
    }
  }
}
</style>
