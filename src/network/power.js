import { request } from "./request";

// 获取权限列表
export function getRightsList(type) {
  return request({
    url: 'rights/'+type,
  })
}

// 获取角色列表
export function getRoleList() {
  return request({
    url: 'roles'
  })
}

// 添加角色
export function addRole(params) {
  return request({
    method: 'post',
    url: 'roles',
    data: params
  })
}

// 编辑角色
export function editRoleInfo({id,roleName,roleDesc}) {
  return request({
    method: 'put',
    url: `roles/${id}`,
    data: {
      roleName,
      roleDesc,
    }
  })
}

// 删除角色
export function deleteRole(id) {
  return request({
    method: 'delete',
    url: `roles/${id}`
  })
}

// 删除角色指定权限
export function deleteRightById(roleId,rightId) {
  return request({
    method: 'delete',
    url: `roles/${roleId}/rights/${rightId}`
  })
}

// 角色授权
export function allotRights(roleId,rids) {
  return request({
    method: 'post',
    url: `roles/${roleId}/rights`,
    data: {
      rids
    },
  })
}

// 分配用户角色
export function setRole(userId,rid) {
  return request({
    method: 'put',
    url: `users/${userId}/role`,
    data: {
      rid
    }
  })
}
