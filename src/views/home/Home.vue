<template>
  <el-container class="home-container">
    <el-header>
      <div class="header-log">
        <img src="~assets/logo.png" alt="">
        <span>电商管理系统</span>
      </div>
      <el-button type="info" @click="logout">退出</el-button>
    </el-header>
    <el-container>
      <el-aside :width="isCollapse ? '64px':'200px'">
        <div class="toggle-button" @click="toggleCollapse">|||</div>
        <NavMenu class="home-menu" :menuList="menuList" :isCollapse="isCollapse"></NavMenu>
      </el-aside>
      <el-main>
        <RouterView></RouterView>
      </el-main>
    </el-container>
  </el-container>
</template>

<script>
  // import {getMenuList} from 'network/getMenuList'

  import NavMenu from 'components/content/navMenu/NavMenu'

  export default {
    name: 'Home',
    components: {
      NavMenu
    },
    data() {
      return {
        menuList: [],
        isCollapse: false,
      }
    },
    methods: {
      logout(){
        window.sessionStorage.clear()
        this.$router.push('/login')
      },
      toggleCollapse() { // 展开折叠侧边栏
        this.isCollapse = !this.isCollapse
      }
    },
    created() {
      this.$http.getMenuList().then(res => {
        // console.log(res);
        this.menuList = res.data
      })
    }
  }
</script>

<style lang="less" scoped>
  .home-container{
    height: 100%;
    
  }
  .el-header {
    background-color: #373d41;
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding-left: 0;

    .header-log {
      height: 100%;
      display: flex;
      align-items: center;
      color: #fff;
      font-size: 20px;

      img {
        height: 80%;
        border: 2px solid #fff;
        border-radius: 50%;
        margin-right: 10px;
      }
    }
  }
  .el-aside {
    background-color: #333744;

    .toggle-button {
      text-align: center;
      color: #fff;
      letter-spacing: 4px;
      cursor: pointer;
    }
  }
  .el-main {
    background-color: #eaedf1;
  }
  .home-menu {
    border: 0;
  }
</style>