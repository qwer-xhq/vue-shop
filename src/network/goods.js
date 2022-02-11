import { request } from "./request";

// 获取商品列表数据
export function getGoodsList(params) {
  return request({
    url: 'goods',
    params,
  })
}
// 添加商品
export function addGoods(params) {
  return request({
    method: 'post',
    url: 'goods',
    data: params
  })
}
// 编辑提交商品
export function editGoods({id,...params}) {
  return request({
    method: 'put',
    url: 'goods',
    data: params
  })
}
// 删除商品
export function deleteGoods(id) {
  return request({
    method: 'delete',
    url: 'goods/'+id,
  })
}

// 获取商品分类数据列表
export function getCatesList(params) {
  return request({
    url: 'categories',
    params
  })
}

// 添加分类
export function addCate(params) {
  return request({
    method: 'post',
    url: 'categories',
    data: params,
  })
}
// 修改分类
export function editCate({cat_id,cat_name}) {
  return request({
    method: 'put',
    url: 'categories/'+cat_id,
    data: {
      cat_name
    }
  })
}

// 删除分类
export function deleteCate(id) {
  return request({
    method: 'delete',
    url: 'categories/'+id,
  })
}

// 分类参数列表
export function getCateParamsList(id,sel) {
  return request({
    url: `categories/${id}/attributes`,
    params: {
      sel
    }
  })
}

// 添加分类参数/属性
export function addCateParams(id,params) {
  return request({
    method: 'post',
    url: `categories/${id}/attributes`,
    data: params
  })
}
// 修改分类参数/属性
export function editCateParams({cat_id,attr_id,attr_name,attr_sel,attr_vals}) {
  return request({
    method: 'put',
    url: `categories/${cat_id}/attributes/${attr_id}`,
    data: {
      attr_name,
      attr_sel,
      attr_vals
    }
  })
}
// 删除参数
export function deleteParams(cat_id,attr_id) {
  return request({
    method: 'delete',
    url: `categories/${cat_id}/attributes/${attr_id}`
  })
}