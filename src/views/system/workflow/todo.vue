<template>
  <div class="app-container">
    <!--工具栏-->
    <div class="head-container">
      <el-button
        v-permission="['admin','workflow:approve']"
        type="primary"
        icon="el-icon-check"
        :disabled="selectedRows.length === 0"
        @click="handleBatchApprove"
      >
        批量同意
      </el-button>
      <el-button
        v-permission="['admin','workflow:reject']"
        type="danger"
        icon="el-icon-close"
        :disabled="selectedRows.length === 0"
        @click="handleBatchReject"
      >
        批量拒绝
      </el-button>
    </div>
    <!--表格渲染-->
    <el-table ref="table" v-loading="loading" :data="todoList" style="width: 100%;" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" />
      <el-table-column prop="id" label="任务ID" width="100" />
      <el-table-column prop="applicant" label="申请人" />
      <el-table-column prop="content" label="申请内容" />
      <el-table-column prop="applyTime" label="申请时间" />
      <el-table-column prop="currentNode" label="当前节点" />
      <el-table-column label="操作" width="200px" align="center" fixed="right">
        <template slot-scope="scope">
          <el-button
            v-permission="['admin','workflow:approve']"
            type="text"
            size="small"
            icon="el-icon-check"
            @click="handleApprove(scope.row)"
          >
            同意
          </el-button>
          <el-button
            v-permission="['admin','workflow:reject']"
            type="text"
            size="small"
            icon="el-icon-close"
            @click="handleReject(scope.row)"
          >
            拒绝
          </el-button>
        </template>
      </el-table-column>
    </el-table>
    <!--分页组件-->
    <pagination
      v-show="total > 0"
      :total="total"
      :page.sync="listQuery.page"
      :limit.sync="listQuery.limit"
      @pagination="getList"
    />
    <!--审批对话框-->
    <el-dialog
      :title="approveDialogTitle"
      :visible.sync="approveDialogVisible"
      width="500px"
    >
      <el-form ref="approveForm" :model="approveForm" label-width="100px">
        <el-form-item label="审批意见">
          <el-input
            v-model="approveForm.comment"
            type="textarea"
            rows="4"
            placeholder="请输入审批意见"
          />
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="approveDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleApproveSubmit">确定</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { getTodoList, approveTask, rejectTask, batchApprove } from '@/api/system/workflow'
import Pagination from '@/components/Pagination'

export default {
  name: 'WorkflowTodo',
  components: { Pagination },
  data() {
    return {
      loading: false,
      todoList: [],
      total: 0,
      listQuery: {
        page: 1,
        limit: 20
      },
      selectedRows: [],
      approveDialogVisible: false,
      approveDialogTitle: '',
      currentTask: null,
      currentAction: '',
      approveForm: {
        comment: ''
      }
    }
  },
  created() {
    this.getList()
  },
  methods: {
    getList() {
      this.loading = true
      getTodoList(this.listQuery).then(response => {
        this.todoList = response.data
        this.total = response.total
        this.loading = false
      }).catch(error => {
        console.error('获取待办列表失败:', error)
        this.loading = false
      })
    },
    handleApprove(row) {
      this.approveDialogTitle = '同意审批'
      this.currentTask = row
      this.currentAction = 'approve'
      this.approveForm.comment = ''
      this.approveDialogVisible = true
    },
    handleReject(row) {
      this.approveDialogTitle = '拒绝审批'
      this.currentTask = row
      this.currentAction = 'reject'
      this.approveForm.comment = ''
      this.approveDialogVisible = true
    },
    handleApproveSubmit() {
      const data = {
        taskId: this.currentTask.id,
        comment: this.approveForm.comment
      }
      let apiCall
      if (this.currentAction === 'approve') {
        apiCall = approveTask(data)
      } else {
        apiCall = rejectTask(data)
      }
      apiCall.then(() => {
        this.$message.success(this.currentAction === 'approve' ? '同意审批成功' : '拒绝审批成功')
        this.approveDialogVisible = false
        this.getList()
      }).catch(error => {
        console.error('审批操作失败:', error)
        this.$message.error(this.currentAction === 'approve' ? '同意审批失败' : '拒绝审批失败')
      })
    },
    handleBatchApprove() {
      this.$confirm('确定要批量同意选中的审批任务吗？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        const taskIds = this.selectedRows.map(row => row.id)
        batchApprove({ taskIds, comment: '批量同意' }).then(() => {
          this.$message.success('批量同意成功')
          this.getList()
        }).catch(error => {
          console.error('批量同意失败:', error)
          this.$message.error('批量同意失败')
        })
      }).catch(() => {})
    },
    handleBatchReject() {
      this.$confirm('确定要批量拒绝选中的审批任务吗？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        const taskIds = this.selectedRows.map(row => row.id)
        // 这里假设批量拒绝的API与批量同意类似
        batchApprove({ taskIds, comment: '批量拒绝', action: 'reject' }).then(() => {
          this.$message.success('批量拒绝成功')
          this.getList()
        }).catch(error => {
          console.error('批量拒绝失败:', error)
          this.$message.error('批量拒绝失败')
        })
      }).catch(() => {})
    },
    handleSelectionChange(rows) {
      this.selectedRows = rows
    }
  }
}
</script>
