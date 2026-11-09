# 更新日志 / Changelog

## 0.1.4
- npm 页面元信息补全：repository / homepage / bugs 链接、双语详细简介

## 0.1.3
- 新增常驻系统提示：报错前先 `error_lessons.search` 检索教训库，修好后自动 `error_lessons.add` 记录
- 同一错误第二次出现时强制更新记录（`occurrences` 计数 +1），不再新增重复条目
- 修复 Windows 下 tools 服务未注入导致的加载异常

## 0.1.2
- 修复 tools 服务注入声明（`ctx.inject(["tools"])`），解决 "cannot get property tools without inject" 报错

## 0.1.1
- 首次发布前的版本占位修正

## 0.1.0
- 首个版本：跨会话错误教训库，提供 `error_lessons.search`（检索）与 `error_lessons.add`（记录）两个工具
- 纯本地 JSON 存储（`~/.dsh/lessons/lessons.json`），档案级共享
