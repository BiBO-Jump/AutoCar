/* ==========================================================
   整车五大域 · 域控详情页 - 九键车载学习平台
   车身 / 动力 / 底盘 / 智驾 / 座舱
   智驾域附 2026 智能驾驶市场格局资料整理
   ========================================================== */

const DOMAIN_INFO = {
    body: {
        id: 'body', icon: '🚘', name: '车身域控', en: 'Body Domain',
        color: 'from-cyan-400 to-cyan-600',
        slogan: '车窗 / 门锁 / 空调 / 灯光 / 座椅 —— 功能逻辑密集、用例量最大的入门域',
        components: ['BCM 车身控制器', '车窗 / 天窗', '门锁 / 防盗', '空调 HVAC', '灯光控制', '座椅调节', '雨刮洗涤', 'PEPS 无钥匙进入', '网关联动'],
        tests: [
            { icon: '📋', name: '功能逻辑测试', desc: '按需求文档逐条验证车窗防夹、灯光延时、空调联动等功能逻辑' },
            { icon: '🔍', name: 'CANoe Trace 分析', desc: '抓取 CAN/LIN 报文，核对信号值与周期是否符合 DBC 定义' },
            { icon: '🔌', name: 'UDS 诊断读写', desc: 'DID 读写、故障码触发与清除、例程控制 Routine Control' },
            { icon: '🌙', name: '休眠唤醒测试', desc: '验证整车低功耗休眠与总线唤醒时序是否达标' }
        ],
        related: [
            { page: 'canoe-simulator', icon: '🖥️', name: 'CANoe 模拟器', desc: 'Trace 窗口 + Graphics 信号曲线实操' },
            { page: 'uds-simulator',   icon: '🔌',  name: 'UDS 诊断模拟器', desc: 'Service 10/27/22/19 诊断流程练习' }
        ]
    },
    powertrain: {
        id: 'powertrain', icon: '⚡', name: '动力域控', en: 'Powertrain Domain',
        color: 'from-amber-400 to-amber-600',
        slogan: '电机 / BMS / 高压系统 —— 新能源三电核心，安全等级要求最高',
        components: ['驱动电机 / MCU', 'BMS 电池管理', 'OBC 车载充电机', 'DC-DC 变换器', '高压互锁 HVIL', 'PDU 高压配电', '变速箱 TCU', 'VCU 整车控制'],
        tests: [
            { icon: '⚡', name: '高压安全测试', desc: '上电/下电时序、互锁回路、绝缘监测与高压故障注入' },
            { icon: '🔋', name: 'SOC / SOH 验证', desc: '充放电工况下电量估算精度与均衡策略验证' },
            { icon: '🔁', name: 'OBC 充电 / 刷写', desc: '充电流程状态机、充电机通信与固件刷写流程测试' },
            { icon: '🌡️', name: '热管理联调', desc: '电池冷却/加热回路与整车热管理策略联动验证' }
        ],
        related: [
            { page: 'uds-simulator',   icon: '🔌', name: 'UDS 诊断模拟器', desc: '刷写与诊断会话流程是动力域测试基础' },
            { page: 'canoe-simulator', icon: '🖥️', name: 'CANoe 模拟器', desc: '总线报文监控与故障注入思路相通' }
        ]
    },
    chassis: {
        id: 'chassis', icon: '🛞', name: '底盘域控', en: 'Chassis Domain',
        color: 'from-red-400 to-red-600',
        slogan: 'ABS/ESC · EPS 转向 · 线控制动 —— 功能安全 ASIL-D 等级的主战场',
        components: ['ABS 防抱死', 'ESC 车身稳定', 'EPS 电动助力转向', 'EPB 电子驻车', '线控制动 One-Box', '悬架控制 CDC/空悬', '后轮转向', '扭矩矢量分配'],
        tests: [
            { icon: '🔌', name: '总线通信测试', desc: '底盘 CAN/FlexRay 报文周期、信号一致性与丢帧监控' },
            { icon: '🎛️', name: '横纵向控制联调', desc: '制动/转向执行器与智驾域指令的响应联调' },
            { icon: '🖥️', name: 'HIL 仿真测试', desc: 'dSPACE/NI 台架注入工况，验证控制器实时响应' },
            { icon: '🛡️', name: '功能安全用例', desc: '按 ISO 26262 ASIL 等级执行故障注入与安全机制验证' }
        ],
        related: [
            { page: 'canoe-simulator', icon: '🖥️', name: 'CANoe 模拟器', desc: '总线监控与 Trace 分析通用方法' },
            { page: 'uds-simulator',   icon: '🔌', name: 'UDS 诊断模拟器', desc: '底盘控制器诊断与故障码练习' }
        ]
    },
    adas: {
        id: 'adas', icon: '🤖', name: '智驾域控', en: 'ADAS Domain',
        color: 'from-violet-400 to-violet-600',
        slogan: '感知 · 规划 · 控制 · HAD · APA —— 行业最卷、人才缺口最大的域',
        components: ['前视/环视摄像头', '毫米波雷达', '激光雷达 LiDAR', '超声波雷达', '高精定位 IMU/GNSS', '智驾域控制器', '行泊一体算法', 'DMS 驾驶员监测'],
        tests: [
            { icon: '🛣️', name: '场景库验证', desc: '按场景库（跟车/变道/横穿/泊车）批量回归验证算法表现' },
            { icon: '🔗', name: '算法联调', desc: '感知-融合-规划-控制全链路联调与问题定位' },
            { icon: '🎯', name: '传感器标定', desc: '摄像头内参/外参、雷达安装角、LiDAR 联合标定' },
            { icon: '📏', name: '真值系统对比', desc: '与 RTK/激光真值设备对比，量化感知与定位误差' }
        ],
        related: [
            { page: 'adas-viz',          icon: '🚘', name: '智驾可视化仪表盘', desc: '16 项行车/泊车功能动画演示与传感器依赖' },
            { page: 'parking-simulator', icon: '🅿️', name: '泊车逻辑控制模拟器', desc: '3D 泊车动画 + 状态机 + 信号曲线' }
        ]
    },
    cockpit: {
        id: 'cockpit', icon: '🎯', name: '座舱域控', en: 'Cockpit Domain',
        color: 'from-emerald-400 to-emerald-600',
        slogan: '仪表 · 中控 · HUD · T-BOX · IVI —— 用户感知最强、迭代最快的域',
        components: ['液晶仪表 Cluster', '中控 IVI 主机', 'HUD 抬头显示', 'T-BOX 车联网', '语音交互', 'DMS 驾驶员监测', '多屏联动', '座舱域控制器'],
        tests: [
            { icon: '🖥️', name: 'UI / 显示测试', desc: 'HMI 界面元素、多语言、分辨率适配与显示异常排查' },
            { icon: '🗣️', name: '语音交互测试', desc: '唤醒率、识别率、多轮对话与噪声场景验证' },
            { icon: '📡', name: '车联网联调', desc: 'T-BOX 与云平台、手机 App 远控功能联调' },
            { icon: '🔗', name: '多屏联动测试', desc: '仪表-中控-HUD 信息同步与跨屏交互验证' }
        ],
        related: [
            { page: 'uds-simulator',   icon: '🔌', name: 'UDS 诊断模拟器', desc: '座舱控制器诊断与会话流程' },
            { page: 'canoe-simulator', icon: '🖥️', name: 'CANoe 模拟器', desc: '座舱与整车总线通信监控' }
        ]
    }
};

