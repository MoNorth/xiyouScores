# 西邮成绩API
Create by xiyoumobile
Power by Nodejs

## Users
1. Address ： http://score.northk.cn/users/login
   参数 ： username (学号 必填)、password (密码 必填)
   method : GET/POST/JSONP
   返回 ： 
   ```json
   {
   		error : ... //(错误，如果没有错误则为 false ),
   		session : ... //(session)
   }
   ```

2. Address : IP/users/info
   参数 ：username (学号 必填)、password (密码 必填)、session(填不填看服务器脸色)
   method : GET/POST/JSONP
   返回 ： 
   ```json
   {
   		"error":false,
   		"result":{
   				"username":"...",
   				"name":"...",
   				"sex":"男",
   				"brithday":"...",
   				"college":"...",
   				"class":"..."
   				}

   }
   ```

3. Address : IP/score/all
   参数 ：username (学号 必填)、session(必填)
   method : GET/POST/JSONP
   返回 ： 
   ```json
   {
   		"error":false,
   		"result":{
   				一大堆。。自己分析。反正是成绩
   				}

   }
   ```

4. Address : IP/score/year
   参数 ：username (学号 必填)、password(必填)、session(如果有update参数，必填，否则选填)、year(学年 格式例如：2015-2016 选填)、semester(学期 格式例如 1 选填)、update(更新参数，比较特殊，下面我介绍详情 选填)
   method : GET/POST/JSONP
   返回 ： 
   ```json
   {
   		"error":false,
   		"result":{
   				一大堆。。自己分析
   				}

   }
   ```
5. Address : IP/makeup
   参数 ： usename (学号 必填)、session(必填)
   mesthod : GET/POST/JSONP
   返回：补考查询，自己分析

## 重点：第四条接口与第三条接口有很大的不同，第四条接口如果不填update（内容随意）则为在本地服务器上取缓存的数据。缺点（数据不一定是最新的） 优点（快的飞起）。而第三条接口每次都是重新获取数据并加入缓存。慢，但是新。

## 建议：建议使用不加update参数的第四条数据，然后设置更新按键为更新数据库按钮，让用户选择是否更新数据。还有就是这是我的服务器，配置很差，禁止刷接口！！