import { request } from './request'

// 获取用户列表
export function getUserList(params) {
  return request({
    url: 'users',
    params
  })
}

// 修改用户状态
export function userStateChanged(uId, type) {
  return request({
    method: "put",
    url: `users/${uId}/state/${type}`
  })
}

// 添加用户
export function addUser(userInfo) {
  return request({
    method: "post",
    url: 'users',
    data: userInfo
  })
}

// 修改用户信息
export function editUserInfo({id,email,mobile}) { // 传入的userInfo对象，解构赋值
  return request({
    method: 'put',
    url: 'users/' + id,
    data: {
      email,
      mobile,
    }
  })
}

// 删除单个用户
export function deleteUser(id) {
  return request({
    method: 'delete',
    url: 'users/'+id
  })
}

