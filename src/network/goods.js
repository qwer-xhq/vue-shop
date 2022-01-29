import { request } from "./request";

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