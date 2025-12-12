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
          placeholder="输入标题搜索"
          style="width: 200px;"
          class="filter-item"
          @keyup.enter.native="crud.toQuery"
        />
        <el-select
          v-model="query.type"
          clearable
          size="small"
          placeholder="消息类型"
          class="filter-item"
          style="width: 120px"
          @change="crud.toQuery"
        >
          <el-option label="系统通知" value="system" />
          <el-option label="站内消息" value="inbox" />
          <el-option label="公告" value="notice" />
        </el-select>
        <el-select
          v-model="query.readStatus"
          clearable
          size="small"
          placeholder="已读状态"
          class="filter-item"
          style="width: 100px"
          @change="crud.toQuery"
        >
          <el-option label="已读" value="true" />
          <el-option label="未读" value="false" />
        </el-select>
        <rrOperation />
      </div>
      <crudOperation :permission="permission">
        <el-button
          slot="right"
          v-permission="['admin','notice:markRead']"
          :disabled="crud.selections.length === 0"
          class="filter-item"
          size="mini"
          type="primary"
          icon="el-icon-check"
          @click="markAsRead(crud.selections)"
        >标记已读
        </el-button>
        <el-button
          slot="right"
          v-permission="['admin','notice:del']"
          :disabled="crud.selections.length === 0"
          class="filter-item"
          size="mini"
          type="danger"
          icon="el-icon-delete"
          @click="deleteBatch(crud.selections)"
        >批量删除
        </el-button>
      </crudOperation>
    </div>
    <!--表格渲染-->
    <el-table
      ref="table"
      v-loading="crud.loading"
      :data="crud.data"
      highlight-current-row
      style="width: 100%;"
      @selection-change="crud.selectionChangeHandler"
      @row-click="handleRowClick"
    >
      <el-table-column type="selection" width="55" />
      <el-table-column
        :show-overflow-tooltip="true"
        prop="title"
        label="标题"
        width="300"
      >
        <template slot-scope="scope">
          <el-tag v-if="!scope.row.readStatus" type="danger" size="mini">未读</el-tag>
          {{ scope.row.title }}
        </template>
      </el-table-column>
      <el-table-column
        :show-overflow-tooltip="true"
        prop="content"
        label="内容摘要"
        width="400"
      >
        <template slot-scope="scope">
          {{ scope.row.content | truncate(100) }}
        </template>
      </el-table-column>
      <el-table-column
        :show-overflow-tooltip="true"
        prop="createTime"
        label="发送时间"
        width="180"
      >
        <template slot-scope="scope">
          {{ parseTime(scope.row.createTime, '{y}-{m}-{d} {h}:{i}:{s}') }}
        </template>
      </el-table-column>
      <el-table-column
        :show-overflow-tooltip="true"
        prop="type"
        label="类型"
        width="100"
      >
        <template slot-scope="scope">
          <el-tag :type="getTypeTag(scope.row.type)" size="mini">
            {{ getTypeLabel(scope.row.type) }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column v-if="checkPer(['admin','notice:del'])" label="操作" width="100px" align="center" fixed="right">
        <template slot-scope="scope">
          <el-button
            size="mini"
            type="text"
            icon="el-icon-view"
            @click="viewDetail(scope.row)"
          >查看
          </el-button>
          <el-button
            size="mini"
            type="text"
            icon="el-icon-delete"
            @click="deleteSingle(scope.row)"
          >删除
          </el-button>
        </template>
      </el-table-column>
    </el-table>
    <!--分页组件-->
    <pagination />

    <!--消息详情弹窗-->
    <el-dialog
      append-to-body
      :close-on-click-modal="false"
      :visible.sync="detailVisible"
      title="消息详情"
      width="600px"
    >
      <el-form :model="detailForm" size="small" label-width="80px">
        <el-form-item label="标题">
          {{ detailForm.title }}
        </el-form-item>
        <el-form-item label="类型">
          <el-tag :type="getTypeTag(detailForm.type)" size="mini">
            {{ getTypeLabel(detailForm.type) }}
          </el-tag>
        </el-form-item>
        <el-form-item label="发送时间">
          {{ parseTime(detailForm.createTime, '{y}-{m}-{d} {h}:{i}:{s}') }}
        </el-form-item>
        <el-form-item label="内容">
          <div class="detail-content">{{ detailForm.content }}</div>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="text" @click="closeDetail">返回列表</el-button>
        <el-button type="danger" @click="deleteDetail">删除</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import crudNotice from '@/api/system/notice'
import CRUD, { presenter, header, form } from '@crud/crud'
import crudOperation from '@crud/CRUD.operation'
import pagination from '@crud/Pagination'
import rrOperation from '@crud/RR.operation'

const defaultForm = { id: null, title: null, content: null, type: null, readStatus: false, createTime: null }

export default {
  name: 'Notice',
  components: { crudOperation, pagination, rrOperation },
  cruds() {
    return [
      CRUD({ title: '消息通知', url: 'api/notice', crudMethod: { ...crudNotice }})
    ]
  },
  filters: {
    truncate: function(value, length) {
      if (!value) return ''
      if (value.length <= length) return value
      return value.substring(0, length) + '...'
    }
  },
  mixins: [presenter(), header(), form(defaultForm)],
  data() {
    return {
      detailVisible: false,
      detailForm: { ...defaultForm },
      permission: {
        add: ['admin', 'notice:add'],
        edit: ['admin', 'notice:edit'],
        del: ['admin', 'notice:del'],
        markRead: ['admin', 'notice:markRead']
      }
    }
  },
  methods: {
    getTypeTag(type) {
      switch (type) {
        case 'system':
          return 'warning'
        case 'inbox':
          return 'primary'
        case 'notice':
          return 'success'
        default:
          return 'info'
      }
    },
    getTypeLabel(type) {
      switch (type) {
        case 'system':
          return '系统通知'
        case 'inbox':
          return '站内消息'
        case 'notice':
          return '公告'
        default:
          return '未知'
      }
    },
    handleRowClick(row) {
      this.viewDetail(row)
    },
    viewDetail(row) {
      this.detailForm = { ...row }
      this.detailVisible = true
      // 标记为已读
      if (!row.readStatus) {
        this.crud.method.update(row.id, { readStatus: true }).then(() => {
          row.readStatus = true
          this.$message.success('已标记为已读')
        })
      }
    },
    closeDetail() {
      this.detailVisible = false
    },
    deleteDetail() {
      this.$confirm('确定要删除这条消息吗？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.crud.method.delete(this.detailForm.id).then(() => {
          this.$message.success('删除成功')
          this.closeDetail()
          this.crud.toQuery()
        })
      }).catch(() => {
        this.$message.info('已取消删除')
      })
    },
    deleteSingle(row) {
      this.$confirm('确定要删除这条消息吗？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.crud.method.delete(row.id).then(() => {
          this.$message.success('删除成功')
          this.crud.toQuery()
        })
      }).catch(() => {
        this.$message.info('已取消删除')
      })
    },
    deleteBatch(selections) {
      const ids = selections.map(item => item.id)
      this.$confirm('确定要删除选中的消息吗？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.crud.method.deleteBatch(ids).then(() => {
          this.$message.success('删除成功')
          this.crud.toQuery()
        })
      }).catch(() => {
        this.$message.info('已取消删除')
      })
    },
    markAsRead(selections) {
      const ids = selections.map(item => item.id)
      this.crud.method.markRead(ids).then(() => {
        this.$message.success('标记已读成功')
        this.crud.toQuery()
      })
    }
  }
}
</script>

<style scoped>
.detail-content {
  white-space: pre-line;
  max-height: 300px;
  overflow-y: auto;
}
</style>
