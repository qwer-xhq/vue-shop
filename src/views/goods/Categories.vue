<template>
  <div class="">
    <!-- 面包屑导航 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>商品分类</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片视图 -->
    <el-card>
      <!-- 添加分类按钮区域 -->
      <el-row>
        <el-col>
          <el-button type="primary" @click="showAddCateDialog">添加分类</el-button>
        </el-col>
      </el-row>

      <!-- 分类列表区域 -->
      <tree-table 
        :data="catesList" 
        :columns="columns" 
        :selection-type="false" 
        :expand-type="false" 
        show-index index-text="#"
        border>
        <!-- 是否有效 -->
        <template slot="isok" slot-scope="scope">
          <i class="el-icon-success" v-if="!scope.row.cat_deleted" style="color: green"></i>
          <i class="el-icon-error" v-else style="color: red"></i>
        </template>
        <!-- 排序 -->
        <template slot="order" slot-scope="scope">
          <el-tag size="mini" v-if="scope.row.cat_level===0">一级</el-tag>
          <el-tag type="success" size="mini" v-else-if="scope.row.cat_level===1">二级</el-tag>
          <el-tag type="warning" size="mini" v-else>三级</el-tag>
        </template>
        <!-- 操作 -->
        <template slot="opt" slot-scope="scope">
          <el-button type="primary" icon="el-icon-edit" size="mini" @click="showEditCateDialog(scope.row)">编辑</el-button>
          <el-button type="danger" icon="el-icon-delete" size="mini" @click="deleteCate(scope.row.cat_id)">删除</el-button>
        </template>
      </tree-table>

      <!-- 分页 -->
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="queryInfo.pagenum"
        :page-sizes="[5, 10, 15]"
        :page-size="queryInfo.pagesize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total">
      </el-pagination>
    </el-card>

    <!-- 添加分类 -->
    <el-dialog 
      title="添加分类" 
      :visible.sync="addCateDialogVisible" 
      :close-on-click-modal="false"
      width="50%" 
      @close="addCateDialogClosed('addCateFormRef')">
      <el-form :model="addCateForm" ref="addCateFormRef" label-width="100px" :rules="addCateFormRules">
        <el-form-item label="分类名称：" prop="cat_name">
          <el-input v-model="addCateForm.cat_name"></el-input>
        </el-form-item>
        <el-form-item label="父级分类：">
          <el-cascader
            v-model="selectedKeys"
            :options="parentCateList"
            :props="parentCateProps"
            @change="parentCateChanged"
            clearable>
          </el-cascader>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="addCateDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addCate">确 定</el-button>
      </span>
    </el-dialog>
    <!-- 修改分类 -->
    <el-dialog title="修改分类" :visible.sync="editCateDialogVisible" width="50%" @close="editCateDialogClosed('editCateFormRef')">
      <el-form :model="editCateForm" ref="editCateFormRef" label-width="100px" :rules="addCateFormRules">
        <el-form-item label="分类名称：" prop="cat_name">
          <el-input v-model="editCateForm.cat_name"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="editCateDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="editCate">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import RolesVue from '../power/Roles.vue'
  export default {
    name: 'Categories',
    data() {
      return {
        queryInfo: { // 获取分类列表参数
          type: 3,
          pagenum: 1,
          pagesize: 5,
        },
        catesList: [], // 分类数据列表
        total: 0, // 分类总数
        columns: [
          {
            label: '分类名称',
            prop: 'cat_name'
          },
          {
            label: '是否有效',
            type: 'template', // 表示当前列定义为模板列
            template: 'isok', // 当前这一列使用的模板名称
          },
          {
            label: '排序',
            type: 'template',
            template: 'order',
          },
          {
            label: '操作',
            type: 'template',
            width: '190px',
            template: 'opt',
          },
        ],
        addCateDialogVisible: false, // 控制添加对话框显示与隐藏
        // 添加分类表单数据
        addCateForm: {
          cat_name: '',
          cat_pid: 0, // 父级分类id
          cat_level: 0, // 分类的等级，默认添加的是1级分类
        }, 
        addCateFormRules: {
          cat_name: [
            {required: true, message: '请输入分类名称', trigger: 'blur'},
          ]
        },
        // 父级分类列表
        parentCateList: [],
        // 父级分类级联选择器配置项
        parentCateProps: {
          expandTrigger: 'hover',
          value: 'cat_id',
          label: 'cat_name',
          children: 'children',
          checkStrictly: true,
        },
        // 选中的父级分类id数组
        selectedKeys: [],
        editCateDialogVisible: false, // 控制修改分类对话框展示
        // 修改分类表单数据
        editCateForm: {},
      }
    },
    created() {
      this.getCatesList()
    },
    methods: {
      // 获取分类数据列表
      getCatesList() { 
        this.$http.getCatesList(this.queryInfo).then(res => {
          // console.log(res.data)
          if (res.meta.status !== 200) {
            return this.$message.error(res.meta.msg)
          }
          this.catesList = res.data.result
          this.total = res.data.total
        })
      },
      // 每页显示几条数据
      handleSizeChange(val) {
        // console.log(`每页 ${val} 条`);
        this.queryInfo.pagesize = val
        this.getCatesList()
      },
      // 当前页数
      handleCurrentChange(val) {
        // console.log(`当前页: ${val}`);
        this.queryInfo.pagenum = val
        this.getCatesList()
      },

      // 展示添加分类对话框
      showAddCateDialog() {
        this.getParentCateList()
        this.addCateDialogVisible = true
      },
      // 添加分类对话框关闭时重置表单
      addCateDialogClosed(formRef) {
        this.$refs[formRef].resetFields()
        this.selectedKeys = []
        // 父级分类的Id
        this.addCateForm.cat_pid = 0
        // 当前分类的等级赋值
        this.addCateForm.cat_level = 0
      },
      // 修改分类对话框关闭时重置表单
      editCateDialogClosed(formRef) {
        this.editCateForm = {}
      },

      // 获取父级分类的数据列表
      getParentCateList() {
        this.$http.getCatesList({type:2}).then(res => {
          // console.log(res.data)
          if (res.meta.status !== 200) {
            return this.$message.error(res.meta.msg)
          }
          this.parentCateList = res.data
          
        })
      },

      // 级联选择项发生变化时触发
      parentCateChanged() {
        // console.log(this.selectedKeys);
        if (this.selectedKeys.length > 0) {
          // 父级分类的Id
          this.addCateForm.cat_pid = this.selectedKeys[this.selectedKeys.length - 1]
          // 当前分类的等级赋值
          this.addCateForm.cat_level = this.selectedKeys.length
        } else {
          // 父级分类的Id
          this.addCateForm.cat_pid = 0
          // 当前分类的等级赋值
          this.addCateForm.cat_level = 0
        }
      },
      
      // 添加分类
      addCate() {
        this.$refs.addCateFormRef.validate(valid => { //对整个表单进行校验
          if (!valid) return
          this.$http.addCate(this.addCateForm).then(res => {
            if (res.meta.status!==201) return this.$message.error(res.meta.msg)
            this.$message.success('添加分类成功')
            this.addCateDialogVisible = false // 隐藏添加分类对话框
            this.getCatesList() // 重新获取分类列表
          })
        })
      },
      // 显示修改分类对话框
      showEditCateDialog({cat_id,cat_name}) {
        this.editCateDialogVisible = true
        // console.log(params);
        this.editCateForm = Object.assign({},{cat_id,cat_name}) // 浅拷贝
      },
      // 修改分类
      editCate() {
        this.$refs.editCateFormRef.validate(valid => {
          if (!valid) return
          this.$http.editCate(this.editCateForm).then(res => {
            if (res.meta.status!==200) return this.$message.error(res.meta.msg)
            this.$message.success('修改分类成功')
            this.editCateDialogVisible = false 
            this.getCatesList() 
          })
        })
      },
      // 删除用户
      deleteCate(id) {
        this.$confirm('此操作将删除该分类, 是否继续?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          this.$http.deleteCate(id).then((res) => {
            if (res.meta.status!==200) {
             return this.$message.error('删除失败') 
            }
            this.$message({
              type: 'success',
              message: '删除成功!'
            });
            this.getCatesList()
          })
        }).catch(() => {
          this.$message({
            type: 'info',
            message: '已取消删除'
          });          
        });
      },
    }
  }
</script>

<style scoped>
  .el-cascader {
    width: 100%;
  }
</style>