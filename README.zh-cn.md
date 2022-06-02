<div align="center">
	<img width="200" src="https://user-images.githubusercontent.com/25214732/171180699-93dcd410-d594-4627-bbff-d139597b0617.png" alt="DF GAIA">
</div>

<p align="center">
	<b>DF GAIA</b>
</p>

<p align="center">
  Contributor: <a href="https://twitter.com/DfArchon">@DfArchon</a>
</p>

# DF GAIA
[中文](https://github.com/dfarchon/DF-GAIA/blob/main/README.zh-cn.md) /
[English](https://github.com/dfarchon/DF-GAIA/blob/main/README.md)

**一个用户友好的黑暗森林插件开发库**，基于黑暗森林v0.6.5的底层接口开发。

**用户友好**有两层含义：

对于玩家来说，希望开发的插件是容易理解和使用的，与此同时要尽可能实现更多丰富的功能。

对于开发人员来说，希望可以利用我们封装的工具函数，可以更快地实现一个特定的功能模块，并且提供较为完善的文档或者能够对开发人员的问题提供及时的回复。

我们在黑暗森林游戏开放的接口的基础上，封装了很多**工具函数**，在这些工具函数的基础上我们实现了不同的**功能模块**，并且把这些模块整合到了几个**用户面板**当中，用户可以利用面板实现几乎所有的操作，从而极大地提高了用户的游戏体验。

我们把这些**工具函数**，**功能模块**和**用户面板**统称为**DF GAIA**，希望有更多的玩家能使用我们的插件，也希望为那些对黑暗森林插件开发感兴趣的朋友提供一个强有力的工具，使得开发人员不需要从0开始构建自己的插件，而是只需要对插件库有一个基础的了解，就可以快速开发出自己想要的功能模块，并且整合到我们的系统中。



如果是**玩家**的话，你只需要阅读 章节1 和 章节2 就可以对如何使用我们的插件有一个基础的了解。

如果你是**开发人员**, 希望利用DF GAIA开发功能模块或者参与我们的开发活动，可以阅读其他的章节和我们的介绍文档。

如果在使用或者在开发的过程当中遇到了任何的问题，欢迎加入我们的[discord](https://discord.gg/XkudXPAWZF)，到相应的channel当中进行提问，我们会尽快给出回复。

也欢迎在gitcoin上给我们捐款来支持我们的开发工作。

https://gitcoin.co/grants/4263/using-zk-for-game-optimization-in-dark-forest

## 1. 警告

插件是在您的游戏环境当中运行的，能够访问到您所有的隐私信息（包括私钥!) ，并且能够动态加载数据。

在使用插件之前，建议您对具体的插件内容有一个完整的了解，并且在使用插件之前对其进行审查。

DF GAIA的代码并没有经过严格的测试和审查。

 **使用插件需要您自行承担风险！！！**

## 2 .如何使用

【如果已安装请忽略】需要安装 df-plugin-dev-server命令行

```bash
npm i -g @projectsophon/df-plugin-dev-server
```

关于df-plugin-dev-server使用的注意事项请参考: https://github.com/projectsophon/df-plugin-dev-server

安装后在仓库的文件夹下运行命令：

```bash
df-plugin-dev-server
```

在游戏界面的plugin当中输入对应的面板的内容，然后就可以运行了。

这次我们主要开放了如下的用户面板，

DevPublic 主要用于用户常用的一些操作

```js
export { default } from "http://127.0.0.1:2222/DevPublic.js?dev";
```

DevShow主要用于展示宇宙地图上的各种信息

```js
export { default } from "http://127.0.0.1:2222/DevShow.js?dev";
```

DevAutoGear主要用于gear飞船的相关操作 （调度算法有待优化）

```js
export { default } from "http://127.0.0.1:2222/DevAutoGear.js?dev";
```

关于上述三个用户面板更进一步的描述，请参考我们的玩家使用手册。


[如何使用DevPublic](https://github.com/dfarchon/DF-GAIA/blob/main/docs/DevPublic.zh-cn.md)


## 3. 架构介绍

DF GAIA的程序文件分为如下几类，

cfgForXXX.js 主要放一些配置参数。

display.js 是存放一些在游戏地图上绘制圆圈、直线等的工具函数。

interfactForTerminal.js 是存放用于在右侧游戏内置的命令行显示信息的函数。

logicForXXX.js 主要是为了存放一些普遍使用到的工具函数，这些工具函数将黑暗森林能提供的接口进行了一定程度的封装，会有一些条件的判断，以及具体的上链操作。

secitonXXX.js 是一个特定功能的模块，这个模块函数会对符合条件的一些星球进行操作，例如升级，运送银矿等。secitonXXX.js 作为一个模块 会调用cfgForXXX.js 中的配置，interfactForTerminal.js, display.js 和 logicForXXX.js中的工具函数。

DevXXX.js 实现了一个用户友好的面板，将secitonXXX.js中实现的模块组合起来，利用 df-plugin-dev-server 可以直接在前端当中供玩家使用。



**我们前期开发了大量的工具函数（主要是display.js和logicForXXX.js) ，强烈推荐想要进行插件开发的朋友在这些工具函数的基础上进行功能模块的开发。**我们会在discord当中对大家的问题进行及时的回复，同时也在整理和编写相关的文档。



## 4. 接下来准备进行的工作

1.完善文档，对display.js 和 logicForXXX.js 的各个模块进行介绍和更新。

2.编写一些基于DF GAIA如何开发的教程。

3.开发出更多的功能模块，结合用户提出的需求进行改进。



## 5. 感谢

在实现DF GAIA过程当中，向所有为我们提供帮助和反馈意见的朋友们表示衷心的感谢！特别要感谢的是 黑暗森林官方discord服务器当中热心回答我们问题的朋友，在plugins.zkga.me开源插件的开发者和维护者，和 df-plugin-dev-server的开发团队projectsophon。



## License

GNU General Public License v3.0





