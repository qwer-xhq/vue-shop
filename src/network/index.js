import { login } from "./login";
import { getMenuList } from "./getMenuList"
import * as userListApi from "./userList"  // 导入userList的全部导出元素
import * as powerApi from "./power"

export default { login, getMenuList, ...userListApi,...powerApi}