<template>
  <div class="">
    <!-- 导航 -->
    <Breadcrumb :navTitle="['首页','商品管理','参数列表']"></Breadcrumb>
    <el-card>
      <!-- 警告区域 -->
      <el-alert
        show-icon
        title="注意：只允许为第三级分类设置相关参数"
        type="warning"
        :closable="false">
      </el-alert>
      <!-- 选择商品分类 -->
      <el-row class="cat_opt">
        <span>选择商品分类：</span>
        <!-- 分类级联选择框 -->
        <el-cascader
          v-model="selectedCateKeys"
          :options="catesList"
          :props="cateProps"
          @change="handleChange">
        </el-cascader>
        <!-- tab 页签区域 -->
        <el-tabs v-model="activeName" @tab-click="handleTabClick">
          <!-- 添加动态参数的面板 -->
          <el-tab-pane label="动态参数" name="many">
            <el-button type="primary" size="mini" :disabled="isBtnDisabled" @click="showAddParamsDialog">添加参数</el-button>
            <!-- 动态参数表格 -->
            <el-table :data="manyTableData" border stripe>
              <!-- 展开列 -->
              <el-table-column type="expand">
                <template slot-scope="scope">
                  <el-tag 
                    :key="index" 
                    v-for="(item,index) in scope.row.attr_vals" 
                    closable 
                    :disable-transitions="false" 
                    @close="handleTagClose(scope.row,index)"
                  >
                    {{item}}
                  </el-tag>
                  <el-input
                    class="input-new-tag"
                    v-if="scope.row.inputVisible"
                    v-model="inputValue"
                    ref="saveTagInput"
                    size="small"
                    @keyup.enter.native="handleInputConfirm(scope.row,1)"
                    @blur="handleInputConfirm(scope.row,2)"
                  >
                  </el-input>
                  <el-button v-else class="button-new-tag" size="small" @click="showInput(scope.row)">+ New Tag</el-button>
                </template>
              </el-table-column>
              <el-table-column type="index" label="#"></el-table-column>
              <el-table-column label="参数名称" prop="attr_name"></el-table-column>
              <!-- 操作 -->
              <el-table-column label="操作">
                <template slot-scope="scope">
                  <el-button type="primary" icon="el-icon-edit" size="mini" @click="showEditParamsDialog(scope.row)">编辑</el-button>
                  <el-button type="danger" icon="el-icon-delete" size="mini" @click="deleteParams(scope.row)">删除</el-button>
                </template>
              </el-table-column>
            </el-table>
          </el-tab-pane>
          <!-- 添加静态属性面板 -->
          <el-tab-pane label="静态属性" name="only">
            <el-button type="primary" size="mini" :disabled="isBtnDisabled" @click="showAddParamsDialog">添加属性</el-button>
            <!-- 静态属性表格 -->
            <el-table :data="onlyTableData" border stripe>
              <!-- 展开列 -->
              <el-table-column type="expand">
                <template slot-scope="scope">
                  <el-tag 
                    :key="index" 
                    v-for="(item,index) in scope.row.attr_vals" 
                    closable 
                    :disable-transitions="false" 
                    @close="handleTagClose(scope.row,index)"
                  >
                    {{item}}
                  </el-tag>
                  <el-input
                    class="input-new-tag"
                    v-if="scope.row.inputVisible"
                    v-model="inputValue"
                    ref="saveTagInput"
                    size="small"
                    @keyup.enter.native="handleInputConfirm(scope.row)"
                    @blur="handleInputConfirm(scope.row)"
                  >
                  </el-input>
                  <el-button v-else class="button-new-tag" size="small" @click="showInput(scope.row)">+ New Tag</el-button>
                </template>
              </el-table-column>
              <el-table-column type="index" label="#"></el-table-column>
              <el-table-column label="属性名称" prop="attr_name"></el-table-column>
              <!-- 操作 -->
              <el-table-column label="操作">
                <template slot-scope="scope">
                  <el-button type="primary" icon="el-icon-edit" size="mini" @click="showEditParamsDialog(scope.row)">编辑</el-button>
                  <el-button type="danger" icon="el-icon-delete" size="mini" @click="deleteParams(scope.row)">删除</el-button>
                </template>
              </el-table-column>
            </el-table>
          </el-tab-pane>
        </el-tabs>
      </el-row>
    </el-card>
    <!-- 添加参数/属性对话框 -->
    <el-dialog
      :title="'添加'+addDialogTitle"
      :visible.sync="addParamsDialogVisible"
      width="50%"
      @close="dialogClosed('addParamsFormRef')"
      >
      <el-form :model="addParamsForm" ref="addParamsFormRef" label-width="100px" :rules="addParamsFormRules">
        <el-form-item :label="addDialogTitle" prop="attr_name">
          <el-input v-model="addParamsForm.attr_name"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="addParamsDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addParams">确 定</el-button>
      </span>
    </el-dialog>
    <!-- 修改参数/属性对话框 -->
    <el-dialog
      :title="'修改'+addDialogTitle"
      :visible.sync="editParamsDialogVisible"
      width="50%"
      @close="dialogClosed('editParamsFormRef')"
      >
      <el-form :model="editParamsForm" ref="editParamsFormRef" label-width="100px" :rules="addParamsFormRules">
        <el-form-item :label="addDialogTitle" prop="attr_name">
          <el-input v-model="editParamsForm.attr_name"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="editParamsDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="editParams">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
  
  export default {
    name: 'Params',
    data() {
      return {
        catesList: [],
        // 级联选择框配置选项
        cateProps: {
          expandTrigger: 'hover',
          value: 'cat_id',
          label: 'cat_name',
          children: 'children',
        },
        // 级联选择框双向绑定的属性
        selectedCateKeys: [],
        // 当前页签名称
        activeName: 'many',
        // 动态参数表格数据
        manyTableData: [],
        // 静态属性表格数据
        onlyTableData: [],
        // 控制添加参数/属性对话框的展示
        addParamsDialogVisible: false,
        editParamsDialogVisible: false,
        // 添加参数/属性表单数据
        addParamsForm: {},
        editParamsForm: {},
        addParamsFormRules: {
          attr_name: [
            {required: true, message: '请输入参数/属性名称', trigger: 'blur'},
          ]
        },
        // 文本框输入的内容
        inputValue: ''
      }
    },
    computed: {
      // 按钮禁用返回true，否则返回false
      isBtnDisabled() {
        return this.selectedCateKeys.length!==3?true:false
      },
      // 当前选中的三级分类Id
      cateId() {
        if (this.selectedCateKeys.length === 3) {
          return this.selectedCateKeys[2]
        }
        return null
      },
      // 添加对话框标题
      addDialogTitle() {
        if(this.activeName === 'many') {
          return '动态参数'
        }else {
          return '静态属性'
        }
      }
    },
    created() {
      this.getCatesList()
    },
    methods: {
      // 获取分类数据列表
      getCatesList() { 
        this.$http.getCatesList().then(res => {
          // console.log(res.data)
          if (res.meta.status !== 200) {
            return this.$message.error(res.meta.msg)
          }
          this.catesList = res.data
        })
      },
      // 获取分类参数列表
      async getCateParamsList() {
        if (this.selectedCateKeys.length !== 3) {
          return this.$message.warning('请先选择三级参数')
        }
        const res = await this.$http.getCateParamsList(this.cateId,this.activeName)
        if (res.meta.status !== 200) {
          return this.$message.error('获取参数列表失败')
        }
        res.data.forEach(item => {
          item.attr_vals=item.attr_vals.length !== 0?item.attr_vals.split(' '):[]
          item.inputVisible=false
        });
        // console.log(res.data);
        if (this.activeName === 'many') {
          this.manyTableData = res.data
        }else {
          this.onlyTableData = res.data
        }
      },
      // 将对attr_vals的操作，保存到数据库
      saveAttrVals(params) {
        this.$http.editCateParams({
          cat_id:params.cat_id,
          attr_id:params.attr_id,
          attr_name:params.attr_name,
          attr_sel:params.attr_sel,
          attr_vals:params.attr_vals.join(' ')}).then(res => {
          if (res.meta.status!==200) return this.$message.error(res.meta.msg)
          this.$message.success('更新成功')
        })
      },
      // 级联选择框选中项变化触发函数
      handleChange() {
        if (this.selectedCateKeys.length !== 3) {
          this.selectedCateKeys = []
          this.manyTableData = []
          this.onlyTableData = []
          return
        }
        this.getCateParamsList()
      },
      // tab 页签点击时触发函数
      handleTabClick() {
        this.getCateParamsList()
      },
      // 展示添加参数/属性对话框
      showAddParamsDialog() {
        this.addParamsDialogVisible = true
      },
      // 监听对话框关闭事件
      dialogClosed(ref) {
        this.$refs[ref].resetFields()
      },
      // 添加参数
      addParams() {
        this.$refs.addParamsFormRef.validate(valid => {
          if (!valid) return
          this.$http.addCateParams(this.cateId,{
            attr_name:this.addParamsForm.attr_name,
            attr_sel:this.activeName}).then(res => {
            if (res.meta.status!==201) return this.$message.error(res.meta.msg)
            this.$message.success('添加'+this.addDialogTitle+'成功')
            this.addParamsDialogVisible = false 
            this.getCateParamsList()
          })
        })
      },
      // 展示修改对话框
      showEditParamsDialog(params) {
        // console.log(params);
        this.editParamsForm = Object.assign({},params)
        this.editParamsDialogVisible = true
      },
      // 提交修改
      editParams() {
        this.$refs.editParamsFormRef.validate(valid => {
          if (!valid) return
          this.$http.editCateParams(this.editParamsForm).then(res => {
            if (res.meta.status!==200) return this.$message.error(res.meta.msg)
            this.$message.success('修改'+this.addDialogTitle+'成功')
            this.editParamsDialogVisible = false 
            this.getCateParamsList()
          })
        })
      },
      // 删除参数
      deleteParams({cat_id,attr_id}) {
        this.$confirm('此操作将删除该参数, 是否继续?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          this.$http.deleteParams(cat_id,attr_id).then((res) => {
            if (res.meta.status!==200) {
             return this.$message.error('删除失败') 
            }
            this.$message({
              type: 'success',
              message: '删除成功!'
            });
            this.getCateParamsList()
          })
          
        }).catch(() => {
          this.$message({
            type: 'info',
            message: '已取消删除'
          });          
        });
      },
      // 参数展开列标签函数
      handleTagClose(params,index) {
        params.attr_vals.splice(index,1)
        this.saveAttrVals(params)
      },
      showInput(params) {
        params.inputVisible = true;
        // 聚焦输入框
        this.$nextTick(_ => {
          this.$refs.saveTagInput.$refs.input.focus();
        });
      },
      handleInputConfirm(params) {
        // 输入空格或不输入返回
        if (!this.inputValue.trim()) {
          params.inputVisible = false;
          this.inputValue = '';
          return
        }
        params.attr_vals.push(this.inputValue.trim());
        if (this.inputValue) {
          this.saveAttrVals(params)
        }
        params.inputVisible = false;
        this.inputValue = '';
      }
    }
  }
</script>

<style scoped>
  .cat_opt {
    margin: 15px 0;
  }
  .el-tag {
    margin-left: 10px;
  }
  .button-new-tag {
    margin-left: 10px;
    height: 32px;
    line-height: 30px;
    padding-top: 0;
    padding-bottom: 0;
  }
  .input-new-tag {
    width: 90px;
    margin-left: 10px;
    vertical-align: bottom;
  }
</style>