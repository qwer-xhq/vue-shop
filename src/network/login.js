import { request } from "./request";

export function login(params) {
  return request({
    method: 'POST',
    url: 'login',
    params,
  })
}