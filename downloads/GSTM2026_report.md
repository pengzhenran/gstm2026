# GSTM 2026 调研报告

GRACE / GRACE-FO Science Team Meeting 2026
GFZ Helmholtz Centre for Geosciences, Potsdam
2026-10-13 — 10-15，混合形式

数据截至 2026-10-28。材料来自会议官网、Copernicus Meeting Organizer 的公开页面，以及 95 篇摘要。引用编号对应 https://doi.org/10.5194/gstm2026-{编号}。

## 摘要

GSTM 2026 于 2026 年 10 月 13—15 日在波茨坦 GFZ 举行，172 人参加，其中现场 91 人、线上 81 人。95 篇摘要投稿，4 篇撤稿，91 篇进入日程，分 10 个 session。

从摘要内容看，会议的重心集中在四件事：

1. 下一代任务的编队与传感器。22 篇摘要提到 GRACE-C、NGGM 或 MAGIC。GRACE-C 计划 2028 年 12 月发射，已进入总装、集成与测试；NGGM 采用约 70° 倾角；MAGIC 把两者组合成多对编队，目标产品周期 10 天或 5 天。
2. 机器学习进入处理链。7 篇报告把它用于加速度计移植、信号分离、降尺度、缺测重建和 quicklook 质量筛查。多数工作在模型或后处理中加入物理约束，并在重力场层面评估结果。
3. 数据产品业务化。15 篇提到业务化、气候服务或早期预警。Copernicus C3S 的 TWSA/GWSC 服务与 CNES/Magellium 的 SAGSA L2—L4 生产链是两个具体系统。
4. 水文应用。B.4 有 19 篇报告，18 篇谈极端事件。科罗拉多河流域总水储量损失 52.2 km³，约 65% 来自地下水。

## 1. 会议与议程

| 项目 | 数据 |
|---|---|
| 会议 | GRACE/GRACE-FO Science Team Meeting 2026 |
| 地点 | GFZ Helmholtz Centre for Geosciences, Telegrafenberg, Potsdam |
| 日期 | 2026-10-13 — 10-15 |
| 形式 | 混合，现场 91 人、线上 81 人 |
| 投稿 | 95 篇 |
| 撤稿 | 4 篇（会前 3 篇，会中 1 篇） |
| 在册 | 91 篇（76 oral + 15 poster） |
| Session | 10 个 |
| 报告人 | 82 位 |
| 作者规模 | 平均 5.5 位作者/篇 |

| Session | 名称 | 在册 | Oral | Poster |
|---|---|---:|---:|---:|
| A.1 | GRACE-FO Project Status | 9 | 9 | 0 |
| A.2 | Analysis Techniques & Inter-comparisons | 20 | 17 | 3 |
| A.3 | GRACE-C, NGGM, and Future Missions | 18 | 13 | 5 |
| A.4 | The Mean Earth Gravity Field | 1 | 1 | 0 |
| B.1 | Solid Earth Sciences | 2 | 2 | 0 |
| B.2 | Cryosphere | 8 | 7 | 1 |
| B.3 | Oceanography | 6 | 5 | 1 |
| B.4 | Hydrology | 19 | 16 | 3 |
| B.5 | Multidisciplinary Science | 6 | 5 | 1 |
| B.6 | Operational Use | 2 | 1 | 1 |

会议三天单轨。周二 24 篇，周三 41 篇（含 15 篇 poster），周四 26 篇。A.2 和 B.4 的报告数最多，A.3 的时长为 3 小时 09 分。A.4 只有 1 篇，B.1 只有 2 篇。

官网概述写 75 oral + 15 poster；按 session 页面逐条统计为 76 + 15。差异可能来自现场调整或摘要类型变更，本报告采用 session 页面的实际列表。

## 2. 下一代任务

A.3 共 18 篇报告，内容覆盖任务状态、编队设计、传感器、模拟和应用预演。

