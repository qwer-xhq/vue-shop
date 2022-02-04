<template>
  <div class="">
    <!-- 面包屑导航 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>权限管理</el-breadcrumb-item>
      <el-breadcrumb-item>角色列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片视图 -->
    <el-card>
      <!-- 添加角色按钮区域 -->
      <el-row>
        <el-col>
          <el-button type="primary" @click="addDialogVisible = true">添加角色</el-button>
        </el-col>
      </el-row>

      <!-- 角色列表区域 -->
      <el-table :data="roleList" border>
        <!-- 展开列 -->
        <el-table-column type="expand">
          <template #default="scope">
            <el-row class="expand-one" type="flex" align="middle" v-for="item in scope.row.children" :key="item.id">
              <!-- 渲染一级权限 -->
              <el-col :span="5">
                <el-tag closable @close="removeRightsById(scope.row,item.id)">{{item.authName}}</el-tag>
                <i class="el-icon-caret-right"></i>
              </el-col>
              <!-- 渲染二级三级权限 -->
              <el-col :span="19">
                <el-row class="expand-two" type="flex" align="middle" v-for="item1 in item.children" :key="item1.id">
                  <!-- 二级 -->
                  <el-col :span="6">
                    <el-tag closable type="success" @close="removeRightsById(scope.row,item1.id)">{{item1.authName}}</el-tag>
                    <i class="el-icon-caret-right"></i>
                  </el-col>
                  <!-- 三级 -->
                  <el-col :span="18">
                    <el-tag closable v-for="item2 in item1.children" :key="item2.id" @close="removeRightsById(scope.row,item2.id)">{{item2.authName}}</el-tag>
                  </el-col>
                </el-row>
              </el-col>
            </el-row>
          </template>
        </el-table-column>
        <!-- 索引列 -->
        <el-table-column type="index"></el-table-column>
        <el-table-column label="角色名称" prop="roleName"></el-table-column>
        <el-table-column label="角色描述" prop="roleDesc"></el-table-column>
        <el-table-column label="操作" width="300">
          <template #default="scope">
            <!-- 编辑按钮 -->
            <el-button type="primary" icon="el-icon-edit" size="mini" @click="showEditDialog(scope.row)">编辑</el-button>
            <!-- 删除按钮 -->
            <el-button type="danger" icon="el-icon-delete" size="mini" @click="deleteRole(scope.row.id)">删除</el-button>
            <!-- 分配权限按钮 -->
            <el-button type="warning" icon="el-icon-setting" size="mini" @click="showSetRightDialog(scope.row)">分配权限</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
    <!-- 添加角色 -->
    <el-dialog title="添加角色" :visible.sync="addDialogVisible" width="50%" @close="dialogClose('addFormRef')">
      <el-form :model="addForm" ref="addFormRef" label-width="80px" :rules="addFormRules">
        <el-form-item label="角色名称" prop="roleName">
          <el-input v-model="addForm.roleName"></el-input>
        </el-form-item>
        <el-form-item label="角色描述" prop="roleDesc">
          <el-input v-model="addForm.roleDesc"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="addDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addRole">确 定</el-button>
      </span>
    </el-dialog>
    <!-- 修改角色对话框 -->
    <el-dialog title="修改角色" :visible.sync="editDialogVisible" width="50%" @close="dialogClose('editFormRef')">
      <el-form :model="editForm" ref="editFormRef" label-width="80px" :rules="addFormRules">
        <el-form-item label="角色名称" prop="roleName">
          <el-input v-model="editForm.roleName"></el-input>
        </el-form-item>
        <el-form-item label="角色描述" prop="roleDesc">
          <el-input v-model="editForm.roleDesc"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="editDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="editRoleInfo">确 定</el-button>
      </span>
    </el-dialog>

    <!-- 分配权限对话框 -->
    <el-dialog title="分配权限" :visible.sync="setRightDialogVisible" width="30%" @close="showRightDialogClose">
      <!-- 树形控件 -->
      <el-tree :data="rightsList" :props="rightsProps" show-checkbox node-key="id" default-expand-all :default-checked-keys="defKeys" ref="rightsTree">
      </el-tree>
      <span slot="footer" class="dialog-footer">
        <el-button @click="setRightDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="allotRights">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
  export default {
    name: 'Roles',
    data() {
      return {
        roleList: [], // 角色列表
        addDialogVisible: false, // 添加角色对话框是否显示
        editDialogVisible: false, // 编辑角色对话框是否显示
        addForm: { //添加角色表单数据
          roleName: '',
          roleDesc: '',
        },
        editForm: {}, // 编辑角色表单数据
        // 添加表单的验证规则对象
        addFormRules: {
          roleName: [
            {required: true, message: '请输入角色名称', trigger: 'blur'},
            {min: 3, max: 10, message: '角色名的长度在3~10个字符之间', tigger: 'blur'},
          ],
          roleDesc: [
            {required: true, message: '请输入角色描述', trigger: 'blur'},
            {min: 0, max: 20, message: '角色名的长度在0~20个字符之间', tigger: 'blur'},
          ],
        },
        setRightDialogVisible: false, // 控制分配权限对话框是否显示
        rightsList: [], // 权限列表
        // 权限树形配置选项
        rightsProps: {
          label: 'authName',
          children: 'children'
          }, 
        defKeys: [], // 默认勾选的节点的 key 的数组
        roleId: null, // 当前即将分配权限的角色id
      }
    },
    created() {
      this.getRoleList()
      this.getRightsList()
    },
    computed: {
    },
    methods: {
      // 获取角色列表
      getRoleList() {
        this.$http.getRoleList().then(res => {
          if (res.meta.status!==200) {
            return this.$message.error('获取角色列表失败')
          }
          this.roleList = res.data
        })
      },
      // 获取权限树形列表
      getRightsList() {
        this.$http.getRightsList('tree').then(res => {
          if (res.meta.status !== 200) {
            return this.$message.error('获取权限列表失败')
          }
          this.rightsList = res.data
        })
      },

      // 对话框关闭时重置表单
      dialogClose(formRef) {
        this.$refs[formRef].resetFields()
      },
      // 添加角色
      addRole() {
        this.$refs.addFormRef.validate(valid => { //对整个表单进行校验
          if (!valid) return
          this.$http.addRole(this.addForm).then(res => {
            if (res.meta.status!==201) return this.$message.error(res.meta.msg)
            this.$message.success('添加角色成功')
            this.addDialogVisible = false // 隐藏添加角色对话框
            this.getRoleList() // 重新获取角色列表
          })
        })
      },
      // 显示修改角色对话框
      showEditDialog({id,roleName,roleDesc}) {
        this.editDialogVisible = true
        // console.log(params);
        this.editForm = Object.assign({},{id,roleName,roleDesc}) // 浅拷贝
      },
      // 修改角色信息
      editRoleInfo() {
        this.$refs.editFormRef.validate(valid => {
          if (!valid) return
          this.$http.editRoleInfo(this.editForm).then(res => {
            if (res.meta.status!==200) return this.$message.error(res.meta.msg)
            this.$message.success('修改角色成功')
            this.editDialogVisible = false // 隐藏添加角色对话框
            this.getRoleList() // 重新获取角色列表
          })
        })
      },
      // 删除角色
      deleteRole(id) {
        this.$confirm('此操作将删除该角色, 是否继续?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {

          this.$http.deleteRole(id).then((res) => {
            if (res.meta.status!==200) {
             return this.$message.error('删除失败') 
            }
            
            this.$message({
              type: 'success',
              message: '删除成功!'
            });
            
            this.getRoleList()
          })
          
        }).catch(() => {
          this.$message({
            type: 'info',
            message: '已取消删除'
          });          
        });
      },

      // 根据id删除对应权限
      async removeRightsById(role,rightID) {
        // 弹框提示角色是否删除
        const confirmResult = await this.$confirm('此操作将删除该角色权限, 是否继续?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).catch(err => err)
        if (confirmResult !== 'confirm') {
          return this.$message.info('已取消删除')
        }
        const res = await this.$http.deleteRightById(role.id,rightID)
        if (res.meta.status !== 200) {
          return this.$message.error(res.meta.msg)
        }
        this.$message.success('删除成功')
        // this.getRoleList()
        role.children = res.data
      },

      // 展示分配权限对话框
      showSetRightDialog(rightsRow) {
        this.roleId = rightsRow.id // 显示对话框时获取当前角色id
        // 递归三级权限
        this.getLeafKeys(rightsRow,this.defKeys)
        // 动态更新默认勾选的节点
        this.$nextTick(() => {
          this.$refs.rightsTree?.setCheckedKeys(this.defKeys);
        });
        // 显示分配权限对话框
        this.setRightDialogVisible = true
      },
      // 递归获取角色三级权限id,并保存到数组中
      getLeafKeys(node, arr) {
        if (!node.children) {
          return arr.push(node.id)
        }
        node.children.forEach(item => this.getLeafKeys(item,arr));
      },
      // 关闭权限对话框时触发
      showRightDialogClose() {
        this.defKeys=[]
      },

      // 点击为角色分配权限
      allotRights() {
        const keys = [
          ...this.$refs.rightsTree.getCheckedKeys(),
          ...this.$refs.rightsTree.getHalfCheckedKeys()
        ]
        const idStr = keys.join(',')
        this.$http.allotRights(this.roleId,idStr).then(res => {
          if (res.meta.status !== 200) {
            return this.$message.error(res.meta.msg)
          }
          this.$message.success('分配权限成功')
          this.getRoleList()
          this.setRightDialogVisible = false
        })
      }
    }
  }
</script>

<style lang="less" scoped>
  .expand-one {
    width: 90%;
    border-bottom: 1px solid #eee;
    margin: 0 auto;
  }
  .expand-one:nth-child(1) {
    border-top: 1px solid #eee;
  }
  .el-tag {
    margin: 8px;
  }
  .expand-two {
    border-top: 1px solid #eee;
  }
  .expand-two:nth-child(1) {
    border: none;
  }
</style>