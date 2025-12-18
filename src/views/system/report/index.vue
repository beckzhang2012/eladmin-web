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
          placeholder="输入报表名称搜索"
          style="width: 200px;"
          class="filter-item"
          @keyup.enter.native="crud.toQuery"
        />
        <rrOperation />
      </div>
      <crudOperation show="" :permission="permission" />
    </div>
    <!--表单渲染-->
    <el-dialog append-to-body :close-on-click-modal="false" :before-close="crud.cancelCU" :visible.sync="crud.status.cu > 0" :title="crud.status.title" width="600px">
      <el-form ref="form" :model="form" :rules="rules" size="small" label-width="100px">
        <el-form-item label="报表名称" prop="name">
          <el-input v-model="form.name" placeholder="请输入报表名称" />
        </el-form-item>
        <el-form-item label="数据源" prop="dataSource">
          <el-select v-model="form.dataSource" placeholder="请选择数据源">
            <el-option
              v-for="item in dataSources"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="图表类型" prop="chartType">
          <el-select v-model="form.chartType" placeholder="请选择图表类型">
            <el-option label="折线图" value="line" />
            <el-option label="柱状图" value="bar" />
            <el-option label="饼图" value="pie" />
            <el-option label="雷达图" value="radar" />
          </el-select>
        </el-form-item>
        <el-form-item label="刷新频率" prop="refreshInterval">
          <el-input-number v-model="form.refreshInterval" :min="0" :max="3600" placeholder="请输入刷新频率(秒)" />
        </el-form-item>
        <el-form-item label="备注" prop="remark">
          <el-input v-model="form.remark" type="textarea" placeholder="请输入备注" rows="3" />
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="text" @click="crud.cancelCU">取消</el-button>
        <el-button :loading="crud.status.cu === 2" type="primary" @click="crud.submitCU">确认</el-button>
      </div>
    </el-dialog>
    <!--报表配置对话框-->
    <el-dialog append-to-body :close-on-click-modal="false" :visible.sync="configDialogVisible" title="报表配置" width="800px">
      <report-config ref="reportConfig" :report-id="selectedReportId" @save="handleConfigSave" />
      <div slot="footer" class="dialog-footer">
        <el-button type="text" @click="configDialogVisible = false">取消</el-button>
      </div>
    </el-dialog>
    <!--表格渲染-->
    <el-table ref="table" v-loading="crud.loading" :data="crud.data" style="width: 100%;" @selection-change="crud.selectionChangeHandler">
      <el-table-column type="selection" width="55" />
      <el-table-column prop="name" label="报表名称" show-overflow-tooltip />
      <el-table-column prop="dataSource" label="数据源" show-overflow-tooltip />
      <el-table-column prop="chartType" label="图表类型" show-overflow-tooltip />
      <el-table-column prop="refreshInterval" label="刷新频率(秒)" />
      <el-table-column prop="createTime" label="创建时间" width="180" />
      <el-table-column prop="updateTime" label="更新时间" width="180" />
      <el-table-column
        v-if="checkPer(['admin','report:edit','report:del','report:config'])"
        label="操作"
        width="200"
        align="center"
        fixed="right"
      >
        <template slot-scope="scope">
          <udOperation
            :data="scope.row"
            :permission="permission"
          />
          <el-button
            v-permission="['admin','report:config']"
            size="mini"
            type="primary"
            icon="el-icon-setting"
            @click="handleConfig(scope.row)"
          >配置
          </el-button>
        </template>
      </el-table-column>
    </el-table>
    <!--分页组件-->
    <pagination />
  </div>
</template>

<script>
import crudReport from '@/api/system/report'
import CRUD, { presenter, header, form, crud } from '@crud/crud'
import rrOperation from '@crud/RR.operation'
import crudOperation from '@crud/CRUD.operation'
import udOperation from '@crud/UD.operation'
import pagination from '@crud/Pagination'
import ReportConfig from './reportConfig'

export default {
  name: 'Report',
  components: { ReportConfig, crudOperation, rrOperation, udOperation, pagination },
  cruds() {
    return CRUD({ title: '报表', url: 'api/reports', crudMethod: { ...crudReport }})
  },
  mixins: [presenter(), header(), form({
    id: null,
    name: null,
    dataSource: null,
    chartType: null,
    refreshInterval: 0,
    remark: null,
    config: {}
  }), crud()],
  data() {
    return {
      dataSources: [
        { value: 'api/users', label: '用户数据' },
        { value: 'api/depts', label: '部门数据' },
        { value: 'api/roles', label: '角色数据' },
        { value: 'api/jobs', label: '岗位数据' }
      ],
      configDialogVisible: false,
      selectedReportId: null,
      permission: {
        add: ['admin', 'report:add'],
        edit: ['admin', 'report:edit'],
        del: ['admin', 'report:del']
      },
      rules: {
        name: [
          { required: true, message: '请输入报表名称', trigger: 'blur' },
          { min: 1, max: 50, message: '长度在 1 到 50 个字符', trigger: 'blur' }
        ],
        dataSource: [
          { required: true, message: '请选择数据源', trigger: 'change' }
        ],
        chartType: [
          { required: true, message: '请选择图表类型', trigger: 'change' }
        ]
      }
    }
  },
  methods: {
    // 处理报表配置
    handleConfig(row) {
      this.selectedReportId = row.id
      this.configDialogVisible = true
    },
    // 处理配置保存
    handleConfigSave() {
      this.configDialogVisible = false
      this.$message.success('报表配置保存成功')
      this.crud.toQuery()
    }
  }
}
</script>