GRACE-C 是 NASA 与 DLR 的联合任务，计划 2028 年 12 月发射。#88 报告了总装、集成与测试进展：激光测距干涉仪、加速度计、GNSS 接收机和星相机正在集成，SDS 同步评估测量系统性能并准备 L1/L2 算法。

NGGM 是 ESA 的下一代任务，采用约 70° 倾角。#18 指出，倾斜轨道可以增加非极区的采样密度，对中低纬冰川和水文应用有帮助。MAGIC 把极轨 GRACE-C 与倾斜 NGGM 组合成多对编队，目标是缩短产品周期、改善时空采样。

与性能有关的数字：

- NGGM 在 220 km 和 165 km 尺度上可以恢复约 80% 和 65% 的 10 天 TWS 信号，相对 GRACE-C 提升 15—20%（#56）。
- 光钟频比测距需要 10⁻¹⁹—10⁻²⁰ 的时钟噪声，才能可靠恢复时变重力场；Pendulum、Helix 等多向编队优于 GRACE-like 沿轨构型（#49）。
- 小卫星 LRI 的目标是 8U 以下、6 kg 以下、20 W 以下，测距精度优于 1 µm/√Hz（#81）。
- GRATTIS 计划 2027 年 2 月飞行，验证 S-GRS 简化引力参考传感器，目标加速度噪声不高于 10⁻¹⁰ m/s²/√Hz（#83）。

会上还讨论了冷原子干涉加速度计（#1）、光机惯性传感器 ODIN/THOR（#40）、加速度计移植（#12）和小卫星编队。A.3 的 18 篇报告基本覆盖了这些选项，但成本、校准与验证、以及多对编队的业务化运行仍是开放问题。

## 3. 机器学习

7 篇摘要明确使用机器学习或深度学习（#4、#12、#34、#50、#54、#66、#78）。任务可以分成四类：

| 任务 | 代表 | 方法 |
|---|---|---|
| 加速度计移植 | #12 | MLP、LSTM、BiLSTM |
| 信号分离 | #66 | 深度网络联合预测水、冰和噪声 |
| 降尺度与补缺 | #4、#34、#78 | U-Net、随机森林、dual-stream |
| quicklook 质量筛查 | #54 | 机器学习分类 |

这些工作的共同点：

- 在模型或后处理中加入物理约束。例如 #78 的月度分支施加全球质量收支投影，日度分支用 Student-t 似然处理重尾残差。
- 在重力场层面评估，而不是只看降尺度图像。
- 与已有产品对比，例如 GFZ GravIS、RL07、CNES 10 天解。

#66 把去噪和信号分离合成一步，并与 GravIS 产品对比；#34 用随机森林重建 GRACE 缺测并降到 0.1°；#54 为 GRACE-C 的 3 天 quicklook 做自动筛查。机器学习在这些工作中主要承担反演、校准、补缺和质检，物理模型仍是主体。

## 4. 业务化

15 篇摘要提到业务化、气候服务或早期预警。两个具体系统是 C3S 和 SAGSA。

Copernicus C3S 新增 Terrestrial Water Storage and Groundwater 服务（#97）。产品包括 TWSA 和 GWSC 的 Climate Data Record、数据文档包和不确定性说明，发布在 Climate Data Store。难点在于缺少原位基准时的质量刻画：质量守恒、流域闭合、与水文模型和井水位对比，并逐项说明适用场景。

CNES/Magellium 的 SAGSA 于 2025 年启动，把 L2—L4 生产链自动化，按月或半年更新，分发到 DATATERRA 的 FORMATERRE、THEIA、ODATIS 等数据枢纽（#70、#21）。SAGSA 也在为 MAGIC-NGGM 做运营准备。

更新周期在缩短：

- 月产品：GRACE/GRACE-FO L2。
- 10 天产品：CNES L2/L3（#20）。
- 日产品：GFZ Kalman 滤波（#77）。
- 3 天：GRACE-C quicklook（#54）。

SAGSA L3 的全球大气质量改正使 2016—2026 海平面收支残差减少约 2 mm（#21）。业务化之后，用户更关心时延、可追溯性、版本更新和责任边界，精度只是其中一项。

