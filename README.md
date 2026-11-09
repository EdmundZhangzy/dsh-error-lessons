# dsh-error-lessons

跨会话「错误教训库」插件：代理每次处理错误前检索教训库，看同样或相似的问题以前是否犯过，命中直接复用当时的解法——犯过的错不再犯。

- 存储：档案级共享 `~/.dsh/lessons/lessons.json`，所有会话读同一份
- 工具：
  - `error_lessons.search` — 关键词检索教训（现象/根因/解法/结果）
  - `error_lessons.add` — 记录一条已验证的新教训
- 零依赖、纯本地、不碰 DSH 运行组件、不联网

## 使用示例

```
报错: torch 2.8 合成输出满幅噪声
→ error_lessons.search("torch noise 满幅噪声")
→ 命中: torch 2.8 与 RVC 合成器不兼容 → 降级 2.7.1+cu126 解决
```

## 安装

```sh
dsh plugin --profile web add dsh-error-lessons
```
