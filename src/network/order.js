import {request} from './request'

// 获取订单列表
export function getOrdersList(params) {
  return request({
    url: 'orders',
    params
  })
}