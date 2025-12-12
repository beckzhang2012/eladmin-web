<template>
  <div class="message-list">
    <el-card>
      <div slot="header" class="clearfix">
        <span>消息列表</span>
        <el-button type="primary" size="small" style="float: right;" @click="$router.push('/system/message/send')">发送消息</el-button>
      </div>
      <el-table
        v-loading="loading"
        :data="messageList"
        border
        fit
        highlight-current-row
        style="width: 100%;"
      >
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="title" label="消息标题" />
        <el-table-column prop="content" label="消息内容" show-overflow-tooltip />
        <el-table-column prop="createTime" label="发送时间" width="180" />
        <el-table-column prop="read" label="已读状态" width="100">
          <template slot-scope="scope">
            <el-tag :type="scope.row.read ? 'success' : 'warning'">
              {{ scope.row.read ? '已读' : '未读' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="200">
          <template slot-scope="scope">
            <el-button
              size="mini"
              type="text"
              icon="el-icon-view"
              @click="viewMessage(scope.row)"
            >查看</el-button>
            <el-button
              v-if="!scope.row.read"
              size="mini"
              type="text"
              icon="el-icon-check"
              @click="markAsRead(scope.row.id)"
            >标记已读</el-button>
            <el-button
              size="mini"
              type="text"
              icon="el-icon-delete"
              @click="deleteMessage(scope.row.id)"
            >删除</el-button>
          </template>
        </el-table-column>
      </el-table>
      <pagination
        v-show="total > 0"
        :total="total"
        :page.sync="queryParams.page"
        :limit.sync="queryParams.size"
        @pagination="getList"
      />
    </el-card>

    <!-- 消息详情对话框 -->
    <el-dialog
      title="消息详情"
      :visible.sync="dialogVisible"
      width="600px"
      append-to-body
    >
      <el-form :model="form" label-width="80px">
        <el-form-item label="消息标题">
          <span>{{ form.title }}</span>
        </el-form-item>
        <el-form-item label="消息内容">
          <div v-html="form.content" />
        </el-form-item>
        <el-form-item label="发送时间">
          <span>{{ form.createTime }}</span>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogVisible = false">关闭</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { listMessage, markMessageAsRead, deleteMessage } from '@/api/system/message'
import Pagination from '@/components/Pagination'

export default {
  name: 'MessageList',
  components: { Pagination },
  data() {
    return {
      loading: false,
      messageList: [],
      total: 0,
      queryParams: {
        page: 1,
        size: 10
      },
      dialogVisible: false,
      form: {}
    }
  },
  created() {
    this.getList()
  },
  methods: {
    // 获取消息列表
    getList() {
      this.loading = true
      listMessage(this.queryParams).then(res => {
        this.messageList = res.content
        this.total = res.totalElements
      }).finally(() => {
        this.loading = false
      })
    },
    // 查看消息详情
    viewMessage(row) {
      this.form = { ...row }
      this.dialogVisible = true
      // 如果消息未读，标记为已读
      if (!row.read) {
        this.markAsRead(row.id)
      }
    },
    // 标记消息为已读
    markAsRead(id) {
      markMessageAsRead(id).then(() => {
        this.$message.success('已标记为已读')
        this.getList()
      })
    },
    // 删除消息
    deleteMessage(id) {
      this.$confirm('确定要删除这条消息吗？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        deleteMessage(id).then(() => {
          this.$message.success('删除成功')
          this.getList()
        })
      })
    }
  }
}
</script>

<style scoped>
.message-list {
  padding: 20px;
}
</style>
