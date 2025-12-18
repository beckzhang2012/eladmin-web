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
        <el-form-item label="数据源" prop="datasource">
          <el-select v-model="form.datasource" placeholder="请选择数据源">
            <el-option
              v-for="item in datasources"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="图表类型" prop="chartType">
          <el-select v-model="form.chartType" placeholder="请选择图表类型">
            <el-option
              v-for="item in chartTypes"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="刷新频率" prop="refreshRate">
          <el-input-number v-model="form.refreshRate" :min="0" :max="3600" placeholder="请输入刷新频率(秒)" />
        </el-form-item>
        <el-form-item label="报表描述" prop="description">
          <el-input v-model="form.description" type="textarea" placeholder="请输入报表描述" />
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="text" @click="crud.cancelCU">取消</el-button>
        <el-button :loading="crud.status.cu === 2" type="primary" @click="crud.submitCU">确认</el-button>
      </div>
    </el-dialog>
    <!--配置对话框-->
    <el-dialog append-to-body :close-on-click-modal="false" :visible.sync="configDialogVisible" title="报表配置" width="800px">
      <el-tabs v-model="activeTab">
        <el-tab-pane label="数据源配置" name="datasource">
          <datasource-config v-model="config.datasource" />
        </el-tab-pane>
        <el-tab-pane label="字段映射" name="fieldMapping">
          <field-mapping v-model="config.fieldMapping" />
        </el-tab-pane>
        <el-tab-pane label="样式设置" name="style">
          <style-config v-model="config.style" />
        </el-tab-pane>
      </el-tabs>
      <div slot="footer" class="dialog-footer">
        <el-button type="text" @click="configDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="saveConfig">保存配置</el-button>
      </div>
    </el-dialog>
    <!--表格渲染-->
    <el-table ref="table" v-loading="crud.loading" :data="crud.data" style="width: 100%;" @selection-change="crud.selectionChangeHandler">
      <el-table-column type="selection" width="55" />
      <el-table-column prop="name" label="报表名称" show-overflow-tooltip />
      <el-table-column prop="datasource" label="数据源" show-overflow-tooltip />
      <el-table-column prop="chartType" label="图表类型" show-overflow-tooltip />
      <el-table-column prop="refreshRate" label="刷新频率(秒)" />
      <el-table-column prop="description" label="报表描述" show-overflow-tooltip />
      <el-table-column prop="createTime" label="创建时间" show-overflow-tooltip />
      <el-table-column
        v-if="checkPer(['admin','report:edit','report:del'])"
        label="操作"
        width="180"
        align="center"
        fixed="right"
      >
        <template slot-scope="scope">
          <udOperation
            :data="scope.row"
            :permission="permission"
          />
          <el-button
            type="text"
            size="mini"
            icon="el-icon-setting"
            @click="openConfig(scope.row)"
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
import CRUD, { form } from '@/components/Crud/Crud'
import Crud from '@/mixins/crud'
import { listReport, getReport, addReport, updateReport, delReport, listDatasource, listChartType } from '@/api/system/report'
import DatasourceConfig from './DatasourceConfig'
import FieldMapping from './FieldMapping'
import StyleConfig from './StyleConfig'

export default {
  name: 'Report',
  components: {
    ...CRUD,
    DatasourceConfig,
    FieldMapping,
    StyleConfig
  },
  mixins: [Crud],
  data() {
    return {
      // 权限
      permission: {
        add: ['admin', 'report:add'],
        edit: ['admin', 'report:edit'],
        del: ['admin', 'report:del']
      },
      // 数据源列表
      datasources: [],
      // 图表类型列表
      chartTypes: [],
      // 配置对话框可见性
      configDialogVisible: false,
      // 当前配置的报表
      currentConfigReport: null,
      // 配置数据
      config: {
        datasource: {},
        fieldMapping: {},
        style: {}
      },
      // 当前激活的标签页
      activeTab: 'datasource'
    }
  },
  computed: {
    rules() {
      return {
        name: [
          { required: true, message: '请输入报表名称', trigger: 'blur' }
        ],
        datasource: [
          { required: true, message: '请选择数据源', trigger: 'change' }
        ],
        chartType: [
          { required: true, message: '请选择图表类型', trigger: 'change' }
        ]
      }
    }
  },
  created() {
    this.crud = new Crud({
      title: '报表',
      url: '/system/report',
      crudMethod: {
        ...form,
        query: listReport,
        add: addReport,
        edit: updateReport,
        del: delReport
      }
    })
    this.loadDatasources()
    this.loadChartTypes()
  },
  methods: {
    // 加载数据源列表
    loadDatasources() {
      listDatasource().then(response => {
        this.datasources = response.data
      })
    },
    // 加载图表类型列表
    loadChartTypes() {
      listChartType().then(response => {
        this.chartTypes = response.data
      })
    },
    // 打开配置对话框
    openConfig(row) {
      this.currentConfigReport = row
      this.configDialogVisible = true
      // 加载现有配置
      this.loadConfig(row.id)
    },
    // 加载配置
    loadConfig(id) {
      getReport(id).then(response => {
        const report = response.data
        this.config.datasource = report.datasourceConfig || {}
        this.config.fieldMapping = report.fieldMapping || {}
        this.config.style = report.styleConfig || {}
      })
    },
    // 保存配置
    saveConfig() {
      const data = {
        id: this.currentConfigReport.id,
        datasourceConfig: this.config.datasource,
        fieldMapping: this.config.fieldMapping,
        styleConfig: this.config.style
      }
      updateReport(data).then(() => {
        this.$notify({
          title: '保存成功',
          type: 'success',
          duration: 2500
        })
        this.configDialogVisible = false
        this.crud.init()
      })
    }
  }
}
</script>