function renderDomainPage() {
    const d = DOMAIN_INFO[state.domain] || DOMAIN_INFO.adas;
    document.getElementById('main-content').innerHTML = `
        <div class="fade-in">
            <button onclick="navigate('home')" class="text-cyan-400 hover:text-cyan-300 mb-4 flex items-center text-sm">← 返回首页</button>

            <div class="gradient-bg rounded-3xl p-5 sm:p-8 mb-6 text-white relative overflow-hidden">
                <div class="absolute -top-20 -right-20 w-60 h-60 bg-cyan-400/10 rounded-full"></div>
                <div class="absolute -bottom-16 -left-16 w-52 h-52 bg-emerald-400/10 rounded-full"></div>
                <div class="relative z-10">
                    <div class="flex items-center gap-3 mb-2">
                        <div class="w-12 h-12 bg-white/20 backdrop-blur rounded-xl flex items-center justify-center text-2xl">${d.icon}</div>
                        <div>
                            <h1 class="text-xl sm:text-2xl md:text-3xl font-bold flex items-center gap-2 flex-wrap">
                                ${d.name}
                                <span class="text-[10px] sm:text-xs font-mono font-normal bg-white/15 border border-white/25 rounded-full px-2.5 py-0.5">${d.en}</span>
                            </h1>
                            <p class="text-cyan-100 text-xs sm:text-sm mt-1">${d.slogan}</p>
                        </div>
                    </div>
                </div>
            </div>

            <div class="grid md:grid-cols-2 gap-4 mb-6">
                <div class="card p-4 sm:p-5">
                    <div class="flex items-center gap-2 mb-3">
                        <span class="w-1 h-5 bg-gradient-to-b ${d.color} rounded"></span>
                        <h3 class="font-bold text-white text-sm sm:text-base">🧩 域内组成</h3>
                    </div>
                    <div class="flex flex-wrap gap-1.5">
                        ${d.components.map(c => `<span class="badge">${c}</span>`).join('')}
                    </div>
                </div>
                <div class="card p-4 sm:p-5">
                    <div class="flex items-center gap-2 mb-3">
                        <span class="w-1 h-5 bg-gradient-to-b ${d.color} rounded"></span>
                        <h3 class="font-bold text-white text-sm sm:text-base">🧪 测试重点</h3>
                    </div>
                    <div class="space-y-2.5">
                        ${d.tests.map(t => `
                            <div class="flex items-start gap-2.5">
                                <span class="text-base flex-shrink-0">${t.icon}</span>
                                <div>
                                    <div class="text-xs font-bold text-slate-200">${t.name}</div>
                                    <div class="text-[11px] text-slate-400 leading-relaxed">${t.desc}</div>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </div>
            </div>

            <div class="card p-4 sm:p-5 mb-6">
                <div class="flex items-center gap-2 mb-3">
                    <span class="w-1 h-5 bg-gradient-to-b ${d.color} rounded"></span>
                    <h3 class="font-bold text-white text-sm sm:text-base">🖥️ 平台实操入口</h3>
                    <span class="text-[10px] text-slate-500 hidden sm:inline">教学模拟 · 不连接真实硬件</span>
                </div>
                <div class="grid sm:grid-cols-2 gap-3">
                    ${d.related.map(r => `
                        <button onclick="navigate('${r.page}')"
                                class="text-left bg-slate-800/60 border border-cyan-500/10 hover:border-cyan-500/50 rounded-xl p-4 transition-all group">
                            <div class="flex items-center gap-2 mb-1">
                                <span class="text-xl">${r.icon}</span>
                                <span class="font-bold text-white text-sm">${r.name}</span>
                                <span class="text-[10px] text-cyan-400 ml-auto opacity-0 group-hover:opacity-100 transition-all">进入 →</span>
                            </div>
                            <div class="text-[11px] text-slate-400">${r.desc}</div>
                        </button>
                    `).join('')}
                </div>
            </div>

            ${d.id === 'adas' ? renderAdasMarket() : `
                <div class="border-2 border-dashed border-slate-700/60 rounded-2xl p-5 text-center mb-6">
                    <div class="text-2xl mb-2">📚</div>
                    <p class="text-xs sm:text-sm text-slate-400 leading-relaxed max-w-lg mx-auto">
                        该域的深度学习资料持续整理中。可先通过上方实操模块熟悉总线与诊断基础 —— 五大域的测试方法论是相通的。
                    </p>
                </div>
            `}
        </div>
    `;
}

/* ===============================================
   📊 智能驾驶市场格局（2026 资料整理）
   数据整理自公开行业资料，供学习参考
   =============================================== */
const ADAS_MARKET = {
    tiers: [
        {
            name: '一梯队', sub: '旗舰 L2+ · 准 L3 能力', color: 'from-cyan-400 to-cyan-600', badge: 'badge-cyan',
            systems: [
                { vendor: '华为引望', sys: '乾昆 ADS 4.0/5.0', desc: '全域无图 NOA，多传感器深度融合标杆，高速场景通过 L3 级专项认证', cars: '问界 M9 · 智界 R7 · 享界 S9 · 阿维塔 12' },
                { vendor: '小鹏自研', sys: 'XNGP AI 天玑版', desc: '端到端大模型全栈自研，全国无图 NOA，OTA 迭代速度行业领先', cars: '小鹏 X9 · P7i · G9 高配' },
                { vendor: '理想自研', sys: 'AD Max 马赫智驾', desc: '自研马赫 M100 车规芯片，「快直觉+慢推理」双架构，平顺性顶尖', cars: '理想 L9/L8 Max · MEGA Max' },
                { vendor: '特斯拉自研', sys: 'FSD V14 中国适配版', desc: '纯视觉端到端路线，全球海量数据迭代，城区博弈能力接近人类', cars: 'Model 3/Y 长续航版' },
                { vendor: 'Momenta', sys: 'Mpilot R7 世界模型', desc: 'L4 技术降维赋能 L2+，第三方量产覆盖最广，极限场景适配强', cars: '智己 LS9 · 昊铂 HT · 汉 EV 智驾版' }
            ]
        },
        {
            name: '二梯队', sub: '高阶 L2+ · 全域无图 NOA', color: 'from-emerald-400 to-emerald-600', badge: 'badge-green',
            systems: [
                { vendor: '小米自研', sys: 'Xiaomi HAD', desc: '全系硬件满配无差异，融入端到端与视觉语言模型，生态深度联动', cars: '小米 SU7 Ultra/Max · YU7' },
                { vendor: '蔚来自研', sys: 'NAD 2.0 / NOP+', desc: '自研神玑 NX9031 芯片，三激光雷达冗余感知，与换电体系联动', cars: '蔚来 ET7 · ES6 · ET9' },
                { vendor: '比亚迪自研', sys: '天神之眼 A/B', desc: '按车型硬件分级，高阶版全场景覆盖，百万级量产数据闭环', cars: '仰望 U7/U8 · 腾势 N9 · 汉唐高配' },
                { vendor: '吉利自研', sys: '千里浩瀚 H7/H9', desc: '覆盖极氪/银河/领克多品牌，舱驾融合领先，功能下探 15 万级', cars: '极氪 9X · 银河战舰 700 · 领克 07-GT' },
                { vendor: '元戎启行', sys: 'DeepRoute VLA', desc: '无图端到端方案成熟，适配多芯片平台，量产周期短成本优', cars: '魏牌蓝山 · 仰望合作车型' }
            ]
        },
        {
            name: '三梯队', sub: '中高阶 L2 · 双领航普及', color: 'from-violet-400 to-violet-600', badge: 'badge-violet',
            systems: [
                { vendor: '地平线', sys: 'HSD 1200', desc: '征程芯片软硬协同，覆盖城区/高速/泊车，20 万级市占率领先', cars: '奇瑞风云 T9L · 大众 ID. · 长安启源' },
                { vendor: '大疆卓驭', sys: '成行智驾 2.5', desc: '低算力高阶路线，32TOPS 实现城市 NOA，成本控制优异', cars: '红旗 HS6 · 天工 05/06 · 五菱星光' },
                { vendor: '百度', sys: 'Apollo ASD/ANP', desc: 'L4 Robotaxi 技术下沉，城市/高速/泊车全产品矩阵', cars: '极狐阿尔法 S · 埃安 LX Plus' },
                { vendor: '长安自研', sys: '天枢智驾', desc: '自研辅助驾驶体系，量产功能持续扩展，主打主流家用市场', cars: '长安启源 E07 · 深蓝系列' },
                { vendor: '魔视智能', sys: 'Magic Drive 高阶版', desc: '行泊一体方案成熟，乘用+商用双布局，兼容 10+ 芯片平台', cars: '北汽魔方 · 长安欧尚 Z6' }
            ]
        },
        {
            name: '四梯队', sub: '标准/入门 L2 · 基础辅助为主', color: 'from-amber-400 to-amber-600', badge: 'badge-amber',
            systems: [
                { vendor: '地平线', sys: 'HSD 600/Mono', desc: '15 万级普及款功能均衡，入门方案成本最优', cars: '吉利银河 TT · 大众 ID. 入门版' },
                { vendor: '博世', sys: '纵横辅助驾驶系列', desc: '车规级可靠性强，安全标准严苛，合资品牌主流标配', cars: '途观 L Pro · 丰田 bZ4X · 合资高配' },
                { vendor: '采埃孚', sys: 'coASSIST', desc: '底盘控制与智驾深度融合，安全冗余度高，欧系广泛搭载', cars: '标致 508L · 凡尔赛 C5 X · Stellantis' },
                { vendor: 'Mobileye', sys: 'EyeQ4/EyeQ5', desc: '视觉方案成熟稳定，全球通用，入门合资车型主流选择', cars: '合资入门电动车 · 燃油车高配' },
                { vendor: '文远知行', sys: 'WePilot', desc: '端到端辅助驾驶方案，乘用车量产推进中，商用车布局深入', cars: '合作量产车型' }
            ]
        }
    ],
    suppliers: [
        { name: '华为引望', tag: '地大华魔', product: '乾昆 ADS · MDC 计算平台', tech: '昇腾芯片+算法全栈自研，支持 HI 深度定制与标准化零部件两种模式', stat: '累计搭载超 200 万套，国内高端智驾份额领先' },
        { name: '地平线', tag: '地大华魔', product: 'HSD 城区辅助驾驶 · coPILOT', tech: '软硬一体，征程 6P 单颗 560TOPS，开放生态支持深度定制', stat: '定点近 500 款车型，累计装机超 1500 万套，10-25 万价位市占率第一' },
        { name: 'Momenta', tag: '地大华魔', product: 'Mpilot 系列 · R6/R7 大模型', tech: '端到端+强化学习双路线，量产+无人化双线，海量数据闭环迭代', stat: '2025 城市 NOA 第三方份额 61.06% 排名第一，落地 160+ 款车型' },
        { name: '大疆卓驭', tag: '地大华魔', product: '成行智驾 2.5 · ClixPilot', tech: '两段式端到端，32TOPS 低算力实现城市 NOA，海外适配多地区法规', stat: '智驾普惠化核心玩家，低算力高阶技术领先' },
        { name: '百度 Apollo', tag: '开放平台', product: 'Apollo 量产方案 · Apollo Go', tech: '多传感器融合，L4 Robotaxi 累计安全里程超 3.3 亿公里，技术下沉 ADAS', stat: '全球自动驾驶专利连续三年第一，L4 商业化规模国内领先' },
        { name: '魔视智能', tag: '乘商并举', product: 'Magic Drive · Magic Parking', tech: '一段式端到端+世界模型全栈自研，新芯片适配可缩短至两周', stat: '92+ 款车型定点，累计交付超 330 万套，商用车 ADAS 份额前列' }
    ],
    tier1: [
        { name: '博世 Bosch', product: '纵横辅助驾驶 · Ally.Move 平台', desc: '模块化可扩展，高端基于双 Orin-X，全球传统 ADAS 份额龙头' },
        { name: '采埃孚 ZF', product: 'coASSIST/coDRIVE/coPILOT · ProAI', desc: '底盘与智驾深度融合，高端 coPILOT 与地平线联合研发' },
        { name: '大陆 Continental', product: 'ADAS 域控 · 5R1V 方案 · HPC', desc: '传感器+计算+软件全栈，全球 ADAS 传感器与域控核心供应商' },
        { name: '安波福 Aptiv', product: 'ADAS 方案 · 卫星架构计算平台', desc: '软硬件解耦开放架构，全球智能汽车电子架构龙头' }
    ],
    chips: [
        { name: '英伟达 NVIDIA', product: 'Orin X · Thor 雷神', desc: '行业标杆高算力平台，软件生态完善，全球高端智驾芯片市占率第一' },
        { name: '地平线', product: '征程 3/5/6（6P 560TOPS）', desc: '国产替代龙头，软硬一体优化能效比高，国产智驾芯片出货量第一' },
        { name: '华为昇腾', product: 'MDC610/810 计算平台', desc: '全栈自研与 ADS 算法深度耦合，算力利用率高，高端自研代表' },
        { name: 'Mobileye', product: 'EyeQ4/EyeQ6 系列', desc: '视觉方案龙头，黑盒交付模式成熟，全球入门 ADAS 芯片份额领先' },
        { name: '黑芝麻智能', product: '华山 A1000 系列', desc: '国产高算力车规级芯片，支持多传感器融合，国产第二梯队核心' }
    ],
    trends: [
        { icon: '🧠', title: '端到端大模型全面普及', desc: '从模块化「感知-规划-控制」走向端到端，全国无图 NOA 成高阶标配，摆脱高精地图依赖，头部厂商向世界模型/认知大模型升级' },
        { icon: '⚖️', title: '市场两极分化加剧', desc: '高端拼全场景体验与技术上限，入门拼成本与普及速度，10 万级车型开始标配激光雷达+城市 NOA，智驾快速下沉平民市场' },
        { icon: '🇨🇳', title: '国产替代从可用走向好用', desc: '国产方案商与芯片厂快速崛起，城区 NOA、本土路况适配已反超国际 Tier1，成为市场主流选择' },
        { icon: '🔧', title: '软硬一体成全栈核心竞争力', desc: '芯片+算法全栈自研成头部壁垒，软硬件协同大幅提升效率、降低成本，纯软件算法方案商空间被压缩' },
        { icon: '🚦', title: 'L3 落地试点加速', desc: '北京、重庆等多地开放 L3 试点，华为、长安等通过 L3 专项认证，2027 年 L3 强制国标实施后将进入规模化普及阶段' }
    ]
};

function renderAdasMarket() {
    const m = ADAS_MARKET;
    return `
        <div class="mt-2">
            <div class="flex items-center gap-3 mb-1">
                <span class="w-1 h-6 bg-cyan-500 rounded"></span>
                <h2 class="text-lg sm:text-xl font-bold text-slate-100">📊 智能驾驶市场格局</h2>
            </div>
            <p class="text-xs sm:text-sm text-slate-400 mb-4 ml-4">整理自公开行业资料（2026），仅供学习参考。当前民用量产系统官方合规定级均为 L2/L2+ 级，驾驶员始终为驾驶责任主体。</p>

            <!-- 梯队划分 -->
            <div class="grid md:grid-cols-2 gap-4 mb-6">
                ${m.tiers.map((t, ti) => `
                    <div class="card overflow-hidden">
                        <div class="bg-gradient-to-r ${t.color} px-4 py-2.5 flex items-center justify-between text-white">
                            <span class="font-bold text-sm">${t.name}</span>
                            <span class="text-[11px] text-white/85">${t.sub}</span>
                        </div>
                        <div class="p-3 space-y-2.5">
                            ${t.systems.map(s => `
                                <div class="rounded-lg border border-slate-700/60 p-2.5 hover:border-cyan-500/40 transition-colors">
                                    <div class="flex items-center gap-2 flex-wrap">
                                        <span class="font-semibold text-slate-100 text-sm">${s.vendor}</span>
                                        <span class="badge ${t.badge} text-[10px]">${s.sys}</span>
                                    </div>
                                    <p class="text-[11px] text-slate-400 mt-1 leading-relaxed">${s.desc}</p>
                                    <p class="text-[10px] text-slate-500 mt-1">🚗 ${s.cars}</p>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                `).join('')}
            </div>

            <!-- 头部第三方方案商 -->
            <div class="flex items-center gap-3 mb-3">
                <span class="w-1 h-6 bg-emerald-500 rounded"></span>
                <h3 class="text-base sm:text-lg font-bold text-slate-100">头部第三方方案商 ·「地大华魔」+ 百度</h3>
            </div>
            <div class="grid md:grid-cols-2 xl:grid-cols-3 gap-4 mb-6">
                ${m.suppliers.map(s => `
                    <div class="card p-4">
                        <div class="flex items-center gap-2 mb-2">
                            <span class="font-bold text-slate-100 text-sm">${s.name}</span>
                            <span class="badge badge-slate text-[10px]">${s.tag}</span>
                        </div>
                        <div class="text-[11px] text-cyan-400 font-medium mb-1.5">${s.product}</div>
                        <p class="text-[11px] text-slate-400 leading-relaxed mb-2">${s.tech}</p>
                        <div class="text-[10px] text-emerald-400/90 border-t border-slate-700/50 pt-2">📈 ${s.stat}</div>
                    </div>
                `).join('')}
            </div>

            <!-- 国际 Tier1 + 芯片 -->
            <div class="grid lg:grid-cols-2 gap-4 mb-6">
                <div class="card p-4">
                    <div class="flex items-center gap-2 mb-3">
                        <span class="w-1 h-5 bg-violet-500 rounded"></span>
                        <h3 class="font-bold text-slate-100 text-sm">🌐 国际传统 Tier1</h3>
                    </div>
                    <div class="space-y-3">
                        ${m.tier1.map(t => `
                            <div class="border-b border-slate-700/50 last:border-0 pb-2.5 last:pb-0">
                                <div class="flex items-center gap-2 flex-wrap">
                                    <span class="font-semibold text-slate-200 text-xs">${t.name}</span>
                                    <span class="text-[10px] text-violet-400">${t.product}</span>
                                </div>
                                <p class="text-[11px] text-slate-400 mt-0.5">${t.desc}</p>
                            </div>
                        `).join('')}
                    </div>
                </div>
                <div class="card p-4">
                    <div class="flex items-center gap-2 mb-3">
                        <span class="w-1 h-5 bg-amber-500 rounded"></span>
                        <h3 class="font-bold text-slate-100 text-sm">🧩 底层芯片 / 感知供应商</h3>
                    </div>
                    <div class="space-y-3">
                        ${m.chips.map(c => `
                            <div class="border-b border-slate-700/50 last:border-0 pb-2.5 last:pb-0">
                                <div class="flex items-center gap-2 flex-wrap">
                                    <span class="font-semibold text-slate-200 text-xs">${c.name}</span>
                                    <span class="text-[10px] text-amber-400">${c.product}</span>
                                </div>
                                <p class="text-[11px] text-slate-400 mt-0.5">${c.desc}</p>
                            </div>
                        `).join('')}
                    </div>
                </div>
            </div>

            <!-- 2026 趋势 -->
            <div class="flex items-center gap-3 mb-3">
                <span class="w-1 h-6 bg-pink-500 rounded"></span>
                <h3 class="text-base sm:text-lg font-bold text-slate-100">🚀 2026 行业核心趋势</h3>
            </div>
            <div class="grid sm:grid-cols-2 xl:grid-cols-5 gap-3">
                ${m.trends.map(t => `
                    <div class="card p-4">
                        <div class="text-2xl mb-2">${t.icon}</div>
                        <div class="font-bold text-slate-100 text-xs mb-1.5">${t.title}</div>
                        <p class="text-[11px] text-slate-400 leading-relaxed">${t.desc}</p>
                    </div>
                `).join('')}
            </div>
        </div>
    `;
}
