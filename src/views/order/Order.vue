<template>
  <div class="">
    <Breadcrumb :navTitle="['首页','订单管理','订单列表']"></Breadcrumb>
    <el-card>
      <el-input placeholder="请输入内容" v-model="query" clearable style="width: 400px" @clear="inputSearchOrder">
        <el-button slot="append" icon="el-icon-search" @click="inputSearchOrder"></el-button>
      </el-input>
      <el-table :data="orderList" border stripe>
        <el-table-column type="index"></el-table-column>
        <el-table-column label="订单编号" prop="order_number"></el-table-column>
        <el-table-column label="订单价格" prop="order_price"></el-table-column>
        <el-table-column label="是否付款" align="center">
          <template #default="scope">
            <el-tag type="success" v-if="scope.row.pay_status === '1'">已付款</el-tag>
            <el-tag type="danger" v-else>未支付</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="是否发货" prop="is_send"></el-table-column>
        <el-table-column label="下单时间">
          <template #default="scope">
            {{create_time(scope.row.update_time)}}
          </template>
        </el-table-column>
        <el-table-column label="操作">
          <template #default="scope">
            <el-button type="primary" icon="el-icon-edit" size="mini" @click="addressVisible = true"></el-button>
            <el-button type="success" icon="el-icon-location" size="mini" @click="progressVisible = true"></el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
    <el-pagination
      @size-change="handleSizeChange"
      @current-change="handleCurrentChange"
      :current-page="queryInfo.pagenum"
      :page-sizes="[10, 15, 20, 30]"
      :page-size="queryInfo.pagesize"
      layout="total, sizes, prev, pager, next, jumper"
      :total="orderTotal">
    </el-pagination>
    <!-- 修改地址对话框 -->
    <el-dialog
      title="修改地址"
      :visible.sync="addressVisible"
      width="50%"
      @close="dialogClosed('addressFormRef')">
      <el-form :model="addressForm" :rules="addressFormRules" ref="addressFormRef" label-width="100px">
        <el-form-item label="省市区/县" prop="address1">
          <el-cascader
            v-model="addressForm.address1"
            :options="cityOptions"
            :props="{ expandTrigger: 'hover' }">
          </el-cascader>
        </el-form-item>
        <el-form-item label="详细地址" prop="address2">
          <el-input v-model="addressForm.address2"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="addressVisible = false">取 消</el-button>
        <el-button type="primary" @click="addressVisible = false">确 定</el-button>
      </span>
    </el-dialog>
    <!-- 物流进度对话框 -->
    <el-dialog
      title="物流进度"
      :visible.sync="progressVisible"
      width="50%">
      <el-timeline>
        <el-timeline-item
          v-for="(activity, index) in progress"
          :key="index"
          :timestamp="activity.time">
          {{activity.context}}
        </el-timeline-item>
      </el-timeline>
    </el-dialog>
  </div>
</template>

<script>
  import {formatDate} from 'common/utils'
  import cityOptions from './city_data2017_element.js'
  import progress from './progress'
  export default {
    name: 'Order',
    data() {
      return {
        query: '', // 要查询的文本
        queryInfo: {
          query: '',
          pagenum: 1,
          pagesize: 10,
        },
        orderList: [],
        orderTotal: 0,
        addressVisible: false,
        addressForm: {
          address1: [],
          address2: ''
        },
        addressFormRules: {
          address1: [
            {required: true, message: '请输入省市区/县', trigger: 'blur'},
          ],
          address2: [
            {required: true, message: '详细地址', trigger: 'blur'},
          ]
        },
        cityOptions: cityOptions,

        progressVisible: false,
        progress,
      }
    },
    computed: {
      create_time() {
        return function(time){
          return formatDate(time,'yyyy-MM-dd hh:mm')
        }
      }
    },
    methods: {
      async getOrdersList() {
        const res = await this.$http.getOrdersList(this.queryInfo)
        if (res.meta.status !== 200) {
          return this.$message.error(res.meta.msg)
        }
        this.orderTotal = res.data.total
        this.orderList = res.data.goods
      },
      // 搜索订单
      inputSearchOrder() {
        this.queryInfo.query = this.query
        this.queryInfo.pagenum = 1  // 搜索时页数位置重置为 1
        this.getOrdersList()
      },
      // 每页数据条数发生改变是触发函数
      handleSizeChange(val) {
        // console.log(`每页 ${val} 条`);
        this.queryInfo.pagesize = val
        this.getOrdersList()
      },
      // 页数发生改变时触发函数
      handleCurrentChange(val) {
        // console.log(`当前页: ${val}`);
        this.queryInfo.pagenum = val
        this.getOrdersList()
      },
      dialogClosed(formRef) {
        this.$refs[formRef].resetFields()
      }
    },
    created() {
      this.getOrdersList()
    }
    
  }
</script>

<style scoped>
  .el-cascader {
    width: 100%;
  }
</style>