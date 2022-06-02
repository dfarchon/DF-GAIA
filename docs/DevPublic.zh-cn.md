# DevPublic

## 概览

DevPublic主界面如下图所示:

<p align="center">
    <img src="https://user-images.githubusercontent.com/25214732/171418895-4a901cdf-8f97-49a7-85a5-bd51244a8ede.png" width=300 >
</p>

其中, 面板的上半部分是功能选择区, 选择不同的按键即可使用相应的功能; 下面绿色的部分为日志区, 在插件工作时实时打印运行日志.

## 独立模块

### **planet info**

- 功能简介
  - 快速查看目标星球的信息
- 使用方法
  1. 选中感兴趣的星球
  2. 点击`plane info`按钮
  3. 对应星球的信息将被打印在输出窗口
  4. 使用示例

<p align="center"><img src="https://user-images.githubusercontent.com/25214732/171419159-7e3b478d-3fea-4a06-810d-344d9a590fca.gif" width=400><p>

### **hard fresh**

- 功能简介
  - 强制刷新星球, 从合约重新读取星球最新状态
- 使用方法
  1. 选中需要刷新的星球
  2. 点击`hard fresh`按钮
  3. 日志区输出`[RP] refresh planet end`时, 刷新完成
  4. 使用示例

<p align="center"><img src="https://user-images.githubusercontent.com/25214732/171419813-81fa3e31-ced1-4286-b623-4f83fba145c6.gif" width=400 ><p>


### **center view**

- 功能简介
  - 自动计算己方星球群的中心, 并调整视图
- 使用方法
  1. 点击`center view`按钮
  2. 等待日志区输出`[CV] == center view finish ==`, 视图调整完成
  3. 使用示例

<p align="center"><img src="https://user-images.githubusercontent.com/25214732/171419936-a5f31190-28d9-4c3b-959b-5d888b6b7b77.gif" width=500 ><p>


### **move silver**

- 功能简介
  - 自动分发银矿到星球和黑洞
- 使用方法
  1. 点击`move silver`按钮
  2. 日志区将输出当前银矿的概况, 并开始自动分配银矿,会操作银矿最多的前三个产矿星球. 优先分配给星球, 然后是黑洞.
  3. 使用示例

<p align="center"><img src="https://user-images.githubusercontent.com/30570177/171436959-99dc0106-e4b8-4bc3-b777-f6e4d75fccf3.gif" width=500 ><p>

​    
### **show cluster**

- 功能简介
  - 使用聚类算法对己方星球进行聚类并展示结果
- 使用方法
  1. 点击`show cluster`按钮
  2. 日志区将输出聚类的结果, 并将不同类的星球标注在地图上
  3. 使用示例

<p align="center"><img src="https://user-images.githubusercontent.com/30570177/171437310-a933829c-d849-44fd-a878-cfec8581c389.gif" width=500 ><p>


### **move silver to blackhole**

- 功能简介
  - 自动移动银矿到黑洞
- 使用方法
  1. 点击`move silver to blackhole`按钮
  2. 会操作银矿最多的前三个产矿星球，银矿将开始自动向黑洞移动
  3. 使用示例

<p align="center"><img src="https://user-images.githubusercontent.com/30570177/171437501-6a8967c7-340f-487a-9835-3284c9c5715d.gif" width=500 ><p>


### **withdraw silver**

- 功能简介
  - 自动提取银矿
- 使用方法
  1. 点击`withdraw silver`按钮
  2. 自动提取银矿数量最多的前6个黑洞的银矿
  3. 使用示例

<p align="center"><img src="https://user-images.githubusercontent.com/30570177/171437751-8fb4db32-6ebc-4b5f-91ca-0f6997aca9be.gif" width=500 ><p>


### **upgrade**

- 功能简介
  - 自动升级星球
- 使用方法
  1. 点击`upgrade`按钮
  2. 按照星球本身的等级进行排序，插件将自动升级满足条件前6个星球优先升级距离等级, 其次是速度等级
  3. 使用示例

