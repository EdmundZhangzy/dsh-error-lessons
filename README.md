# dsh-error-lessons

跨会话「错误教训库」插件：代理每次处理报错前检索教训库，看同样或相似的问题以前是否犯过，命中直接复用当时的解法——犯过的错不再犯。

## 功能

- **自动工作流提示**：常驻系统提示，代理报错前先查、修好后自动记录
- **重复必记**：同一错误第二次出现时强制更新记录（`occurrences` 计数 +1），不再新增重复条目
- 存储：档案级共享 `~/.dsh/lessons/lessons.json`，所有会话读同一份
- 零依赖、纯本地、不碰 DSH 运行组件、不联网

## 工具

| 工具 | 作用 |
|---|---|
| `error_lessons.search` | 关键词检索教训（现象/根因/解法/结果），命中返回解法 + 是否重复 |
| `error_lessons.add` | 记录一条已验证的新教训；相同症状自动更新计数 |

## 使用示例

```
报错: torch 2.8 合成输出满幅噪声
→ error_lessons.search("torch noise 满幅噪声")
→ 命中: torch 2.8 与 RVC 合成器不兼容 → 降级 2.7.1+cu126 解决
→ 修好后: error_lessons.add(symptom, cause, fix, result, tags) 记录
```

## 安装

```sh
dsh plugin add dsh-error-lessons
```

## 更新日志

见 [CHANGELOG.md](./CHANGELOG.md)
