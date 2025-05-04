---
title: arch安装软件
abbrlink: ebbb1ba4
date: 2025-05-04 20:27:21
tags:
categories:
description:
---

记录下我经常使用需要安装的软件
<!-- more -->
### 镜像
root权限
```bash
sudo tee -a /etc/pacman.conf << EOF
[archlinuxcn]
Server = https://mirrors.ustc.edu.cn/archlinuxcn/\$arch
Server = https://mirrors.tuna.tsinghua.edu.cn/archlinuxcn/\$arch
Server = https://mirrors.hit.edu.cn/archlinuxcn/\$arch
Server = https://repo.huaweicloud.com/archlinuxcn/\$arch
EOF
```
### paru
```bash
sudo pacman-key --lsign-key "farseerfc@archlinux.org"
sudo pacman -S archlinuxcn-keyring
sudo pacman -S paru
```
### 输入法
```bash
sudo pacman -S fcitx5 fcitx5-gtk fcitx5-qt fcitx5-configtool fcitx5-rime librime fcitx5-im xclip
```
-   fcitx5: 输入法基础框架主程序
-   fcitx5-gtk: GTK 程序的支持， 必须安装， 修复打字太快漏字的问题
-   fcitx5-qt: QT5 程序的支持， 必须安装， 修复打字太快漏字的问题
-   fcitx5-configtool: 图形化配置工具
-   fcitx5-rime: RIME 输入法
-   fcitx5-im: 输入法设置工具
-   librime: rime 相关库， 下面的 emacs-rime 会用到
- xclip安装这个才会生效
添加环境变量
```bash
sudo tee -a ~/.xprofile  << EOF
export GTK_IM_MODULE=fcitx
export QT_IM_MODULE=fcitx
export XMODIFIERS="@im=fcitx"
EOF
```
使刚修改的文件生效
```bash
source ~/.xprofile
```
### clash
```bash
paru -S clash-verge-rev-bin
paru -S wps-office
paru -S visual-studio-code-bin
paru -S intellij-idea-ultimate-edition
paru -S google-chrome
 ```
### 微信
```bash
paru -S wechat-universal-bwrap
 ```

 >这个最新版本似乎已经解决，遇到再试试
 >默认无法支持 DND 拖拽文件和访问 HOME 目录， 创建文件 `~/.config/wechat-universal/binds.list` 并在文件中添加 HOME 下的文件目录即可。
>比如我的 `~/.config/wechat-universal/binds.list` 内容是：
```bash
桌面
图片
文档
下载
视频
```
### 博客
```bash
sudo pacman -S nodejs npm
sudo npm install -g hexo-cli
```
### 开启蓝牙
```bash
sudo systemctl start bluetooth
sudo systemctl enable bluetooth
```
