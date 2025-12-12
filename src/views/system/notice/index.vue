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
          placeholder="按类型筛选"
          class="filter-item"
          style="width: 120px"
          @change="crud.toQuery"
        >
          <el-option
            v-for="item in noticeTypeOptions"
            :key="item.key"
            :label="item.display_name"
            :value="item.key"
          />
        </el-select>
        <el-select
          v-model="query.readStatus"
          clearable
          size="small"
          placeholder="按已读状态筛选"
          class="filter-item"
          style="width: 120px"
          @change="crud.toQuery"
        >
          <el-option
            v-for="item in readStatusOptions"
            :key="item.key"
            :label="item.display_name"
            :value="item.key"
          />
        </el-select>
        <date-range-picker v-model="query.createTime" class="date-item" />
        <rrOperation />
      </div>
      <crudOperation show="" :permission="permission">
        <el-button
          slot="right"
          v-permission="['admin','notice:markRead']"
          :disabled="crud.selections.length === 0"
          class="filter-item"
          size="mini"
          type="primary"
          icon="el-icon-check"
          @click="batchMarkRead(crud.selections)"
        >批量标记已读
        </el-button>
      </crudOperation>
    </div>
    <!--表单渲染-->
    <el-table
      ref="table"
      v-loading="crud.loading"
      :data="crud.data"
      size="small"
      stripe
      @selection-change="crud.selectionChangeHandler"
    >
      <el-table-column type="selection" width="55" />
      <el-table-column
        prop="id"
        label="ID"
        width="80"
        align="center"
      />
      <el-table-column
        prop="title"
        label="标题"
        align="left"
        show-overflow-tooltip
      >
        <template slot-scope="scope">
          <div class="notice-title">
            <span v-if="!scope.row.readStatus" class="unread-dot" />
            <span @click="viewNotice(scope.row)">{{ scope.row.title }}</span>
          </div>
        </template>
      </el-table-column>
      <el-table-column
        prop="content"
        label="内容摘要"
        align="left"
        show-overflow-tooltip
      >
        <template slot-scope="scope">
          <span>{{ scope.row.content | truncate(100) }}</span>
        </template>
      </el-table-column>
      <el-table-column
        prop="type"
        label="类型"
        align="center"
        width="120"
      >
        <template slot-scope="scope">
          <el-tag :type="dict.label.notice_type[scope.row.type] && dict.label.notice_type[scope.row.type].type || 'info'">
            {{ dict.label.notice_type[scope.row.type] && dict.label.notice_type[scope.row.type].display_name || scope.row.type }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column
        prop="createTime"
        label="发送时间"
        align="center"
        width="180"
      />
      <el-table-column
        prop="readStatus"
        label="已读状态"
        align="center"
        width="100"
      >
        <template slot-scope="scope">
          <el-tag :type="scope.row.readStatus ? 'success' : 'warning'">
            {{ scope.row.readStatus ? '已读' : '未读' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column
        label="操作"
        align="center"
        width="180"
        fixed="right"
      >
        <template slot-scope="scope">
          <permission :value="['notice:view']">
            <el-button
              size="mini"
              type="primary"
              icon="el-icon-view"
              @click="viewNotice(scope.row)"
            >查看
            </el-button>
          </permission>
          <permission :value="['notice:del']">
            <el-button
              size="mini"
              type="danger"
              icon="el-icon-delete"
              @click="crud.del(scope.row.id)"
            >删除
            </el-button>
          </permission>
        </template>
      </el-table-column>
    </el-table>
    <!--分页组件-->
    <pagination />
    <!--详情弹窗-->
    <el-dialog
      :visible.sync="detailDialog"
      :title="noticeDetail.title || '消息详情'"
      width="600px"
      append-to-body
    >
      <div class="notice-detail">
        <div class="detail-header">
          <h3>{{ noticeDetail.title }}</h3>
          <span class="detail-time">{{ noticeDetail.createTime }}</span>
          <el-tag :type="dict.label.notice_type[noticeDetail.type] && dict.label.notice_type[noticeDetail.type].type || 'info'">
            {{ dict.label.notice_type[noticeDetail.type] && dict.label.notice_type[noticeDetail.type].display_name || noticeDetail.type }}
          </el-tag>
        </div>
        <div class="detail-content">
          {{ noticeDetail.content }}
        </div>
      </div>
      <div slot="footer" class="dialog-footer">
        <el-button @click="detailDialog = false">关闭</el-button>
        <el-button
          type="danger"
          icon="el-icon-delete"
          @click="deleteNotice(noticeDetail.id)"
        >删除
        </el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import crud from '@/mixins/crud'
import { getList, del, markRead, batchMarkRead, getDetail } from '@/api/system/notice'
import CRUD, { presenter, header, form, pagination, crudOperation, rrOperation } from '@/components/Crud/crud'

const crudNotice = CRUD({ title: '通知', url: '/api/notice', sort: 'id,desc', crudMethod: { ...crud, getList, del }})

const defaultQuery = {
  blurry: '',
  type: '',
  readStatus: '',
  createTime: []
}

export default {
  name: 'Notice',
  components: { pagination, crudOperation, rrOperation },
  filters: {
    truncate(value, length) {
      if (!value) return ''
      if (value.length <= length) return value
      return value.substring(0, length) + '...'
    }
  },
  mixins: [presenter(), header(), form(), pagination(), crudNotice],
  data() {
    return {
      query: Object.assign({}, defaultQuery),
      detailDialog: false,
      noticeDetail: {},
      noticeTypeOptions: [
        { key: 'SYSTEM', display_name: '系统通知' },
        { key: 'INNER', display_name: '站内消息' },
        { key: 'ANNOUNCEMENT', display_name: '公告' }
      ],
      readStatusOptions: [
        { key: true, display_name: '已读' },
        { key: false, display_name: '未读' }
      ],
      permission: {
        add: ['admin', 'notice:add'],
        edit: ['admin', 'notice:edit'],
        del: ['admin', 'notice:del'],
        markRead: ['admin', 'notice:markRead']
      }
    }
  },
  created() {
    this.initDict('notice_type')
  },
  methods: {
    // 查看通知详情
    viewNotice(row) {
      getDetail(row.id).then(res => {
        this.noticeDetail = res
        this.detailDialog = true
        // 标记为已读
        if (!row.readStatus) {
          markRead(row.id).then(() => {
            row.readStatus = true
          })
        }
      })
    },
    // 批量标记已读
    batchMarkRead(datas) {
      this.$confirm(`你选中了 ${datas.length} 条消息，确认标记为已读吗?`, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        const ids = datas.map(val => val.id)
        batchMarkRead(ids).then(() => {
          this.crud.notify('批量标记已读成功', 'success')
          this.crud.toQuery()
        })
      }).catch(() => {})
    },
    // 删除通知
    deleteNotice(id) {
      this.$confirm('此操作将永久删除该通知, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        del(id).then(() => {
          this.crud.delSuccessNotify()
          this.detailDialog = false
          this.crud.toQuery()
        })
      }).catch(() => {})
    }
  }
}
</script>

<style rel="stylesheet/scss" lang="scss" scoped>
.notice-title {
  display: flex;
  align-items: center;
  cursor: pointer;

  .unread-dot {
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background-color: #f56c6c;
    margin-right: 8px;
  }
}

.notice-detail {
  .detail-header {
    margin-bottom: 20px;
    padding-bottom: 10px;
    border-bottom: 1px solid #ebeef5;

    h3 {
      margin: 0 0 10px 0;
      font-size: 18px;
    }

    .detail-time {
      color: #909399;
      margin-right: 15px;
    }
  }

  .detail-content {
    line-height: 1.8;
    font-size: 14px;
    color: #303133;
  }
}
</style>
