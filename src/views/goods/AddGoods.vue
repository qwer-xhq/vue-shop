<template>
  <div class="">
    <Breadcrumb :navTitle="['首页','商品管理','添加商品']"></Breadcrumb>
    <el-card>
      <el-alert
        title="添加商品信息"
        type="info"
        center
        show-icon>
      </el-alert>
      <!-- 步骤条区域 -->
      <el-steps :space="200" :active="activeIndex-0" finish-status="success" align-center>
        <el-step title="商品信息"></el-step>
        <el-step title="商品参数"></el-step>
        <el-step title="商品属性"></el-step>
        <el-step title="商品图片"></el-step>
        <el-step title="商品内容"></el-step>
        <el-step title="商品完成"></el-step>
      </el-steps>
      <!-- tab栏区域 -->
      <el-form :model="addForm" :rules="addFormRules" ref="addFormRef" label-width="100px" label-position="top">
        <el-tabs 
          :tab-position="'left'" 
          style="" v-model="activeIndex" 
          :before-leave="beforeTabLeave"
          @tab-click="tabClicked">
          <el-tab-pane label="基本信息" name="0">
            <el-form-item label="商品名称" prop="goods_name">
              <el-input v-model="addForm.goods_name"></el-input>
            </el-form-item>
            <el-form-item label="价格" prop="goods_price">
              <el-input v-model.number="addForm.goods_price" type="number"></el-input>
            </el-form-item>
            <el-form-item label="数量" prop="goods_number">
              <el-input v-model.number="addForm.goods_number" type="number"></el-input>
            </el-form-item>
            <el-form-item label="重量" prop="goods_weight">
              <el-input v-model.number="addForm.goods_weight" type="number"></el-input>
            </el-form-item>
            <el-form-item label="商品分类" prop="goods_cat">
              <!-- 分类级联选择框 -->
              <el-cascader
                v-model="selectedCateKeys"
                :options="catesList"
                :props="cateProps"
                @change="handleChange">
              </el-cascader>
            </el-form-item>
          </el-tab-pane>
          <el-tab-pane label="商品参数" name="1">
            <el-form-item :label="item.attr_name" v-for="(item,index) in manyTableData" :key="item.attr_id">
              <el-checkbox-group v-model="item.attr_vals">
                <el-checkbox :label="attr_val" v-for="(attr_val,index1) in item.attr_vals" border></el-checkbox>
              </el-checkbox-group>
            </el-form-item>
          </el-tab-pane>
          <el-tab-pane label="商品属性" name="2">
            <el-form-item :label="item.attr_name" v-for="(item,index) in onlyTableData" :key="item.attr_id">
              <el-input v-model="item.attr_vals"></el-input>
            </el-form-item>
          </el-tab-pane>
          <el-tab-pane label="商品图片" name="3">
            <el-upload
              :action="uploadURL"
              :headers="headerObj"
              :on-preview="handlePreview"
              :on-remove="handleRemove"
              list-type="picture"
              :on-success="handleSuccess"
              >
              <el-button size="small" type="primary">点击上传</el-button>
            </el-upload>
          </el-tab-pane>
          <el-tab-pane label="商品内容" name="4">
            <!-- 富文本编辑器 -->
            <quill-editor v-model="addForm.goods_introduce"></quill-editor>
            <!-- 添加商品按钮 -->
            <el-button type="primary" style="margin-top: 15px" @click="addGoods">添加商品</el-button>
          </el-tab-pane>
        </el-tabs>
      </el-form>
    </el-card>
    <!-- 预览图片对话框 -->
    <el-dialog
      title="预览图片"
      :visible.sync="previewVisible"
      width="50%">
      <img :src="previewPath" alt="" style="width:100%">
    </el-dialog>
  </div>
</template>

