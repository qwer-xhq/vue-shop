import { login } from "./login";
import { getMenuList } from "./getMenuList"
import * as userListApi from "./userList"  // 导入userList的全部导出元素
import * as powerApi from "./power"
import * as goodsApi from "./goods"
import * as orderApi from "./order"

export default  {login, getMenuList, ...userListApi,...powerApi, ...goodsApi, ...orderApi}