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
        <el-select
          v-model="query.status"
          clearable
          size="small"
          placeholder="审批状态"
          class="filter-item"
          style="width: 120px"
          @change="crud.toQuery"
        >
          <el-option label="已同意" value="approved" />
          <el-option label="已拒绝" value="rejected" />
          <el-option label="已完成" value="completed" />
        </el-select>
        <date-range-picker v-model="query.handleTime" class="date-item" />
        <rrOperation />
      </div>
    </div>
    <!--表格渲染-->
    <el-table ref="table" v-loading="crud.loading" :data="crud.data" style="width: 100%;">
      <el-table-column prop="workflowName" label="流程名称" show-overflow-tooltip />
      <el-table-column prop="applicantName" label="申请人" show-overflow-tooltip />
      <el-table-column prop="content" label="申请内容" show-overflow-tooltip min-width="200" />
      <el-table-column prop="currentNodeName" label="当前节点" show-overflow-tooltip />
      <el-table-column label="审批状态" width="120" align="center">
        <template slot-scope="scope">
          <el-tag v-if="scope.row.status === 'approved'" type="success">已同意</el-tag>
          <el-tag v-if="scope.row.status === 'rejected'" type="danger">已拒绝</el-tag>
          <el-tag v-if="scope.row.status === 'completed'" type="primary">已完成</el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="handleTime" label="处理时间" width="180" show-overflow-tooltip />
      <el-table-column label="操作" width="120" align="center" fixed="right">
        <template slot-scope="scope">
          <el-button type="text" size="mini" @click="viewHistory(scope.row)">查看历史</el-button>
        </template>
      </el-table-column>
    </el-table>
    <!--分页组件-->
    <pagination />
    <!--审批历史弹窗-->
    <el-dialog :visible.sync="historyDialogVisible" title="审批历史" width="600px">
      <el-timeline v-if="approvalHistory.length > 0">
        <el-timeline-item
          v-for="(item, index) in approvalHistory"
          :key="index"
          :timestamp="item.handleTime"
        >
          <el-card>
            <h4>{{ item.nodeName }}</h4>
            <p>审批人: {{ item.approverName }}</p>
            <p>审批结果: <span :class="{ 'text-success': item.result === 'approved', 'text-danger': item.result === 'rejected' }">
              {{ item.result === 'approved' ? '同意' : item.result === 'rejected' ? '拒绝' : '待审批' }}
            </span></p>
            <p v-if="item.comment">审批意见: {{ item.comment }}</p>
          </el-card>
        </el-timeline-item>
      </el-timeline>
      <div v-else class="no-data">暂无审批历史</div>
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
  name: 'WorkflowDone',
  components: { rrOperation, pagination, DateRangePicker },
  cruds() {
    return CRUD({ title: '我的已办', url: 'api/workflow/done', crudMethod: { get: crudWorkflow.getDoneTasks }})
  },
  mixins: [presenter(), header(), crud()],
  data() {
    return {
      workflows: [],
      historyDialogVisible: false,
      approvalHistory: [],
      currentTask: null
    }
  },
  methods: {
    viewHistory(row) {
      this.currentTask = row
      this.historyDialogVisible = true
      // 模拟审批历史数据
      this.approvalHistory = [
        {
          nodeName: '部门经理审批',
          approverName: '张三',
          result: 'approved',
          comment: '同意',
          handleTime: '2023-05-10 10:30:00'
        },
        {
          nodeName: '总经理审批',
          approverName: '李四',
          result: 'approved',
          comment: '同意申请',
          handleTime: '2023-05-10 14:20:00'
        }
      ]
    }
  }
}
</script>

<style scoped>
.no-data {
  text-align: center;
  color: #909399;
  padding: 20px;
}
</style>
