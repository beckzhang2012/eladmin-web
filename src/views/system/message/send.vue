<template>
  <div class="message-send">
    <el-form ref="form" :model="form" :rules="rules" size="small" label-width="100px">
      <el-form-item label="消息标题" prop="title">
        <el-input v-model="form.title" style="width: 600px" placeholder="请输入消息标题" />
      </el-form-item>
      <el-form-item label="接收用户" prop="users">
        <el-select v-model="form.users" multiple placeholder="请选择接收用户">
          <el-option
            v-for="user in userList"
            :key="user.id"
            :label="user.username"
            :value="user.id"
          />
        </el-select>
        <el-checkbox v-model="sendToAll" style="margin-left: 10px;">发送给所有用户</el-checkbox>
      </el-form-item>
      <el-form-item label="消息内容" prop="content">
        <div ref="editor" class="editor" />
      </el-form-item>
      <el-form-item>
        <el-button :loading="loading" type="primary" @click="doSubmit">发送消息</el-button>
      </el-form-item>
    </el-form>
  </div>
</template>

<script>
import { sendMessage } from '@/api/system/message'
import { mapGetters } from 'vuex'
import E from 'wangeditor'
import { list as getUserList } from '@/api/system/user'
import { getToken } from '@/utils/auth'

export default {
  name: 'MessageSend',
  data() {
    return {
      loading: false,
      form: { title: '', users: [], content: '' },
      sendToAll: false,
      userList: [],
      editor: null,
      rules: {
        title: [
          { required: true, message: '消息标题不能为空', trigger: 'blur' }
        ],
        content: [
          { required: true, message: '消息内容不能为空', trigger: 'blur' }
        ]
      }
    }
  },
  computed: {
    ...mapGetters([
      'imagesUploadApi'
    ])
  },
  created() {
    this.getUserList()
  },
  mounted() {
    this.initEditor()
  },
  beforeDestroy() {
    if (this.editor) {
      this.editor.destroy()
    }
  },
  methods: {
    // 获取用户列表
    getUserList() {
      getUserList({ page: 0, size: 1000 }).then(res => {
        this.userList = res.content
      })
    },
    // 初始化富文本编辑器
    initEditor() {
      const _this = this
      this.editor = new E(this.$refs.editor)
      this.editor.customConfig.uploadImgServer = this.imagesUploadApi
      this.editor.customConfig.uploadFileName = 'file'
      this.editor.customConfig.uploadImgHooks = {
        before: function(xhr) {
          xhr.setRequestHeader('Authorization', getToken())
        }
      }
      this.editor.customConfig.onchange = function(html) {
        _this.form.content = html
      }
      this.editor.create()
    },
    // 提交表单
    doSubmit() {
      this.$refs.form.validate(valid => {
        if (valid) {
          this.loading = true
          const data = this.sendToAll
            ? { ...this.form, users: ['all'] }
            : this.form
          sendMessage(data).then(() => {
            this.$message.success('消息发送成功')
            this.form = { title: '', users: [], content: '' }
            this.editor.txt.clear()
          }).finally(() => {
            this.loading = false
          })
        }
      })
    }
  }
}
</script>

<style scoped>
.message-send {
  padding: 20px;
}

.editor {
  width: 100%;
  min-height: 300px;
  border: 1px solid #dcdfe6;
}
</style>
