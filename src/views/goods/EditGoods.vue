<template>
  <div class="">
    <Breadcrumb :navTitle="['首页','商品管理','修改商品']"></Breadcrumb>
    <el-card>
      <el-alert
        title="修改商品信息"
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
      <el-form :model="editForm" :rules="editFormRules" ref="editFormRef" label-width="100px" label-position="top">
        <el-tabs 
          :tab-position="'left'" 
          style="" v-model="activeIndex" >
          <el-tab-pane label="基本信息" name="0">
            <el-form-item label="商品名称" prop="goods_name">
              <el-input v-model="editForm.goods_name"></el-input>
            </el-form-item>
            <el-form-item label="价格" prop="goods_price">
              <el-input v-model.number="editForm.goods_price" type="number"></el-input>
            </el-form-item>
            <el-form-item label="数量" prop="goods_number">
              <el-input v-model.number="editForm.goods_number" type="number"></el-input>
            </el-form-item>
            <el-form-item label="重量" prop="goods_weight">
              <el-input v-model.number="editForm.goods_weight" type="number"></el-input>
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
            <quill-editor v-model="editForm.goods_introduce"></quill-editor>
            <!-- 修改商品按钮 -->
            <el-button type="primary" style="margin-top: 15px" @click="editGoods">修改商品</el-button>
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
    name: 'EditGoods',
    data() {
      return {
        activeIndex: '0',
        // 编辑提交商品的参数名
        editParamsName: ['goods_name','goods_price','goods_number','goods_weight','goods_introduce','pics','attrs','goods_cat'],
        editForm: {},
        editFormRules: {
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
        cateId: '',
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
      goodsId() {
        return this.$route.params.id
      }
    },
    methods: {
      // 根据id获取商品
      async getGoodsById() {
        const res = await this.$http.getGoodsById(this.goodsId)
        if (res.meta.status !== 200) {
          return this.$message.error(res.meta.msg)
        }
        console.log(res.data);
        this.cateId = res.data.cat_id
        for(const param of this.editParamsName){
          this.$set(this.editForm, param, res.data[param])
        }
      },
      // 获取动态参数
      async getManyParams() {
        const res = await this.$http.getCateParamsList(this.cateId,'many')
        if (res.meta.status !== 200) {
          return this.$message.error('获取动态参数失败')
        }
        res.data.forEach(item => {
          item.attr_vals=item.attr_vals.length !== 0?item.attr_vals.split(' '):[]
        });
        this.manyTableData = res.data
      },
      // 获取静态属性
      async getOnlyParams() {
        const res = await this.$http.getCateParamsList(this.cateId,'only')
        if (res.meta.status !== 200) {
          return this.$message.error('获取静态属性失败')
        }
        
        this.onlyTableData = res.data
      },
      handlePreview(file) {
        this.previewPath = file.response.data.url
        this.previewVisible = true
      },
      handleRemove(file) {
        const picIndex = this.editForm.pics.findIndex(item => {
          return item.pic === file.response.data.tmp_path
        })
        this.editForm.pics.splice(picIndex,1)
      },
      // 图片上传成功是的钩子函数
      handleSuccess(response) {
        if (response.meta.status !== 200) {
          return this.$message.error(response.meta.msg)
        }
        this.editForm.pics = []
        this.editForm.pics.push({pic:response.data.tmp_path})
      },
      // 修改商品
      editGoods() {
        this.$refs.editFormRef.validate(valid => {
          if (!valid) {
            return this.$message.error('请填写必填项')
          }
          this.editForm.attrs = []
          this.manyTableData.forEach(item => {
            if (item.attr_vals.length !== 0) {
              this.editForm.attrs.push({attr_id: item.attr_id, attr_value: item.attr_vals.join(' ')})
            }
          })
          this.onlyTableData.forEach(item => {
            if (item.attr_vals !== '') {
              this.editForm.attrs.push({attr_id: item.attr_id, attr_value: item.attr_vals})
            }
          })
          // 发起添加商品请求
          this.$http.editGoods(this.goodsId,this.editForm).then(res => {
            if (res.meta.status !== 200) {
              return this.$message.error(res.meta.msg)
            }
            console.log(res.data);
            this.$message.success('修改成功')
            this.$router.push('/goods')
          })
        })
      }
    },
    async created() {
      await this.getGoodsById(),
      this.getManyParams()
      this.getOnlyParams()
    },
  }
</script>

<style lang="less" scoped>
  .el-checkbox {
    margin: 0 10px 0 0 !important;
  }
</style>