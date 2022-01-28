<template>
  <div class="">
    <!-- 面包屑导航 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>用户管理</el-breadcrumb-item>
      <el-breadcrumb-item>用户列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 内容卡片 -->
    <el-card>
      <el-row :gutter="20">
        <el-col :span="12">
          <el-input placeholder="请输入内容" v-model="query" clearable @clear="inputSearchUser">
            <el-button slot="append" icon="el-icon-search" @click="inputSearchUser"></el-button>
          </el-input>
        </el-col>
        <el-col :span="4">
          <el-button type="primary" @click="addDialogVisible = true">添加用户</el-button>
        </el-col>
      </el-row>
      <el-table :data="userList" border style="width: 100%">
        <el-table-column type="index"></el-table-column>
        <el-table-column prop="username" label="姓名"></el-table-column>
        <el-table-column prop="email" label="邮箱"></el-table-column>
        <el-table-column prop="mobile" label="电话"></el-table-column>
        <el-table-column prop="role_name" label="角色"></el-table-column>
        <el-table-column label="状态">
          <template v-slot="scope">
            <el-switch v-model="scope.row.mg_state" @change="userStateChanged(scope.row)"></el-switch>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="184">
          <template #default="scope">
            <!-- 修改按钮 -->
            <el-button type="primary" icon="el-icon-edit" size="mini" @click="showEditDialog(scope.row)"></el-button>
            <!-- 删除按钮 -->
            <el-button type="danger" icon="el-icon-delete" size="mini" @click="deleteUser(scope.row.id)"></el-button>
            <!-- 分配角色按钮 -->
            <el-tooltip class="item" effect="dark" content="分配角色" placement="top" :enterable="false">
              <el-button type="warning" icon="el-icon-setting" size="mini" @click="showSetRoleDialog(scope.row)"></el-button>
            </el-tooltip>
          </template>
        </el-table-column>
        
      </el-table>

      <!-- 分页 -->
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="queryInfo.pagenum"
        :page-sizes="[1, 2, 3, 5]"
        :page-size="queryInfo.pagesize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total">
      </el-pagination>
    </el-card>
    <!-- 添加用户的对话框 -->
    <el-dialog title="添加用户" :visible.sync="addDialogVisible" width="50%" @close="dialogClose('addFormRef')">
      <el-form :model="addForm" :rules="addFormRules" ref="addFormRef" label-width="70px">
        <el-form-item label="用户名" prop="username">
          <el-input v-model="addForm.username"></el-input>
        </el-form-item>
        <el-form-item label="密码" prop="password">
          <el-input type="password" v-model="addForm.password"></el-input>
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="addForm.email"></el-input>
        </el-form-item>
        <el-form-item label="手机" prop="mobile">
          <el-input v-model="addForm.mobile"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="addDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addUser">确 定</el-button>
      </span>
    </el-dialog>
    <!-- 修改用户对话框 -->
    <el-dialog title="修改用户" :visible.sync="editDialogVisible" width="50%" @close="dialogClose('editFormRef')">
      <el-form :model="editForm" :rules="addFormRules" ref="editFormRef" label-width="70px">
        <el-form-item label="用户名">
          <el-input v-model="editForm.username" disabled></el-input>
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="editForm.email"></el-input>
        </el-form-item>
        <el-form-item label="手机" prop="mobile">
          <el-input v-model="editForm.mobile"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="editDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="editUserInfo">确 定</el-button>
      </span>
    </el-dialog>
    <!-- 分配角色对话框 -->
    <el-dialog title="分配角色" :visible.sync="setRoleDialogVisible" width="40%" @close="setRoleDialogColse">
      <div>
        <p>当前用户：{{userInfo.username}}</p>
        <p>当前用户：{{userInfo.role_name}}</p>
        <p>分配新角色：
          <el-select v-model="roleId" placeholder="请选择">
            <el-option
              v-for="item in rolesList"
              :key="item.id"
              :label="item.roleName"
              :value="item.id">
            </el-option>
          </el-select>
        </p>
      </div>
      <span slot="footer" class="dialog-footer">
        <el-button @click="setRoleDialogVisible= false">取 消</el-button>
        <el-button type="primary" @click="setRole">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
  // import {getUserList,userStateChanged} from 'network/userList'
  export default {
    name: 'Users',
    data() {
      // 验证邮箱的规则
      const validateEmail = (rule, value, cb) => {
        const regEmail = /^[a-zA-Z0-9_.-]+@[a-zA-Z0-9-]+(\.[a-zA-Z0-9-]+)*\.[a-zA-Z0-9]{2,6}$/

        if(regEmail.test(value)) {
          return cb()
        }

        cb(new Error('请输入合法邮箱'))
      }
      // 验证手机号的规则
      const validateMobile = (rule, value, cb) => {
        const regMobile = /^(0|86|17951)?(13[0-9]|15[012356789]|17[678]|18[0-9]|14[57])[0-9]{8}$/

        if(regMobile.test(value)) {
          return cb()
        }

        cb(new Error('请输入正确的手机号'))
      }

      return {
        query: '', // 要查询的文本
        queryInfo: {
          query: '',
          pagenum: 1,
          pagesize: 2,
        },
        userList: [], 
        total: 0, // 用户总数
        addDialogVisible: false, // 控制添加对话框显示与隐藏
        // 添加的用户表单数据
        addForm: {
          username: '',
          password: '',
          email: '',
          mobile: '',
        }, // 添加用户的表单数据
        // 添加表单的验证规则对象
        addFormRules: {
          username: [
            {required: true, message: '请输入用户名', trigger: 'blur'},
            {min: 3, max: 10, message: '用户名的长度在3~10个字符之间', tigger: 'blur'},
          ],
          password: [
            {required: true, message: '请输入密码', trigger: 'blur'},
            {min: 6, max: 15, message: '密码的长度在6~15个字符之间', tigger: 'blur'},
          ],
          email: [
            {required: true, message: '请输入邮箱', trigger: 'blur'},
            {validator: validateEmail, trigger: 'blur'}
          ],
          mobile: [
            {required: true, message: '请输入手机号', trigger: 'blur'},
            {validator: validateMobile, trigger: 'blur'}
          ],
        }, 
        editDialogVisible: false, // 控制修改用户对话框的显示与隐藏
        // 修改表单数据
        editForm: {},
        setRoleDialogVisible: false, // 控制分配角色对话框的展示
        userInfo: {}, // 当前分配角色的信息
        rolesList: [], // 所有角色的数据列表
        roleId: '', // 选择分配的角色id
      }
    },
    methods: {
      // 获取用户数据列表
      getUserList() {
        this.$http.getUserList(this.queryInfo).then(res => {
          // console.log(res)
          this.userList = res.data.users
          this.total = res.data.total
        })
      },
      // 获取角色列表
      getRoleList() {
        this.$http.getRoleList().then(res => {
          if (res.meta.status!==200) {
            return this.$message.error('获取角色列表失败')
          }
          this.rolesList = res.data
        })
      },
      // 搜索获取用户列表
      inputSearchUser() {
        this.queryInfo.query = this.query
        this.queryInfo.pagenum = 1  // 搜索时页数位置重置为 1
        this.getUserList()
      },
      // 每页显示几条数据
      handleSizeChange(val) {
        // console.log(`每页 ${val} 条`);
        this.queryInfo.pagesize = val
        this.getUserList()
      },
      // 当前页数
      handleCurrentChange(val) {
        // console.log(`当前页: ${val}`);
        this.queryInfo.pagenum = val
        this.getUserList()
      },

      // 监听switch开关状态的改变
      userStateChanged(userInfo) {
        console.log(userInfo)
        this.$http.userStateChanged(userInfo.id, userInfo.mg_state).then(res => {
          console.log(res)
          if (res.meta.status!==200) {
            userInfo.mg_state = !userInfo.mg_state
            return this.$message.error('更新用户状态失败')
          }
          this.$message.success(res.meta.msg)
        })
      },
      // 对话框关闭时重置表单
      dialogClose(formRef) {
        this.$refs[formRef].resetFields()
      },
      // 添加用户
      addUser() {
        this.$refs.addFormRef.validate(valid => {
          if (!valid) return
          this.$http.addUser(this.addForm).then(res => {
            if (res.meta.status!==201) return this.$message.error(res.meta.msg)
            this.$message.success('添加用户成功')
            this.addDialogVisible = false // 隐藏添加用户对话框
            this.getUserList() // 重新获取用户列表
          })
        })
      },
      // 显示修改用户对话框
      showEditDialog(params) {
        this.editDialogVisible = true
        // console.log(params);
        this.editForm = Object.assign({},params) // 浅拷贝
      },

      // 修改用户信息
      editUserInfo() {
        this.$refs.editFormRef.validate(valid => {
          if (!valid) return
          this.$http.editUserInfo(this.editForm).then(res => {
            if (res.meta.status!==200) return this.$message.error(res.meta.msg)
            this.$message.success('修改用户成功')
            this.editDialogVisible = false // 隐藏添加用户对话框
            this.getUserList() // 重新获取用户列表
          })
        })
      },

      // 删除用户
      deleteUser(id) {
        this.$confirm('此操作将删除该用户, 是否继续?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {

          this.$http.deleteUser(id).then((res) => {
            if (res.meta.status!==200) {
             return this.$message.error('删除失败') 
            }

            // 判断删除的是否为当前页最后一条数据
            if (this.queryInfo.pagesize>1 && this.queryInfo.pagenum>1) {
              if (this.total%this.queryInfo.pagesize===1 && Math.ceil(this.total/this.queryInfo.pagesize)===this.queryInfo.pagenum) {
                this.queryInfo.pagenum-=1
              }
            }
            
            this.$message({
              type: 'success',
              message: '删除成功!'
            });
            
            this.getUserList()
          })
          
        }).catch(() => {
          this.$message({
            type: 'info',
            message: '已取消删除'
          });          
        });
      },

      // 展示分配用户角色对话框
      showSetRoleDialog(userInfo) {
        this.userInfo = userInfo
        this.setRoleDialogVisible = true
      },

      // 分配用户角色
      setRole() {
        if (!this.roleId) {
          return this.$message.error('请选择要分配的角色')
        }
        this.$http.setRole(this.userInfo.id,this.roleId).then(res => {
          if (res.meta.status !== 200) {
            return this.$message.error(res.meta.msg)
          }
          this.$message.success('分配角色成功')
          this.getUserList()
          this.setRoleDialogVisible = false
        })
      },

      // 关闭分配角色对话框的事件
      setRoleDialogColse() {
        this.roleId = ''
      }
    },
    created() {
      this.getUserList()
      this.getRoleList()
    }
  }
</script>

<style lang="less" scoped>

</style>