<p align="center"><img src="https://user-images.githubusercontent.com/30570177/171437948-1bf2c7d8-abbb-43b0-a612-8ec2cec68b80.gif" width=500 ><p>

​    
### **invade/capture**

- 功能简介
  - 自动invade/capture符合条件的星球
- 使用方法
  1. 点击`invade/capture`按钮
  2. 插件将自动invade/capture所有符合条件的星球
  3. 使用示例

<p align="center"><img src="https://user-images.githubusercontent.com/30570177/171438090-a6275339-c13a-416b-ba31-2b39c11b60b2.gif" width=500 ><p>

​    
### **abandon50**

- 功能简介
  - 自动 abandon 低等级/已经capture的星球, 释放至少50的junk值
- 使用方法
  1. 点击`abandon50`按钮
  2. 插件将自动abando低等级星球, 默认最大等级为4级, 可手动在`async function abandon50`函数中调整
  3. 使用示例(注意junk值的变化)

<p align="center"><img src="https://user-images.githubusercontent.com/30570177/171438226-de86b432-f137-412e-82ef-a065d8c8c7ad.gif" width=500 ><p>

    ![abandon50]()


​    
### **catch yellow selected**

- 功能简介
  - 自动捕获黄区内的星球
- 使用方法
  1. 选择攻击发起星球
  2. 点击`catch yellow selected`按钮
  3. 插件将以所选择的星球作为攻击发起点, 发送能量捕获附近黄区内的星球
  4. 使用示例

<p align="center"><img src="https://user-images.githubusercontent.com/30570177/171438520-6af0e16a-ba43-4693-911a-c1f5c4a2ca18.gif" width=500 ><p>

​    
### **catch invade candidates/selected**

- 功能简介
  - 自动捕获目前没有主人的而且已经满足capture条件(曾经invade过，而且时长满足条件）的星球
- 使用方法
  1. 点击`catch yellow candidates/selected`按钮
  2. 插件将自动计算合适的攻击方案并发送能量捕获附近黄区内的星球, 如果是`selected`则从指定的星球发起攻击
  3. 使用示例(与catch yellow selected同)
  
>注意: 可能需要结合devShow.js来寻找满足条件的星球。

### **center energy&silver selected**

- 功能简介
  - 将能量和银矿集中到所选择的星球
- 使用方法
  1. 选择目标星球
  2. 点击`center energy&silver selected`按钮
  3. 插件将能量和银矿集中到所选择的星球 
  4. 使用示例

<p align="center"><img src="https://user-images.githubusercontent.com/30570177/171438778-ab6bf279-17ef-47b0-b072-b1602f3af0b7.gif" width=500 ><p>

​    
### **collect6**

- 功能简介
  - 将能量和银矿集中到所选择的星球
- 使用方法
  1. 点击collect6按钮
  2. 属于我的星球按照一定规则排序(以星球等级作为主要排序依据，同时考虑capture的相关状态），自动向排名前6的星球集合能量。
  3. 使用示例

<p align="center"><img src="https://user-images.githubusercontent.com/30570177/171439098-331f66e1-df66-4d24-8dc7-feeca037e711.gif" width=500 ><p>

​    
### **gossip** 模块

- 功能简介
  - gossip模块为综合的自动扩张模块, 每次玩家可以选择一个或者一些星球作为目标方向, 运行该模块即可自动向选定的星球方向扩张
- - 使用方法
  1. 选定目标星球, 点击`add 1`将其加入到队列
  2. 点击`gossip`即可进行选定方向的自动扩张
  3. 使用`clear 1`即可将选定的星球从队列中移除, 使用`clear all`可以移除所有的星球
  4. 使用示例

<p align="center"><img src="https://user-images.githubusercontent.com/30570177/171443691-1e376945-2500-4fc3-9b69-7602c3eb7d59.gif" width=500 ><p>


## 日志区(绿色输出窗口)

- Features
  
  
