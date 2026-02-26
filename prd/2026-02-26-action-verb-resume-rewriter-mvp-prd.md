# Action Verb Resume Rewriter - MVP PRD

## 1. 产品定位
- 产品名称: `Action Verb Resume Rewriter`
- 一句话: 把“普通简历描述”一键改成“动词开头、可量化、ATS友好”的表达。
- 目标市场: 英文简历求职用户（优先美国市场）

## 2. 背景与机会
- 关键词簇显示高商业意图集中在:
  - `action verbs for resume`
  - `resume action verbs`
  - `action verb examples`
- 用户核心痛点:
  - 不知道用什么强动词替代弱表达（如 `responsible for`, `helped`, `did`）
  - 句子不够成果导向，ATS 可读性弱
- 机会判断:
  - AI 改写与同义替换能力与痛点高度匹配
  - 可先用低数据成本 MVP 验证转化

## 3. 目标与非目标
## 3.1 MVP 目标
1. 用户在 30 秒内完成首次改写并获得可复制结果。
2. 验证用户是否愿意持续使用“简历描述改写”能力。
3. 建立最小转化闭环: 流量 -> 改写 -> 复制 -> 留资。

## 3.2 非目标
1. 不做整份简历上传解析（PDF/DOCX）。
2. 不做 K12 教学资源（worksheet/tracing/clipart）。
3. 不做多语言与复杂账号体系。

## 4. 目标用户与使用场景
## 4.1 目标用户
- 在校生/应届生
- 1-8 年经验职场人
- 转岗或跳槽用户

## 4.2 关键场景
1. 用户把弱表述粘贴进输入框，快速得到 3 个更强版本。
2. 用户按目标岗位选择语气（Leadership/Execution/Impact）得到更匹配措辞。
3. 用户检测动词重复并替换，避免整份简历词汇单调。

## 5. 功能范围
## 5.1 P0（MVP 必做）
1. `Bullet Rewriter`
- 输入: 原始 bullet point（必填）
- 可选: 岗位类型、资历等级、语气偏好
- 输出: 3 条改写结果（不同语气）

2. `Weak Verb Detector`
- 自动识别弱动词/弱短语
- 给出 3-5 个替换建议

3. `Repetition Checker`
- 检测多条 bullet 的重复动词
- 输出替代表达

4. `Copy + Local Save`
- 一键复制单条结果
- 本地保存最近 5 次改写（浏览器本地）

5. `SEO 基础页`
- `/action-verbs-for-resume`
- `/resume-action-verbs`
- `/action-verb-examples`

## 5.2 P1（延后）
1. 批量改写整段经历
2. PDF/DOCX 导出
3. 用户登录与历史版本管理
4. 岗位模板包（PM/Sales/Engineer/Marketing）

## 6. 用户流程（MVP）
1. 用户通过关键词页进入站点。
2. 在工具区输入原始简历句子并选择岗位/语气（可选）。
3. 点击 `Rewrite`，系统返回 3 条结果。
4. 用户复制结果并继续下一条。
5. 在第 2-3 次改写后触发留资弹窗（获取动词包）。

## 7. AI 逻辑与约束
## 7.1 生成目标
- 输出“强动词开头 + 成果导向 + ATS可读”的英文 bullet。

## 7.2 强约束规则
1. 不捏造数据、业绩或职责。
2. 当原文无量化信息时，只给量化建议模板，不直接编数字。
3. 保持语法正确、可直接复制使用。
4. 优先保留用户原始事实语义，避免改写过度失真。

## 7.3 输出结构（建议 JSON）
- `tone`
- `action_verb`
- `rewritten_bullet`
- `why_better`
- `quantification_hint`

## 8. 内容与SEO策略（MVP）
## 8.1 核心页面
1. 首页: 即时改写工具 + 核心价值主张
2. 工具页: 单条改写与复制
3. 列表页: 分类别 action verbs（leadership/analysis/sales/operations）
4. 示例页: before/after 改写案例

## 8.2 初始关键词映射
1. 主词: `action verbs for resume`
2. 次词: `resume action verbs`
3. 长尾: `action verb examples for resume`, `power verbs for resume`

## 9. 指标与验收
## 9.1 北极星指标
- 改写结果复制率（Copy Rate）

## 9.2 MVP 指标
1. 工具启动率 >= 30%
2. 改写完成率 >= 65%
3. 复制率 >= 40%
4. 留资率 >= 8%
5. 7日回访率 >= 12%

## 9.3 验收标准
1. P0 功能全部可用，无阻断错误。
2. 移动端 375px 正常可用。
3. 关键事件埋点可查询（rewrite/copy/lead_submit）。

## 10. 事件埋点（MVP 最小集）
- `page_view`
- `rewrite_submit`
- `rewrite_success`
- `rewrite_fail`
- `copy_click`
- `lead_popup_view`
- `lead_submit`

## 11. 技术方案（轻量）
- 前端: Next.js（SEO友好）
- AI: GPT-4o-mini 级别模型（低成本高频调用）
- 存储:
  - 匿名使用日志（事件）
  - 本地保存（localStorage）
- 交付优先级: 快速上线 > 完整工程化

## 12. 商业化路径
1. 阶段1: 留资（动词包/改写模板邮件）
2. 阶段2: Freemium（免费每日限次 + Pro无限）
3. 阶段3: 职业服务合作（简历优化服务导流）

## 13. 项目计划（2周）
1. 第1-3天: Prompt与规则层、最小UI
2. 第4-6天: 改写器/检测器/复制功能
3. 第7-9天: SEO页面与基础内容
4. 第10-12天: 留资弹窗与邮件交付
5. 第13-14天: 上线、监控、首轮迭代

## 14. 风险与应对
1. 风险: 输出夸大或失真  
应对: 规则层拦截 + 提示用户人工确认
2. 风险: 仅一次性使用，留存低  
应对: 连续任务设计（重复检测、岗位模板、邮件序列）
3. 风险: SEO 起量慢  
应对: 先攻高意图词页，持续补充案例页

## 15. 待确认项
1. 品牌名是否使用 `PowerVerb` 还是保持功能名？
2. 首发只做英文界面，还是中英双语？
3. 留资奖励采用“动词包”还是“岗位模板包”？
