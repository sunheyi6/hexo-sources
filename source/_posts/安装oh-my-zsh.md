---
title: arch安装oh my zsh
abbrlink: dd5a5d51
date: 2025-05-10 17:41:11
tags:
categories:
description:
---
最近在折腾arch 终端比较多，看到了这个 ，使用起来确实也很舒服的，记录下
> 快来用 真的很舒服
<!-- more -->
1. 安装zsh
```shell
sudo pacman -S zsh
```
1. 设置zsh为默认的shell
```shell
chsh -s $(which zsh)
```
1. 安装主题
```shell
git clone --depth=1 https://github.com/romkatv/powerlevel10k.git ${ZSH_CUSTOM:-$HOME/.oh-my-zsh/custom}/themes/powerlevel10k
```
4. 安装命令建议插件
```shell
git clone https://github.com/zsh-users/zsh-autosuggestions ${ZSH_CUSTOM:-~/.oh-my-zsh/custom}/plugins/zsh-autosuggestions
```
5. 安装命令语法校验插件
```shell
git clone https://github.com/zsh-users/zsh-syntax-highlighting.git ${ZSH_CUSTOM:-~/.oh-my-zsh/custom}/plugins/zsh-syntax-highlighting
```
