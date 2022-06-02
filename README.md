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

**A user-friendly dark forest plugin development library**, which is based  on dark forest v0.6.5.

**User-friendly** has two meanings:

For players, we hope that the developed plugins are easy to understand and use. At the same time, we hope the plugins can achieve as many rich functions as possible.

For developers, we hope that they can use our wrapped functions to develop a specific function module faster. What's more, we hope to provide more comprehensive documentation or provide timely responses to the development problems.

Based on the interface of [Dark Forest](https://zkga.me/), we wrapped a lot of **tool functions**, and we use those tool functions to develop different **sections（function modules)**, and we integrate these sections into a few **user panels**. Players can use a few user panels to achieve almost all the operations, which greatly improve the user's gaming experience.

We call these **tool functions**, **sections(function modules)** and **user panels** collectively as **DF GAIA**. We hope more players can use our plugin, and hope to provider a powerful tool to develop plugin for developers. With **DF GAIA**, developers don't need to build their own plugins from zero, they just need to have a basic understanding of this development library, and they can quickly develop some sections(functional modules) they want and integrate them into our system.

If you are a **player**, you only need to read Chapter 1 and 2 to have a basic understanding of how to use our plugin.

If you are a **developer**, and want to use DF GAIA to develop function modules or participate in our development activities, you can read other chapters and our introduction documents.

If you have any questions on how to use our plugins or meet some problems during development, welcome to our discord [DfArchon-Community](https://discord.gg/XkudXPAWZF), we will reply as soon as possible.

Besides, welcome to donate to us on gitcoin to support our development work.

https://gitcoin.co/grants/4263/using-zk-for-game-optimization-in-dark-forest

## 1. Warning 

The plugin runs in your game environment, has access to all your private information (including private keys!), and can dynamically load data.

Before using a plugin, it is recommended that you have a complete understanding of the specific plugin content and review it before using it.

DF GAIA's code has not been rigorously tested and reviewed.

 **use plugin at your own risk !!!**

## 2 . how to use 

You need to install the command line tools : df-plugin-dev-server 

```bash
npm i -g @projectsophon/df-plugin-dev-server
```

[more about df-plugin-dev-server](https://github.com/projectsophon/df-plugin-dev-server)

After installation, run the command in the repository folder:

```bash
df-plugin-dev-server
```

Enter the content of the plugin panel in Dark Forest UI, and then you can run it.

This time we mainly open source the following user panel：

**DevPublic** is mainly used for some operations commonly used by players

```js
export { default } from "http://127.0.0.1:2222/DevPublic.js?dev";
```

**DevShow** is mainly used to display various information on the universe map

```js
export { default } from "http://127.0.0.1:2222/DevShow.js?dev";
```

**DevAutoGear** is mainly used for gear related operations (the scheduling algorithm needs to be optimized)

```js
export { default } from "http://127.0.0.1:2222/DevAutoGear.js?dev";
```

For a further description of the above user panels, please refer to our player manuals.

[how to use DevPublic](https://github.com/dfarchon/DF-GAIA/blob/main/docs/DevPublic.en-us.md)



## 3. Architecture introduction

The program files of DF GAIA are divided into the following categories,

cfgForXXX.js mainly put some configuration parameters.

display.js have some tool functions to draw colorful circles or lines on the map of universe.

interfactForTerminal.js have some tool functions to display some information on the right command lines.

logicForXXX.js have some tools functions which are wildly used in different modules, for examples, do some conditional judgments or do some on-chain operations.

secitonXXX.js is a **section (function module)**, which will do some on-chain operations to some planets, such as upgrade some planets or move silver to some planets. SectionXXX.js will read parameters in cfgForXXX.js and call tool functions in display.js, interfactForTerminal.js and logicForXXX.js.

DevXXX.js implements a **user panel** that combines sections implemented in secitonXXX.js and uses df-plugin-dev-server for players to use directly in the front end.



**We have developed a lot of tool functions (mainly in display.js and logicForXXX.js). It is strongly recommended that friends who want to develop plugins to develop functional modules on the basis of these tool functions.** We will respond to your questions as soon as possible in the discord, and we are also sorting out and writing related documents.

## 4. todo list

1.Improve the documentation, introduce and update each module of display.js and logicForXXX.js.

2.Write some tutorials based on how DF GAIA is developed.

3.Develop more functional modules and make improvements based on the needs of users



## 5. Thanks

In the process of developing DF GAIA, we would like to express our heartfelt thanks to all the friends who provided us with help and feedback!  Special thanks to the friends who enthusiastically answered our questions in the official discord server of Dark Forest, the developers and maintainers of open source plugins at [plugins.zkga.me](https://plugins.zkga.me), and [projectsophon](https://github.com/projectsophon) which is the development team of df-plugin-dev-server.



## License

GNU General Public License v3.0





