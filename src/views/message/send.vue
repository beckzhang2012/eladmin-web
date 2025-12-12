<template>
  <div class="send-message">
    <el-form :model="form" label-width="80px">
      <el-form-item label="收件人">
        <el-select v-model="form.recipient" placeholder="请选择收件人">
          <el-option label="全部用户" value="all" />
          <el-option label="指定用户" value="specific" />
        </el-select>
      </el-form-item>
      <el-form-item label="标题">
        <el-input v-model="form.title" placeholder="请输入标题" />
      </el-form-item>
      <el-form-item label="内容">
        <WangEditor v-model="form.content" />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="send">发送</el-button>
        <el-button @click="reset">重置</el-button>
      </el-form-item>
    </el-form>
  </div>
</template>

<script>
import WangEditor from '@/components/WangEditor'
import { sendMessage } from '@/api/message'

export default {
  name: 'SendMessage',
  components: { WangEditor },
  data() {
    return {
      form: {
        recipient: 'all',
        title: '',
        content: ''
      }
    }
  },
  methods: {
    send() {
      sendMessage(this.form).then(() => {
        this.$message.success('发送成功')
        this.reset()
      })
    },
    reset() {
      this.form = {
        recipient: 'all',
        title: '',
        content: ''
      }
    }
  }
}
</script>

<style scoped>
.send-message {
  padding: 20px;
}
</style>
