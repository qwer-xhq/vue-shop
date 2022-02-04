<template>
  <!-- 面包屑导航 -->
  <el-breadcrumb separator-class="el-icon-arrow-right">
    <el-breadcrumb-item :to="{ path: '/home' }">{{navTitle[0]}}</el-breadcrumb-item>
    <el-breadcrumb-item>{{navTitle[1]}}</el-breadcrumb-item>
    <el-breadcrumb-item>{{navTitle[2]}}</el-breadcrumb-item>
  </el-breadcrumb>
</template>

<script>
  export default {
    name: 'Breadcrumb',
    props: {
      navTitle: Array,
    }
  }
</script>

<style lang="" scoped>
  
</style>