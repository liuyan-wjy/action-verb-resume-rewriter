# Search Console 提交前清单 + 站内关键词映射表

## 1) Search Console 提交前清单

### A. 站点级检查
- [ ] GSC 已添加并验证域名属性（Domain Property）。
- [ ] `https://action-verb-resume-rewriter.vercel.app/robots.txt` 可访问。
- [ ] `https://action-verb-resume-rewriter.vercel.app/sitemap.xml` 可访问。
- [ ] `sitemap.xml` 已在 GSC 提交。
- [ ] 首页与核心 SEO 页面均返回 `200`。
- [ ] 非索引页面（`/login` `/account` `/payment/success` `/subscription/success`）为 `noindex`。

### B. 页面级检查
- [ ] 每个 SEO 页面有唯一 title 与 description。
- [ ] 每个 SEO 页面有唯一 H1。
- [ ] 页面 canonical 指向自身。
- [ ] 页面包含合理内链（导向工具页与相关 SEO 页）。
- [ ] 结构化数据无报错（Rich Results Test / Schema Validator）。

### C. 发布后监控
- [ ] 每周看 GSC 的 `Pages` 索引覆盖报告。
- [ ] 每周看 `Performance` 的 `Query` 与 `Page` CTR。
- [ ] 观察是否出现关键词互抢（同 query 多页面竞争）。
- [ ] 对 CTR 低但展现高页面，优先继续改 title/description。

## 2) 站内关键词映射表（当前版本）

| 页面 URL | 主关键词（Primary） | 次关键词（Secondary） | 搜索意图 | 当前标题方向 | 内链策略 |
|---|---|---|---|---|---|
| `/` | action verbs for resume | resume bullet rewriter, resume action verbs, power verbs for resume | 混合意图（信息+工具） | Action Verbs + Free AI Rewriter | 导向工具页、词库页、示例页 |
| `/tool/resume-action-verbs-rewriter` | resume bullet rewriter | ats resume rewriter, rewrite resume bullet | 工具意图 | Free Resume Bullet Rewriter Tool | 回链到词库页与示例页 |
| `/action-verbs-for-resume` | action verbs for resume | power verbs for resume, resume wording | 信息意图（词库） | Power Verbs + Free Rewriter | 导向工具页、`/resume-action-verbs`、`/action-verb-examples` |
| `/resume-action-verbs` | resume action verbs | resume bullet verbs, ats resume language | 信息意图（分角色） | By Role + ATS Guide | 导向工具页、词库页、3个长尾页 |
| `/action-verb-examples` | action verb examples for resume | resume rewrite examples, resume bullet examples | 信息意图（案例） | Before vs After | 导向工具页 |
| `/pricing` | resume rewriter pricing | resume tool credits, resume subscription | 商业意图 | Pricing / Credits / Pro | 导向登录与工具页 |
| `/resume-action-verbs-for-customer-service` | resume action verbs for customer service | customer service resume verbs, customer support resume bullet examples | 长尾信息意图（角色） | Role-specific guide | 导向工具页与核心词库页 |
| `/resume-action-verbs-for-project-manager` | resume action verbs for project manager | project manager resume verbs, project management bullet examples | 长尾信息意图（角色） | Role-specific guide | 导向工具页与核心词库页 |
| `/resume-action-verbs-for-marketing` | resume action verbs for marketing | marketing resume verbs, marketing resume bullet examples | 长尾信息意图（角色） | Role-specific guide | 导向工具页与核心词库页 |

## 3) 关键词映射规则（避免互相抢词）
- 每个核心页面只绑定 1 个主关键词（Primary）。
- 同一主关键词不重复分配给多个页面。
- 次关键词用于补充语义，不与其他页面 primary 冲突。
- 内链锚文本优先使用目标页 primary 的近似词。

## 4) 下一轮建议
- 基于 GSC 数据，继续扩展 3 个长尾页：
  - `/resume-action-verbs-for-sales`
  - `/resume-action-verbs-for-product-manager`
  - `/resume-action-verbs-for-software-engineer`
- 每页绑定独立 primary，避免与现有页面互抢。
