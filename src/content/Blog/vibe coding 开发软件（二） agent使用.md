---
date_modified: 2026-01-15 12:35:08
---
尝试多 agent 并行

不断尝试新的 git 提交点

这类工具唯一的缺点就是我们的机器人伙伴们太容易轻信他人了。如果你粘贴一份代码更新说明，克劳德就会完全相信你的话，照做修改，即使你要求的修改完全是错误的。

目前我避免这种情况的最佳方法是进行一些角色扮演，让代码审查员明白不能盲目信任代码审查结果。每次审查都会在前面加上这段文字：

```
A reviewer did some analysis of this PR. They're external, so reading the codebase cold. This is their analysis of the changes and I'd like you to evaluate the analysis and the reviewer carefully.

1) should we hire this reviewer
2) which of the issues they've flagged should be fixed?
3) are the fixes they propose the correct ones?

Anything we *should* fix, put on your todo list.
Anything we should skip, tell me about now.
```