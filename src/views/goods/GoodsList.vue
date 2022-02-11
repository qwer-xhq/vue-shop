<template>
  <div class="">
    <!-- 导航 -->
    <Breadcrumb :navTitle="['首页','商品管理','商品列表']"></Breadcrumb>
    <!-- 内容卡片 -->
    <el-card>
      <el-row :gutter="20">
        <el-col :span="12">
          <el-input placeholder="请输入内容" v-model="query" clearable @clear="inputSearchUser">
            <el-button slot="append" icon="el-icon-search" @click="inputSearchUser"></el-button>
          </el-input>
        </el-col>
        <el-col :span="4">
          <el-button type="primary" @click="addGoodsPage">添加商品</el-button>
        </el-col>
      </el-row>
      <!-- 表格区域 -->
      <el-table :data="goodsList" border style="width: 100%">
        <el-table-column type="index"></el-table-column>
        <el-table-column prop="goods_name" label="商品名称"></el-table-column>
        <el-table-column prop="goods_price" label="商品价格(元)" width="95"></el-table-column>
        <el-table-column prop="goods_weight" label="商品重量" width="70"></el-table-column>
        <el-table-column prop="add_time" label="创建时间" width="160">
          <template #default="scope">
            {{add_time(scope.row.add_time)}}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="130">
          <template #default="scope">
            <!-- 修改按钮 -->
            <el-button type="primary" icon="el-icon-edit" size="mini" @click="addGoodsPage"></el-button>
            <!-- 删除按钮 -->
            <el-button type="danger" icon="el-icon-delete" size="mini" @click="deleteGoods(scope.row.goods_id)"></el-button>
          </template>
        </el-table-column>
      </el-table>
      <!-- 分页 -->
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="queryInfo.pagenum"
        :page-sizes="[5, 10, 15, 30]"
        :page-size="queryInfo.pagesize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="goodsTotal"
        background>
      </el-pagination>
    </el-card>
  </div>
</template>

<script>
  import {formatDate} from 'common/utils'
  export default {
    name: 'GoodsList',
    data() {
      return {
        query: '', // 查询关键字
        // 商品查询参数
        queryInfo: {
          query: '',
          pagenum: 1,
          pagesize: 5,
        },
        // 商品列表
        goodsList: [],
        goodsTotal: 0, // 商品总数

      }
    },
    computed: {
      
    },
    methods: {
      // 获取商品列表
      async getGoodsList() {
        const res = await this.$http.getGoodsList(this.queryInfo)
        if (res.meta.status !== 200) {
          return this.$message.error('获取商品列表失败')
        }
        this.goodsTotal = res.data.total
        this.goodsList = res.data.goods
      },
      // 搜索获取商品列表
      inputSearchUser() {
        this.queryInfo.query = this.query
        this.queryInfo.pagenum = 1  // 搜索时页数位置重置为 1
        this.getGoodsList()
      },
      // 每页数据条数发生改变是触发函数
      handleSizeChange(val) {
        // console.log(`每页 ${val} 条`);
        this.queryInfo.pagesize = val
        this.getGoodsList()
      },
      // 页数发生改变时触发函数
      handleCurrentChange(val) {
        // console.log(`当前页: ${val}`);
        this.queryInfo.pagenum = val
        this.getGoodsList()
      },
      // 格式化创建时间
      add_time(date) {
        return formatDate(date,'yyyy-MM-dd hh:mm:ss')
      },
      // 删除商品
      deleteGoods(id) {
        this.$confirm('此操作将删除该商品, 是否继续?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          this.$http.deleteGoods(id).then((res) => {
            if (res.meta.status!==200) {
             return this.$message.error('删除失败') 
            }
            // 如果最后一页只剩一条数据，判断删除的是否为最后一页最后一条数据
            if (this.queryInfo.pagenum>1) {
              if (this.goodsTotal%this.queryInfo.pagesize===1 && Math.ceil(this.goodsTotal/this.queryInfo.pagesize)===this.queryInfo.pagenum) {
                this.queryInfo.pagenum-=1
              }
            }
            this.$message({
              type: 'success',
              message: '删除成功!'
            });        
            this.getGoodsList()
          })
        }).catch(() => {
          this.$message({
            type: 'info',
            message: '已取消删除'
          });          
        });
      },
      addGoodsPage() {
        this.$router.push(this.$route.fullPath+'/add')
      }
    },
    created() {
      this.getGoodsList()
    }
  }
</script>

<style scoped>
  
</style>