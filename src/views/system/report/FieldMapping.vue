<template>
  <div class="field-mapping">
    <el-form :model="value" label-width="120px" size="small">
      <el-form-item label="X 轴字段">
        <el-input v-model="value.xAxis" placeholder="请输入 X 轴字段名" />
      </el-form-item>
      <el-form-item label="Y 轴字段">
        <el-input v-model="value.yAxis" placeholder="请输入 Y 轴字段名" />
      </el-form-item>
      <el-form-item label="系列字段">
        <el-input v-model="value.series" placeholder="请输入系列字段名" />
      </el-form-item>
      <el-form-item label="数据字段">
        <el-input v-model="value.dataField" placeholder="请输入数据字段名" />
      </el-form-item>
      <el-form-item label="分类字段">
        <el-input v-model="value.categoryField" placeholder="请输入分类字段名" />
      </el-form-item>
    </el-form>
  </div>
</template>

<script>
export default {
  name: 'FieldMapping',
  props: {
    value: {
      type: Object,
      default: () => ({})
    }
  },
  methods: {
    updateValue(field, val) {
      this.$emit('input', {
        ...this.value,
        [field]: val
      })
    }
  }
}
</script>

<style scoped>
.field-mapping {
  padding: 10px 0;
}
</style>
