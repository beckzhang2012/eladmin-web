<template>
  <div class="report-config">
    <el-tabs v-model="activeTab" type="card">
      <!-- 数据源配置 -->
      <el-tab-pane label="数据源配置" name="dataSource">
        <el-form :model="config.dataSource" label-width="120px">
          <el-form-item label="API接口">
            <el-select v-model="config.dataSource.api" placeholder="请选择API接口">
              <el-option
                v-for="item in apiOptions"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              />
            </el-select>
          </el-form-item>
          <el-form-item label="请求方法">
            <el-select v-model="config.dataSource.method" placeholder="请选择请求方法">
              <el-option label="GET" value="get" />
              <el-option label="POST" value="post" />
            </el-select>
          </el-form-item>
          <el-form-item label="请求参数">
            <el-input v-model="config.dataSource.params" type="textarea" placeholder="请输入请求参数，格式为JSON" rows="4" />
          </el-form-item>
        </el-form>
      </el-tab-pane>
      <!-- 字段映射 -->
      <el-tab-pane label="字段映射" name="fieldMapping">
        <el-form :model="config.fieldMapping" label-width="120px">
          <el-form-item label="X轴字段">
            <el-input v-model="config.fieldMapping.xAxis" placeholder="请输入X轴字段名" />
          </el-form-item>
          <el-form-item label="Y轴字段">
            <el-input v-model="config.fieldMapping.yAxis" placeholder="请输入Y轴字段名" />
          </el-form-item>
          <el-form-item label="系列字段">
            <el-input v-model="config.fieldMapping.series" placeholder="请输入系列字段名" />
          </el-form-item>
          <el-form-item label="值字段">
            <el-input v-model="config.fieldMapping.value" placeholder="请输入值字段名" />
          </el-form-item>
        </el-form>
      </el-tab-pane>
      <!-- 样式设置 -->
      <el-tab-pane label="样式设置" name="style">
        <el-form :model="config.style" label-width="120px">
          <el-form-item label="图表标题">
            <el-input v-model="config.style.title" placeholder="请输入图表标题" />
          </el-form-item>
          <el-form-item label="标题颜色">
            <el-color-picker v-model="config.style.titleColor" />
          </el-form-item>
          <el-form-item label="图例位置">
            <el-select v-model="config.style.legendPosition" placeholder="请选择图例位置">
              <el-option label="上" value="top" />
              <el-option label="下" value="bottom" />
              <el-option label="左" value="left" />
              <el-option label="右" value="right" />
            </el-select>
          </el-form-item>
          <el-form-item label="主题颜色">
            <el-color-picker v-model="config.style.themeColor" />
          </el-form-item>
        </el-form>
      </el-tab-pane>
    </el-tabs>
    <div class="config-actions">
      <el-button type="primary" @click="saveConfig">保存配置</el-button>
    </div>
  </div>
</template>

<script>
import { getReport, updateReport } from '@/api/system/report'

export default {
  name: 'ReportConfig',
  props: {
    reportId: {
      type: Number,
      required: true
    }
  },
  data() {
    return {
      activeTab: 'dataSource',
      apiOptions: [
        { value: 'api/users', label: '用户数据' },
        { value: 'api/depts', label: '部门数据' },
        { value: 'api/roles', label: '角色数据' },
        { value: 'api/jobs', label: '岗位数据' },
        { value: 'api/timings', label: '定时任务数据' }
      ],
      config: {
        dataSource: {
          api: '',
          method: 'get',
          params: ''
        },
        fieldMapping: {
          xAxis: '',
          yAxis: '',
          series: '',
          value: ''
        },
        style: {
          title: '',
          titleColor: '#303133',
          legendPosition: 'top',
          themeColor: '#409EFF'
        }
      }
    }
  },
  mounted() {
    this.loadConfig()
  },
  methods: {
    // 加载报表配置
    async loadConfig() {
      try {
        const response = await getReport(this.reportId)
        if (response.data && response.data.config) {
          this.config = { ...this.config, ...response.data.config }
        }
      } catch (error) {
        console.error('加载报表配置失败:', error)
        this.$message.error('加载报表配置失败')
      }
    },
    // 保存报表配置
    async saveConfig() {
      try {
        await updateReport(this.reportId, { config: this.config })
        this.$message.success('配置保存成功')
        this.$emit('save')
      } catch (error) {
        console.error('保存报表配置失败:', error)
        this.$message.error('保存报表配置失败')
      }
    }
  }
}
</script>

<style scoped>
.report-config {
  padding: 10px;
}

.config-actions {
  margin-top: 20px;
  text-align: right;
}
</style>
