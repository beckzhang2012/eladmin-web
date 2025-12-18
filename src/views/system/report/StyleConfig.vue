<template>
  <div class="style-config">
    <el-form :model="value" label-width="120px" size="small">
      <el-form-item label="图表标题">
        <el-input v-model="value.title" placeholder="请输入图表标题" />
      </el-form-item>
      <el-form-item label="图例位置">
        <el-select v-model="value.legendPosition" placeholder="请选择图例位置">
          <el-option label="顶部" value="top" />
          <el-option label="底部" value="bottom" />
          <el-option label="左侧" value="left" />
          <el-option label="右侧" value="right" />
        </el-select>
      </el-form-item>
      <el-form-item label="图表颜色">
        <el-color-picker
          v-model="color"
          show-text
          placeholder="请选择图表颜色"
          @change="onColorChange"
        />
      </el-form-item>
      <el-form-item label="颜色列表">
        <el-input
          v-model="value.colors"
          placeholder="请输入颜色列表，用逗号分隔"
        />
      </el-form-item>
      <el-form-item label="图表宽度">
        <el-input v-model="value.width" placeholder="请输入图表宽度，例如 100% 或 800px" />
      </el-form-item>
      <el-form-item label="图表高度">
        <el-input v-model="value.height" placeholder="请输入图表高度，例如 300px" />
      </el-form-item>
    </el-form>
  </div>
</template>

<script>
export default {
  name: 'StyleConfig',
  props: {
    value: {
      type: Object,
      default: () => ({})
    }
  },
  data() {
    return {
      color: ''
    }
  },
  created() {
    // 如果颜色列表存在且不为空，取第一个颜色作为当前选择的颜色
    if (this.value.colors && this.value.colors.length > 0) {
      const colors = this.value.colors.split(',')
      this.color = colors[0]
    }
  },
  methods: {
    onColorChange(val) {
      if (val) {
        // 如果颜色列表为空，直接设置为当前颜色
        if (!this.value.colors || this.value.colors.length === 0) {
          this.$emit('input', {
            ...this.value,
            colors: val
          })
        } else {
          // 否则，替换第一个颜色
          const colors = this.value.colors.split(',')
          colors[0] = val
          this.$emit('input', {
            ...this.value,
            colors: colors.join(',')
          })
        }
      }
    },
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
.style-config {
  padding: 10px 0;
}
</style>
