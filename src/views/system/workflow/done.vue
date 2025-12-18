<template>
  <div class="app-container">
    <!--表格渲染-->
    <el-table ref="table" v-loading="loading" :data="doneList" style="width: 100%;">
      <el-table-column prop="id" label="任务ID" width="100" />
      <el-table-column prop="applicant" label="申请人" />
      <el-table-column prop="content" label="申请内容" />
      <el-table-column prop="applyTime" label="申请时间" />
      <el-table-column prop="approveTime" label="处理时间" />
      <el-table-column prop="result" label="处理结果" />
      <el-table-column label="操作" width="150px" align="center" fixed="right">
        <template slot-scope="scope">
          <el-button
            type="text"
            size="small"
            icon="el-icon-document"
            @click="handleViewHistory(scope.row)"
          >
            查看历史
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
    <!--审批历史对话框-->
    <el-dialog
      title="审批历史"
      :visible.sync="historyDialogVisible"
      width="600px"
    >
      <el-timeline v-if="historyList.length > 0">
        <el-timeline-item
          v-for="(item, index) in historyList"
          :key="index"
          :timestamp="item.timestamp"
        >
          <el-card>
            <h4>{{ item.approver }} - {{ item.action }}</h4>
            <p v-if="item.comment">{{ item.comment }}</p>
            <p v-else>无审批意见</p>
          </el-card>
        </el-timeline-item>
      </el-timeline>
      <div v-else class="no-data">暂无审批历史记录</div>
      <div slot="footer" class="dialog-footer">
        <el-button @click="historyDialogVisible = false">关闭</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { getDoneList, getApprovalHistory } from '@/api/system/workflow'
import Pagination from '@/components/Pagination'

export default {
  name: 'WorkflowDone',
  components: { Pagination },
  data() {
    return {
      loading: false,
      doneList: [],
      total: 0,
      listQuery: {
        page: 1,
        limit: 20
      },
      historyDialogVisible: false,
      historyList: []
    }
  },
  created() {
    this.getList()
  },
  methods: {
    getList() {
      this.loading = true
      getDoneList(this.listQuery).then(response => {
        this.doneList = response.data
        this.total = response.total
        this.loading = false
      }).catch(error => {
        console.error('获取已办列表失败:', error)
        this.loading = false
      })
    },
    handleViewHistory(row) {
      this.historyDialogVisible = true
      getApprovalHistory(row.id).then(response => {
        this.historyList = response.data
      }).catch(error => {
        console.error('获取审批历史失败:', error)
        this.$message.error('获取审批历史失败')
      })
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
