<template>
  <div class="datasource-config">
    <el-form :model="value" label-width="120px" size="small">
      <el-form-item label="API 接口地址">
        <el-input v-model="value.url" placeholder="请输入 API 接口地址" />
      </el-form-item>
      <el-form-item label="请求方法">
        <el-select v-model="value.method" placeholder="请选择请求方法">
          <el-option label="GET" value="get" />
          <el-option label="POST" value="post" />
        </el-select>
      </el-form-item>
      <el-form-item label="请求参数">
        <el-input
          v-model="paramsJson"
          type="textarea"
          placeholder="请输入 JSON 格式的请求参数"
          rows="4"
          @input="onParamsChange"
        />
      </el-form-item>
      <el-form-item label="请求头">
        <el-input
          v-model="headersJson"
          type="textarea"
          placeholder="请输入 JSON 格式的请求头"
          rows="4"
          @input="onHeadersChange"
        />
      </el-form-item>
    </el-form>
  </div>
</template>

<script>
export default {
  name: 'DatasourceConfig',
  props: {
    value: {
      type: Object,
      default: () => ({})
    }
  },
  data() {
    return {
      paramsJson: '',
      headersJson: ''
    }
  },
  created() {
    this.paramsJson = JSON.stringify(this.value.params || {}, null, 2)
    this.headersJson = JSON.stringify(this.value.headers || {}, null, 2)
  },
  methods: {
    onParamsChange(val) {
      try {
        this.$emit('input', {
          ...this.value,
          params: JSON.parse(val)
        })
      } catch (e) {
        // 参数格式错误，忽略
      }
    },
    onHeadersChange(val) {
      try {
        this.$emit('input', {
          ...this.value,
          headers: JSON.parse(val)
        })
      } catch (e) {
        // 请求头格式错误，忽略
      }
    }
  }
}
</script>

<style scoped>
.datasource-config {
  padding: 10px 0;
}
</style>
