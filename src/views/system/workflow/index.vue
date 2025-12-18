<template>
  <div class="app-container">
    <!--工具栏-->
    <div class="head-container">
      <el-button
        v-permission="['admin','workflow:add']"
        type="primary"
        icon="el-icon-plus"
        @click="handleAdd"
      >
        新增流程
      </el-button>
    </div>
    <!--表格渲染-->
    <el-table ref="table" v-loading="loading" :data="workflows" style="width: 100%;" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" />
      <el-table-column prop="name" label="流程名称" />
      <el-table-column label="审批节点" width="300">
        <template slot-scope="scope">
          <div v-for="(node, index) in scope.row.nodes" :key="index">
            <span class="node-name">节点{{ index + 1 }}:</span>
            <span class="approvers">{{ node.approvers.join(', ') }}</span>
          </div>
        </template>
      </el-table-column>
      <el-table-column prop="status" label="状态" align="center">
        <template slot-scope="scope">
          <el-switch
            v-model="scope.row.enabled"
            active-color="#409EFF"
            inactive-color="#F56C6C"
            @change="handleStatusChange(scope.row)"
          />
        </template>
      </el-table-column>
      <el-table-column prop="createTime" label="创建时间" />
      <el-table-column label="操作" width="150px" align="center" fixed="right">
        <template slot-scope="scope">
          <el-button
            v-permission="['admin','workflow:edit']"
            type="text"
            size="small"
            @click="handleEdit(scope.row)"
          >
            编辑
          </el-button>
          <el-button
            v-permission="['admin','workflow:del']"
            type="text"
            size="small"
            @click="handleDelete(scope.row)"
          >
            删除
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
    <!--新增/编辑对话框-->
    <el-dialog
      :title="dialogTitle"
      :visible.sync="dialogVisible"
      width="600px"
      @close="handleDialogClose"
    >
      <el-form ref="form" :model="form" label-width="120px">
        <el-form-item label="流程名称" prop="name" :rules="[{ required: true, message: '请输入流程名称', trigger: 'blur' }]">
          <el-input v-model="form.name" placeholder="请输入流程名称" />
        </el-form-item>
        <el-form-item label="审批节点">
          <div v-for="(node, index) in form.nodes" :key="index" class="node-item">
            <div class="node-header">
              <span>节点{{ index + 1 }}</span>
              <el-button v-if="form.nodes.length > 1" type="text" size="mini" icon="el-icon-delete" @click="removeNode(index)">
                删除
              </el-button>
            </div>
            <el-select
              v-model="node.approvers"
              multiple
              placeholder="请选择审批人"
              style="width: 100%"
            >
              <el-option label="张三" value="zhangsan" />
              <el-option label="李四" value="lisi" />
              <el-option label="王五" value="wangwu" />
              <el-option label="赵六" value="zhaoliu" />
            </el-select>
          </div>
          <el-button type="text" icon="el-icon-plus" @click="addNode">
            添加节点
          </el-button>
        </el-form-item>
        <el-form-item label="状态">
          <el-switch v-model="form.enabled" active-color="#409EFF" inactive-color="#F56C6C" />
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSubmit">确定</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { getWorkflowList, addWorkflow, editWorkflow, delWorkflow } from '@/api/system/workflow'
import Pagination from '@/components/Pagination'

export default {
  name: 'WorkflowConfig',
  components: { Pagination },
  data() {
    return {
      loading: false,
      workflows: [],
      total: 0,
      listQuery: {
        page: 1,
        limit: 20
      },
      dialogVisible: false,
      dialogTitle: '',
      form: {
        name: '',
        nodes: [{ approvers: [] }],
        enabled: true
      },
      selectedRows: []
    }
  },
  created() {
    this.getList()
  },
  methods: {
    getList() {
      this.loading = true
      getWorkflowList(this.listQuery).then(response => {
        this.workflows = response.data
        this.total = response.total
        this.loading = false
      }).catch(error => {
        console.error('获取流程列表失败:', error)
        this.loading = false
      })
    },
    handleAdd() {
      this.dialogTitle = '新增流程'
      this.form = {
        name: '',
        nodes: [{ approvers: [] }],
        enabled: true
      }
      this.dialogVisible = true
    },
    handleEdit(row) {
      this.dialogTitle = '编辑流程'
      this.form = Object.assign({}, row)
      this.dialogVisible = true
    },
    handleDelete(row) {
      this.$confirm('确定要删除该流程吗？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        delWorkflow([row.id]).then(() => {
          this.$message.success('删除成功')
          this.getList()
        }).catch(error => {
          console.error('删除流程失败:', error)
          this.$message.error('删除失败')
        })
      }).catch(() => {})
    },
    handleStatusChange(row) {
      this.$confirm(`确定要${row.enabled ? '启用' : '停用'}该流程吗？`, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        editWorkflow(row).then(() => {
          this.$message.success('状态更新成功')
        }).catch(error => {
          console.error('更新状态失败:', error)
          row.enabled = !row.enabled
          this.$message.error('状态更新失败')
        })
      }).catch(() => {
        row.enabled = !row.enabled
      })
    },
    handleSubmit() {
      this.$refs.form.validate((valid) => {
        if (valid) {
          const submitData = Object.assign({}, this.form)
          if (submitData.id) {
            editWorkflow(submitData).then(() => {
              this.$message.success('编辑成功')
              this.dialogVisible = false
              this.getList()
            }).catch(error => {
              console.error('编辑流程失败:', error)
              this.$message.error('编辑失败')
            })
          } else {
            addWorkflow(submitData).then(() => {
              this.$message.success('新增成功')
              this.dialogVisible = false
              this.getList()
            }).catch(error => {
              console.error('新增流程失败:', error)
              this.$message.error('新增失败')
            })
          }
        }
      })
    },
    handleDialogClose() {
      this.$refs.form.resetFields()
    },
    addNode() {
      this.form.nodes.push({ approvers: [] })
    },
    removeNode(index) {
      this.form.nodes.splice(index, 1)
    },
    handleSelectionChange(rows) {
      this.selectedRows = rows
    }
  }
}
</script>

<style scoped>
.node-item {
  margin-bottom: 15px;
  padding: 10px;
  border: 1px solid #e6e6e6;
  border-radius: 4px;
}

.node-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
  font-weight: bold;
}

.approvers {
  margin-left: 5px;
}
</style>
