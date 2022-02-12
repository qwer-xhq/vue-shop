import { login } from "./login";
import { getMenuList } from "./getMenuList"
import * as userListApi from "./userList"  // 导入userList的全部导出元素
import * as powerApi from "./power"
import * as goodsApi from "./goods"
import * as orderApi from "./order"
import { getReportData } from "./report"

export default  {login, getMenuList, getReportData,...userListApi,...powerApi, ...goodsApi, ...orderApi}