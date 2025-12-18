<template>
  <div class="app-container">
    <!--工具栏-->
    <div class="head-container">
      <div v-if="crud.props.searchToggle">
        <!-- 搜索 -->
        <el-input
          v-model="query.blurry"
          clearable
          size="small"
          placeholder="输入申请内容搜索"
          style="width: 200px;"
          class="filter-item"
          @keyup.enter.native="crud.toQuery"
        />
        <el-select
          v-model="query.workflowName"
          clearable
          size="small"
          placeholder="选择流程"
          class="filter-item"
          style="width: 150px"
          @change="crud.toQuery"
        >
          <el-option v-for="wf in workflows" :key="wf.id" :label="wf.name" :value="wf.name" />
        </el-select>
        <date-range-picker v-model="query.applyTime" class="date-item" />
        <rrOperation />
      </div>
      <el-button
        v-if="crud.selections.length > 0"
        type="primary"
        size="mini"
        class="filter-item"
        @click="batchApprove"
      >批量同意</el-button>
      <el-button
        v-if="crud.selections.length > 0"
        type="danger"
        size="mini"
        class="filter-item"
        @click="batchReject"
      >批量拒绝</el-button>
    </div>
    <!--表格渲染-->
    <el-table ref="table" v-loading="crud.loading" :data="crud.data" style="width: 100%;" @selection-change="crud.selectionChangeHandler">
      <el-table-column type="selection" width="55" />
      <el-table-column prop="workflowName" label="流程名称" show-overflow-tooltip />
      <el-table-column prop="applicantName" label="申请人" show-overflow-tooltip />
      <el-table-column prop="content" label="申请内容" show-overflow-tooltip min-width="200" />
      <el-table-column prop="currentNodeName" label="当前节点" show-overflow-tooltip />
      <el-table-column prop="applyTime" label="申请时间" width="180" show-overflow-tooltip />
      <el-table-column label="操作" width="150" align="center" fixed="right">
        <template slot-scope="scope">
          <el-button type="primary" size="mini" @click="approve(scope.row)">同意</el-button>
          <el-button type="danger" size="mini" @click="reject(scope.row)">拒绝</el-button>
        </template>
      </el-table-column>
    </el-table>
    <!--分页组件-->
    <pagination />
    <!--审批弹窗-->
    <el-dialog :visible.sync="approveDialogVisible" title="审批" width="400px">
      <el-form ref="approveForm" :model="approveForm" size="small" label-width="80px">
        <el-form-item label="审批意见">
          <el-input v-model="approveForm.comment" type="textarea" rows="3" placeholder="请输入审批意见" />
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="text" @click="approveDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="confirmApprove">确认同意</el-button>
      </div>
    </el-dialog>
    <!--拒绝弹窗-->
    <el-dialog :visible.sync="rejectDialogVisible" title="拒绝" width="400px">
      <el-form ref="rejectForm" :model="rejectForm" size="small" label-width="80px">
        <el-form-item label="拒绝理由" prop="comment">
          <el-input v-model="rejectForm.comment" type="textarea" rows="3" placeholder="请输入拒绝理由" />
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="text" @click="rejectDialogVisible = false">取消</el-button>
        <el-button type="danger" @click="confirmReject">确认拒绝</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import crudWorkflow from '@/api/system/workflow'
import CRUD, { presenter, header, crud } from '@crud/crud'
import rrOperation from '@crud/RR.operation'
import pagination from '@crud/Pagination'
import DateRangePicker from '@/components/DateRangePicker'

export default {
  name: 'WorkflowTodo',
  components: { rrOperation, pagination, DateRangePicker },
  cruds() {
    return CRUD({ title: '我的待办', url: 'api/workflow/todo', crudMethod: { get: crudWorkflow.getTodoTasks }})
  },
  mixins: [presenter(), header(), crud()],
  data() {
    return {
      workflows: [],
      approveDialogVisible: false,
      rejectDialogVisible: false,
      currentTask: null,
      approveForm: { comment: '' },
      rejectForm: { comment: '' },
      rules: {
        comment: [
          { required: true, message: '请输入拒绝理由', trigger: 'blur' }
        ]
      }
    }
  },
  methods: {
    approve(row) {
      this.currentTask = row
      this.approveForm = { comment: '' }
      this.approveDialogVisible = true
    },
    reject(row) {
      this.currentTask = row
      this.rejectForm = { comment: '' }
      this.rejectDialogVisible = true
    },
    confirmApprove() {
      crudWorkflow.approveTask({ id: this.currentTask.id, comment: this.approveForm.comment }).then(() => {
        this.$message.success('审批成功')
        this.approveDialogVisible = false
        this.crud.toQuery()
      }).catch(error => {
        this.$message.error('审批失败: ' + error.message)
      })
    },
    confirmReject() {
      if (!this.rejectForm.comment) {
        this.$message.error('请输入拒绝理由')
        return
      }
      crudWorkflow.rejectTask({ id: this.currentTask.id, comment: this.rejectForm.comment }).then(() => {
        this.$message.success('拒绝成功')
        this.rejectDialogVisible = false
        this.crud.toQuery()
      }).catch(error => {
        this.$message.error('拒绝失败: ' + error.message)
      })
    },
    batchApprove() {
      const ids = this.crud.selections.map(item => item.id)
      crudWorkflow.batchApproveTasks({ ids, comment: '' }).then(() => {
        this.$message.success('批量审批成功')
        this.crud.toQuery()
      }).catch(error => {
        this.$message.error('批量审批失败: ' + error.message)
      })
    },
    batchReject() {
      this.$prompt('请输入拒绝理由', '批量拒绝', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        inputType: 'textarea'
      }).then(({ value }) => {
        const ids = this.crud.selections.map(item => item.id)
        crudWorkflow.batchRejectTasks({ ids, comment: value }).then(() => {
          this.$message.success('批量拒绝成功')
          this.crud.toQuery()
        }).catch(error => {
          this.$message.error('批量拒绝失败: ' + error.message)
        })
      }).catch(() => {})
    }
  }
}
</script>