## 5. 水文

B.4 有 19 篇报告，是最大的应用 session。18 篇摘要谈极端事件：干旱 9 篇、洪水/湿极端 13 篇、地下水 12 篇。

科罗拉多河流域：

- 2020—2022 干旱期间，上游地下水损失 17.5 ± 3.5 km³，高于下游的 9.4 ± 6.5 km³（#58）。
- 全流域总水储量损失 52.2 km³，约 65% 来自地下水（#92）。
- Rio Grande—Bravo 的地下水消耗为 2.7 km³/yr；52% 的直接人为用水不可持续；农业占直接消耗的 87%（#92）。

方法上的变化：

- 14,071 个全球湖泊逐月重建（1992-10—2026-04）；65% 的 3° mascon 受湖泊水量影响（#46）。
- 10 天 GRACE-DSI 能识别 2010—11 拉尼娜和 2022 年法国干旱（#20）。
- 日尺度 25 km 降尺度产品用 22 年大气河和 104 次热带气旋事件验证（#78）。
- stacked L1B 把 TWS 趋势解析到约 12,500 km²，并在 40 个区域把趋势归因到灌溉、地下水开采、毁林和水库蓄水（#87）。
- NGGM/MAGIC 的 5 天模拟产品开始用于极端事件监测（#4、#56、#69）。

数据同化方面，DANSk-LSM 项目把 GRACE/GRACE-FO TWS、土壤湿度和地表水数据同化到陆面模型，在 Brahmaputra、Danube、Mississippi 等流域评估干旱和洪水演变（#27）。

## 6. 数据产品

18 篇摘要提到再处理、新版本或新产品。

- GFZ RL07：2026 年第四季度发布。重做随机模型、观测相对 weighting，并把非潮汐背景模型误差协方差纳入解算（#23）。
- COM-TG：把四家分析中心的产品放在统一反演框架里融合；用海岸线/接地线分辨率改进处理陆海信号归属；对权重选择不敏感（#74）。
- Hawk L1C：公开 KBRR 残差、视线重力差、法方程和校准加速度计，覆盖 2002—2026，即将上架 Zenodo；L1B 到 L2 的链条可以复现（#68）。
- COST-G：法方程层面的组合新选项（#25）。
- CNES 10 天解：SVD 加 Tikhonov 正则化，到 degree 90，无空间滤波（#20、#73）。
- GFZ 日解：Kalman 滤波日产品（#77）。
- AOD1B RL07：非潮汐大气/海洋去混叠的新版本与验证（#95、#96、#72）。

当产品差异小于真实信号时，比较产品差异本身成为一项研究内容。再处理、组合、不确定性传播和版本说明，直接影响气候服务是否采用这些产品。

## 7. 冰冻圈与其他

B.2 有 8 篇报告。2019—2024 年南极冰盖质量损失放缓，容易被误读为趋势反转。#7 把原因指向热带暖池：持续增温激发向极传播的罗斯贝波列，在东南极上空形成高压异常，带来更多降水。这轮增重与 2004—2007 年的事件在量级和持续时间上接近，属于表面物质平衡的年际变化。

格陵兰在 2012 年后因连续冷夏出现损失放缓，但 2002—2026 年平均损失仍有 245 ± 47 Gt/yr；全球冰川 296 ± 30 Gt/yr，加速度 6 ± 2 Gt/yr²（#57）。冰盖没有加速，不等于海平面风险下降；年际变化会掩盖十年尺度趋势。

其他 session：

- B.3 海洋 6 篇：全球海洋质量 1993—2023（#59）、冰川/冰盖对海平面的贡献（#57）、OBP 与 ECCO 的残差诊断（#2）、AMOC 监测（#37）、海底压力记录仪（#41）。
- B.5 多学科 6 篇：SAGSA L3（#21）、低阶时变重力与 TRF 联合反演（#26）、GRACE 作为非潮汐形变（#29）、SLR/DORIS 月解（#50）、JPL TRF 同化（#60）、RO 用于天气预报（#48）。
- B.1 固体地球 2 篇：GIA 的非均匀地幔黏度（#14）和潮汐—十年尺度地幔流变（#85）。
- A.4 平均重力场 1 篇：GOCO2025s（#22）。

