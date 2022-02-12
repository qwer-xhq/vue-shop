<template>
  <div class="">
    <Breadcrumb :navTitle="['首页','数据统计','数据报表']"></Breadcrumb>
    <el-card>
      <div id="report" style="width: 600px;height:400px;"></div>
    </el-card>
  </div>
</template>

<script>
  export default {
    name: 'Reports',
    data() {
      return {
        // 需要合并的数据
        option: {
          title: {
            text: '用户来源'
          },
          tooltip: {
            trigger: 'axis',
            axisPointer: {
              type: 'cross',
              label: {
                backgroundColor: '#E9EEF3'
              }
            }
          },
          grid: {
            left: '3%',
            right: '4%',
            bottom: '3%',
            containLabel: true
          },
          xAxis: [
            {
              boundaryGap: false
            }
          ],
          yAxis: [
            {
              type: 'value'
            }
          ]
        },
        reportData: {}
      }
    },
    methods: {
      createReport() {
        // 基于准备好的dom，初始化echarts实例
        var myChart = this.$echarts.init(document.getElementById('report'));

        // 使用刚指定的配置项和数据显示图表。
        const option = Object.assign(this.option,this.reportData)
        myChart.setOption(option);
        }
    },
    created() {
      this.$http.getReportData().then(res => {
        this.reportData = res.data
        this.createReport()
      })
    },
  }
</script>

<style scoped>
  
</style>