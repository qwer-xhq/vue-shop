<template>
  <el-menu
    background-color="#333744"
    text-color="#fff"
    active-text-color="#409eff"
    :collapse="isCollapse"
    :collapse-transition="false"
    router
    :default-active="activePath"
  >
    <el-submenu :index="`${item.id}`" v-for="(item,index) in menuList" :key="index">
      <template slot="title">
        <i :class="icon[index]"></i>
        <span>{{item.authName}}</span>
      </template>
      <el-menu-item :index="`/${item1.path}`" v-for="(item1,index1) in item.children" :key="index">
        <template slot="title">
          <i class="el-icon-menu"></i>
          <span>{{item1.authName}}</span>
        </template>
      </el-menu-item>
    </el-submenu>
    
  </el-menu>
</template>

<script>
  export default {
    name: 'NavMenu',
    props: {
      menuList: {
        type: Array,
        default: [],
      },
      isCollapse: {
        type:Boolean,
        default: false
      }
    },
    data() {
      return {
        icon: ['el-icon-s-custom','el-icon-s-opportunity','el-icon-s-goods','el-icon-s-order','el-icon-s-data']
      }
    },
    computed: {
      activePath() {
        return this.$route.path
      }
    },
    created() {
      // console.log(this.$route.path);
    },
  }
</script>

<style scoped>
  
</style>