## 8. 方法与限制

材料来源：

1. 会议官网 https://www.gstm-2026.eu/ ：概述、参会统计、日程、视觉素材。
2. Copernicus Meeting Organizer https://meetingorganizer.copernicus.org/GSTM2026/ ：10 个 session 页面、95 篇摘要、作者与单位。
3. DOI：https://doi.org/10.5194/gstm2026-{n}。

处理流程：

1. 抓取 10 个 session 页面，解析 session 名称、时间、场地、报告列表、类型和撤稿标记。
2. 抓取 95 篇摘要页面，解析标题、作者、单位、全文、引用格式和 DOI。
3. 对标题和摘要全文做关键词匹配，标注主题，再由人工复核。
4. 解析作者单位，统计国家和机构；24 条无法解析到国家的单位被排除。
5. 用 Natural Earth 110m 数据按 1.15° 网格生成地图点阵。

计数口径：

- 主题计数是提到该主题的论文数，多标签，不互斥。
- 国家计数按论文涉及该国的单位计，一篇可以计多国。
- 机构计数按论文涉及该机构计。
- 82 位报告人按 session 页面的 presenting author 去重；未标注时取第一作者。

限制：

- 摘要全文由 HTML 转文本，公式、上下标和特殊符号可能丢失。
- 4 篇撤稿摘要保留标题和作者，正文为空。
- 关键词匹配会漏掉同义表达，也会纳入泛化词；主题数用于相对比较，不作为绝对分类。
- 参会国家数与摘要单位国家数不同：前者是 172 位参会者，后者是 91 篇摘要的作者单位。

## 9. 值得读的论文

| 编号 | 标题 | 内容 |
|---|---|---|
| 88 | GRACE-C Implementation Status | 2028-12 发射；AIT 状态与科学性能 |
| 56 | Sub-monthly TWS from GRACE-C and NGGM | MAGIC 的 10 天 TWS 能力；15—20% 提升 |
| 49 | Time-Variable Gravity from Clock Frequency Comparisons | 光钟与多向编队 |
| 81 | SmallSat-compatible LRI | 低成本多对星座的关键载荷 |
| 97 | C3S Operational TWSA/GWSC | 重力数据进入气候服务 |
| 70 | SAGSA L2—L4 | 自动生产链与 MAGIC-NGGM 运营准备 |
| 68 | Hawk L1C 2002—2026 | 可复现的全链条中间量 |
| 46 | 14,071 Global Lakes | 湖泊对 mascon 的系统性影响 |
| 58 / 92 | Colorado groundwater | 地下水损失的具体数字 |
| 7 | Tropical warm pool and Antarctic mass loss | 南极增重的机制解释 |

## 结语

2026 年第四季度的 RL07、2027 年 2 月的 GRATTIS、2028 年 12 月的 GRACE-C，是接下来三个明确的节点。它们会决定 2030 年代重力观测的基线。

### 附录：主要统计

- 在册 91 = 76 oral + 15 poster；投稿 95，撤稿 4。
- Session：A.1 9 / A.2 20 / A.3 18 / A.4 1 / B.1 2 / B.2 8 / B.3 6 / B.4 19 / B.5 6 / B.6 2。
- 主题提及：Future missions 28；AI/ML 7；Hydrology & extremes 47；Cryosphere 26；Ocean & sea level 38；Solid Earth 10；Operational 15；Reference frames 16；Data products 68。
- 国家（论文数）：US 44、DE 34、FR 12、NL 7、AT 5、DK/FI/CH 4、CN/UK 3、IT/PL/JP/IN 2、SE/LT/CZ/CD/KR/AU/BE 1。
- 机构（论文数）：GFZ 19、NASA JPL 17、Toulouse/CNES 11、UT Austin/CSR 8、TU Delft 6、Magellium 6、NASA GSFC 5。
