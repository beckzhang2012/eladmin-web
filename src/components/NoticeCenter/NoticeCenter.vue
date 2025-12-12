<template>
  <div class="notice-center">
    <el-dropdown trigger="click" @command="handleCommand">
      <div class="notice-btn">
        <i class="el-icon-bell" style="font-size: 20px; color: #fff;" />
        <span v-if="unreadCount > 0" class="unread-badge">{{ unreadCount }}</span>
      </div>
      <el-dropdown-menu slot="dropdown" class="notice-dropdown">
        <div class="dropdown-header">
          <span>通知中心</span>
          <el-button
            size="mini"
            type="text"
            @click="markAllRead"
          >标记全部已读</el-button>
        </div>
        <el-scrollbar wrap-class="scrollbar-wrapper" style="max-height: 400px;">
          <el-dropdown-item
            v-for="notice in notices"
            :key="notice.id"
            :command="{ type: 'view', notice: notice }"
            :class="{ 'unread-notice': !notice.readStatus }"
          >
            <div class="notice-item">
              <div class="notice-info">
                <h4 class="notice-title">{{ notice.title }}</h4>
                <p class="notice-content">{{ notice.content | truncate(50) }}</p>
              </div>
              <div class="notice-meta">
                <span class="notice-time">{{ notice.createTime }}</span>
                <el-tag :type="dict.label.notice_type[notice.type] && dict.label.notice_type[notice.type].type || 'info'" size="mini">
                  {{ dict.label.notice_type[notice.type] && dict.label.notice_type[notice.type].display_name || notice.type }}
                </el-tag>
              </div>
            </div>
          </el-dropdown-item>
          <div v-if="notices.length === 0" class="empty-notice">
            <i class="el-icon-bell" style="font-size: 40px; color: #ccc;" />
            <p>暂无通知</p>
          </div>
        </el-scrollbar>
        <div v-if="notices.length > 0" class="dropdown-footer">
          <el-button
            size="mini"
            type="text"
            @click="goToNoticePage"
          >查看全部</el-button>
        </div>
      </el-dropdown-menu>
    </el-dropdown>
  </div>
</template>

<script>

import { getList, markRead, batchMarkRead } from '@/api/system/notice'

export default {
  name: 'NoticeCenter',

  filters: {
    truncate(value, length) {
      if (!value) return ''
      if (value.length <= length) return value
      return value.substring(0, length) + '...'
    }
  },
  data() {
    return {
      notices: [],
      unreadCount: 0,
      timer: null
    }
  },
  created() {
    this.initDict('notice_type')
    this.loadNotices()
    // 每30秒刷新一次通知
    this.timer = setInterval(() => {
      this.loadNotices()
    }, 30000)
  },
  beforeDestroy() {
    if (this.timer) {
      clearInterval(this.timer)
    }
  },
  methods: {
    // 加载通知列表
    loadNotices() {
      const query = {
        page: 1,
        size: 10,
        sort: 'createTime,desc'
      }
      getList(query).then(res => {
        this.notices = res.content
        this.unreadCount = res.content.filter(item => !item.readStatus).length
      })
    },
    // 处理下拉菜单命令
    handleCommand(command) {
      if (command.type === 'view') {
        this.viewNotice(command.notice)
      }
    },
    // 查看通知详情
    viewNotice(notice) {
      // 打开通知详情页面
      this.$router.push(`/system/notice/${notice.id}`)
      // 标记为已读
      if (!notice.readStatus) {
        markRead(notice.id).then(() => {
          notice.readStatus = true
          this.unreadCount--
        })
      }
    },
    // 标记全部已读
    markAllRead() {
      const unreadIds = this.notices
        .filter(item => !item.readStatus)
        .map(item => item.id)
      if (unreadIds.length === 0) {
        this.$notify({ title: '已全部标记为已读', type: 'success', duration: 2000 })
        return
      }
      batchMarkRead(unreadIds).then(() => {
        this.notices.forEach(notice => {
          notice.readStatus = true
        })
        this.unreadCount = 0
        this.$notify({ title: '全部标记为已读', type: 'success', duration: 2000 })
      })
    },
    // 跳转到通知列表页面
    goToNoticePage() {
      this.$router.push('/system/notice')
    }
  }
}
</script>

<style rel="stylesheet/scss" lang="scss" scoped>
.notice-center {
  position: relative;

  .notice-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 48px;
    height: 48px;
    cursor: pointer;
    position: relative;

    .unread-badge {
      position: absolute;
      top: 8px;
      right: 8px;
      background-color: #f56c6c;
      color: white;
      font-size: 12px;
      padding: 1px 5px;
      border-radius: 10px;
      min-width: 18px;
      text-align: center;
    }
  }

  .notice-dropdown {
    width: 400px;

    .dropdown-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 12px 20px;
      border-bottom: 1px solid #ebeef5;

      span {
        font-weight: 600;
        font-size: 14px;
      }
    }

    .notice-item {
      padding: 12px 0;
      border-bottom: 1px solid #f5f7fa;

      &:last-child {
        border-bottom: none;
      }

      .notice-info {
        margin-bottom: 8px;

        .notice-title {
          margin: 0 0 4px 0;
          font-weight: 600;
          font-size: 14px;
          color: #303133;
        }

        .notice-content {
          margin: 0;
          font-size: 13px;
          color: #606266;
          line-height: 1.5;
        }
      }

      .notice-meta {
        display: flex;
        justify-content: space-between;
        align-items: center;

        .notice-time {
          font-size: 12px;
          color: #909399;
        }
      }
    }

    .unread-notice {
      background-color: #f0f9eb;

      .notice-title {
        color: #67c23a;
      }
    }

    .empty-notice {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 40px 0;

      p {
        margin: 12px 0 0 0;
        color: #909399;
        font-size: 14px;
      }
    }

    .dropdown-footer {
      padding: 12px 20px;
      text-align: center;
      border-top: 1px solid #ebeef5;
    }
  }
}
</style>
