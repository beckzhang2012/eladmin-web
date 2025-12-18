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
          placeholder="输入流程名称搜索"
          style="width: 200px;"
          class="filter-item"
          @keyup.enter.native="crud.toQuery"
        />
        <el-select
          v-model="query.enabled"
          clearable
          size="small"
          placeholder="状态"
          class="filter-item"
          style="width: 90px"
          @change="crud.toQuery"
        >
          <el-option label="启用" value="true" />
          <el-option label="停用" value="false" />
        </el-select>
        <rrOperation />
      </div>
      <crudOperation show="" :permission="permission" />
    </div>
    <!--表单渲染-->
    <el-dialog append-to-body :close-on-click-modal="false" :before-close="crud.cancelCU" :visible.sync="crud.status.cu > 0" :title="crud.status.title" width="600px">
      <el-form ref="form" :model="form" :rules="rules" size="small" label-width="100px">
        <el-form-item label="流程名称" prop="name">
          <el-input v-model="form.name" placeholder="请输入流程名称" />
        </el-form-item>
        <el-form-item label="审批节点" prop="nodes">
          <el-button type="text" icon="el-icon-plus" @click="addNode">添加节点</el-button>
          <div v-for="(node, index) in form.nodes" :key="index" class="node-item">
            <el-input v-model="node.name" placeholder="节点名称" style="width: 200px; margin-right: 10px;" />
            <el-select v-model="node.approvers" multiple placeholder="选择审批人" style="width: 250px; margin-right: 10px;">
              <el-option v-for="user in users" :key="user.id" :label="user.nickName" :value="user.id" />
            </el-select>
            <el-button type="text" icon="el-icon-delete" @click="deleteNode(index)" />
          </div>
        </el-form-item>
        <el-form-item label="状态">
          <el-switch v-model="form.enabled" active-color="#409EFF" inactive-color="#F56C6C" />
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="text" @click="crud.cancelCU">取消</el-button>
        <el-button :loading="crud.status.cu === 2" type="primary" @click="crud.submitCU">确认</el-button>
      </div>
    </el-dialog>
    <!--表格渲染-->
    <el-table ref="table" v-loading="crud.loading" :data="crud.data" style="width: 100%;" @selection-change="crud.selectionChangeHandler">
      <el-table-column type="selection" width="55" />
      <el-table-column prop="name" label="流程名称" show-overflow-tooltip />
      <el-table-column label="审批节点数" width="120">
        <template slot-scope="scope">{{ scope.row.nodes ? scope.row.nodes.length : 0 }}</template>
      </el-table-column>
      <el-table-column label="状态" width="100" align="center">
        <template slot-scope="scope">
          <el-switch v-model="scope.row.enabled" active-color="#409EFF" inactive-color="#F56C6C" @change="changeEnabled(scope.row)" />
        </template>
      </el-table-column>
      <el-table-column prop="createTime" label="创建时间" width="180" show-overflow-tooltip />
      <el-table-column prop="updateTime" label="更新时间" width="180" show-overflow-tooltip />
      <el-table-column label="操作" width="120" align="center" fixed="right">
        <template slot-scope="scope">
          <udOperation :data="scope.row" :permission="permission" />
        </template>
      </el-table-column>
    </el-table>
    <!--分页组件-->
    <pagination />
  </div>
</template>

<script>
import crudWorkflow from '@/api/system/workflow'
import CRUD, { presenter, header, form, crud } from '@crud/crud'
import rrOperation from '@crud/RR.operation'
import crudOperation from '@crud/CRUD.operation'
import udOperation from '@crud/UD.operation'
import pagination from '@crud/Pagination'

export default {
  name: 'Workflow',
  components: { crudOperation, rrOperation, udOperation, pagination },
  cruds() {
    return CRUD({ title: '工作流', url: 'api/workflows', crudMethod: { add: crudWorkflow.addWorkflow, edit: crudWorkflow.editWorkflow, del: crudWorkflow.delWorkflow, get: crudWorkflow.getWorkflows }})
  },
  mixins: [presenter(), header(), form({ id: null, name: null, nodes: [], enabled: true }), crud()],
  data() {
    return {
      users: [
        { id: 1, nickName: '张三' },
        { id: 2, nickName: '李四' },
        { id: 3, nickName: '王五' },
        { id: 4, nickName: '赵六' }
      ],
      permission: {
        add: ['admin', 'workflow:add'],
        edit: ['admin', 'workflow:edit'],
        del: ['admin', 'workflow:del']
      },
      rules: {
        name: [
          { required: true, message: '请输入流程名称', trigger: 'blur' },
          { min: 2, max: 50, message: '长度在 2 到 50 个字符', trigger: 'blur' }
        ]
      }
    }
  },
  methods: {
    addNode() {
      this.form.nodes.push({ name: '', approvers: [] })
    },
    deleteNode(index) {
      this.form.nodes.splice(index, 1)
    },
    changeEnabled(row) {
      this.edit(row)
    }
  }
}
</script>

<style scoped>
.node-item {
  margin-bottom: 10px;
  display: flex;
  align-items: center;
}
</style>