<script>
  export default {
    name: 'AddGoods',
    data() {
      return {
        activeIndex: '0',
        addForm: {
          goods_name: '',
          goods_cat: '',
          goods_price: 0,
          goods_number: 0,
          goods_weight: 0,
          goods_introduce: '',
          pics: [],
          attrs: [],
        },
        addFormRules: {
          goods_name: [
            {required: true, message: '请输入商品名称', trigger: 'blur'},
          ],
          goods_cat: [
            {required: true, message: '请输入商品类型', trigger: 'blur'},
          ],
          goods_price: [
            {required: true, message: '请输入商品价格', trigger: 'blur'},
          ],
          goods_number: [
            {required: true, message: '请输入商品数量', trigger: 'blur'},
          ],
          goods_weight: [
            {required: true, message: '请输入商品重量', trigger: 'blur'},
          ],
        },
        catesList: [],
        selectedCateKeys: [],
        // 级联选择框配置选项
        cateProps: {
          expandTrigger: 'hover',
          value: 'cat_id',
          label: 'cat_name',
          children: 'children',
        },
        manyTableData: [],
        onlyTableData: [],
        checkAttrValsList: [],
        // 图片上传路径
        uploadURL: 'http://127.0.0.1:8888/api/private/v1/upload',
        // 上传请求的header配置
        headerObj: {
          Authorization:window.sessionStorage.getItem('token')
        },
        previewVisible: false, // 预览窗口显示/隐藏
        previewPath: '', // 预览图片地址
      }
    },
    computed: {
      // 当前选中的三级分类Id
      cateId() {
        if (this.selectedCateKeys.length === 3) {
          return this.selectedCateKeys[2]
        }
        return null
      },
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
      // 级联选择框选中项变化触发函数
      handleChange() {
        if (this.selectedCateKeys.length !== 3) {
          this.selectedCateKeys = []
          this.addForm.goods_cat = this.selectedCateKeys.join(',')
          return
        }
        this.addForm.goods_cat = this.selectedCateKeys.join(',')
      },
      // 切换标签前的钩子函数
      beforeTabLeave(activeName, oldActiveName) {
        let isChange = true
        if (!oldActiveName) {
          return
        }
        this.$refs.addFormRef.validate((valid) => {
          if (!valid) {
            this.$message.error('还有选项未填写！')
            isChange = false
          }
        })
        return isChange
        // if (oldActiveName === '0' && this.selectedCateKeys.length !== 3) {
        //   this.$message.error('请选择商品分类')
        //   return false
        // }
      },
      // 点击标签时触发函数
      async tabClicked() {
        if (this.activeIndex === '1') {
          const res = await this.$http.getCateParamsList(this.cateId,'many')
          if (res.meta.status !== 200) {
            return this.$message.error('获取动态参数失败')
          }
          res.data.forEach(item => {
            item.attr_vals=item.attr_vals.length !== 0?item.attr_vals.split(' '):[]
            
          });
          this.manyTableData = res.data
        } else if (this.activeIndex === '2') {
          const res = await this.$http.getCateParamsList(this.cateId,'only')
          if (res.meta.status !== 200) {
            return this.$message.error('获取静态属性失败')
          }
          
          this.onlyTableData = res.data
        }
      },
      handlePreview(file) {
        this.previewPath = file.response.data.url
        this.previewVisible = true
      },
      handleRemove(file) {
        const picIndex = this.addForm.pics.findIndex(item => {
          return item.pic === file.response.data.tmp_path
        })
        this.addForm.pics.splice(picIndex,1)
      },
      // 图片上传成功是的钩子函数
      handleSuccess(response) {
        if (response.meta.status !== 200) {
          return this.$message.error(response.meta.msg)
        }
        this.addForm.pics.push({pic:response.data.tmp_path})
      },
      // 添加商品
      addGoods() {
        this.$refs.addFormRef.validate(valid => {
          if (!valid) {
            return this.$message.error('请填写必填项')
          }
          this.manyTableData.forEach(item => {
            this.addForm.attrs.push({attr_id: item.attr_id, attr_value: item.attr_vals.join(' ')})
          })
          this.onlyTableData.forEach(item => {
            this.addForm.attrs.push({attr_id: item.attr_id, attr_value: item.attr_vals})
          })
          // 发起添加商品请求
          this.$http.addGoods(this.addForm).then(res => {
            if (res.meta.status !== 201) {
              return this.$message.error(res.meta.msg)
            }
            this.$message.success('添加成功')
            this.$router.push('/goods')
          })
          // console.log(res);
          // if (res.meta.status !== 201) {
          //   return this.$message.error(res.meta.msg)
          // }
          // this.$message.success('添加成功')
          // console.log(res.data);
          // this.$router.push('/goods')
        })
      }
    },
    created() {
      this.getCatesList()
    }
  }
</script>

<style lang="less" scoped>
  .el-checkbox {
    margin: 0 10px 0 0 !important;
  }
</style>