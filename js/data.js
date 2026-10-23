const OFFICIAL_LINKS = {
    vector: { name: 'Vector 官网', url: 'https://www.vector.com/', desc: '全球领先的汽车电子网络工具供应商' },
    bosch: { name: 'Bosch CAN 规范', url: 'https://www.bosch.com/', desc: 'CAN 总线原始发明者，官方技术文档' },
    sae: { name: 'SAE International', url: 'https://www.sae.org/', desc: '汽车工程师学会，标准与技术论文' },
    iso: { name: 'ISO 标准库', url: 'https://www.iso.org/', desc: '国际标准化组织，ISO 14229/11898 等标准' },
    gb: { name: '全国汽车标准化技术委员会', url: 'http://www.catarc.ac.cn/', desc: 'GB/T 新能源汽车测试标准' },
    nvidia: { name: 'NVIDIA 自动驾驶', url: 'https://www.nvidia.com/en-us/autonomous-driving/', desc: 'NVIDIA DRIVE 平台与自动驾驶开发文档' },
    autodesk: { name: 'Autosar 官网', url: 'https://www.autosar.org/', desc: 'AUTOSAR Classic / Adaptive 平台官方' },
    ni: { name: 'NI 官网', url: 'https://www.ni.com/', desc: 'National Instruments，HIL 测试平台' },
    dspace: { name: 'dSPACE 官网', url: 'https://www.dspace.com/', desc: 'dSPACE HIL/SIL 仿真测试平台' },
    cncap: { name: '中汽研 C-NCAP', url: 'https://www.c-ncap.org/', desc: '中国新车评价规程，ADAS 测试标准' },
    ehv: { name: '电动汽车标准', url: 'http://www.evstandards.org/', desc: 'IEC/ISO 电动汽车充电与安全标准' }
};

const RESOURCES = [
    {
        category: '专业标准',
        icon: '📋',
        items: [
            { name: 'ISO 11898 - CAN总线标准', url: 'https://www.iso.org/standard/63647.html', desc: 'CAN 2.0 / CAN FD 国际标准' },
            { name: 'ISO 14229 - UDS诊断', url: 'https://www.iso.org/standard/72439.html', desc: '统一诊断服务（UDS）' },
            { name: 'ISO 26262 - 功能安全', url: 'https://www.iso.org/standard/68383.html', desc: '道路车辆功能安全（ASIL）' },
            { name: 'GB/T 31484 - 动力电池循环寿命', url: 'http://www.catarc.ac.cn/', desc: '中国新能源汽车电池测试标准' },
            { name: 'SAE J1939 - 商用车网络', url: 'https://www.sae.org/standards/content/j1939_201210/', desc: '商用车 SAE J1939 总线协议' }
        ]
    },
    {
        category: '行业工具官方教程',
        icon: '🛠️',
        items: [
            { name: 'Vector CANoe 官方文档', url: 'https://www.vector.com/portal/en/kb/products/canoe', desc: 'CANoe 入门、CAPL 编程、测试节点' },
            { name: 'Vector 免费 DEMO 工程', url: 'https://www.vector.com/portal/en/kb/articles/demo-projects-for-canoe', desc: 'CANoe 示例工程下载' },
            { name: 'dSPACE 教程中心', url: 'https://www.dspace.com/en/pub/home/support/tutorials.cfm', desc: 'ControlDesk / MATLAB / HIL 教程' },
            { name: 'NI VeriStand 入门', url: 'https://www.ni.com/en/support/documentation/supplemental/18/veristand-getting-started-guide.html', desc: 'NI HIL 测试平台入门指南' },
            { name: 'Prescan 仿真教程', url: 'https://www.tassinternational.com/prescan', desc: 'ADAS 场景仿真工具 Prescan' }
        ]
    },
    {
        category: '智能驾驶学习',
        icon: '🤖',
        items: [
            { name: 'NVIDIA DRIVE 开发者', url: 'https://developer.nvidia.com/drive', desc: '自动驾驶开发 SDK 与技术博客' },
            { name: 'Apollo 开放平台', url: 'https://apollo.auto/', desc: '百度 Apollo 开源自动驾驶平台' },
            { name: 'Autoware 开源项目', url: 'https://www.autoware.org/', desc: '全球首个开源自动驾驶软件' },
            { name: 'DeepRoute.Sense 技术博客', url: 'https://www.deeproute.ai/', desc: '自动驾驶感知与算法分享' },
            { name: '新智元 - 智能驾驶', url: 'https://www.newsmartwave.net/', desc: '智能驾驶行业资讯与深度文章' }
        ]
    },
    {
        category: '新能源汽车学习',
        icon: '⚡',
        items: [
            { name: '中国汽车动力电池产业创新联盟', url: 'http://www.cbpia.com/', desc: '动力电池行业数据与标准' },
            { name: 'EV-TEST 电动汽车评测', url: 'http://www.ev-test.cn/', desc: '中国电动汽车测评规程' },
            { name: '电动汽车安全强制标准 GB 38031', url: 'http://www.catarc.ac.cn/', desc: '电动汽车安全要求国家标准' },
            { name: 'SAE J1772 充电标准', url: 'https://www.sae.org/standards/content/j1772_201712/', desc: '北美充电接口标准' },
            { name: 'CCS 联合充电系统', url: 'https://www.charx.io/knowledge/ccs/', desc: '欧洲 CCS 快充技术详解' }
        ]
    },
    {
        category: '在线课程平台',
        icon: '🎓',
        items: [
            { name: 'Coursera - 自动驾驶专项', url: 'https://www.coursera.org/', desc: 'University of Toronto 自动驾驶专项课程' },
            { name: 'edX - 汽车工程', url: 'https://www.edx.org/', desc: 'MIT/ETH 等名校汽车工程课' },
            { name: '极客时间 - 智能驾驶专栏', url: 'https://time.geekbang.org/', desc: '国内一线智驾工程师专栏' },
            { name: 'CSDN - 车载开发专区', url: 'https://code.csdn.net/topic/automotive', desc: '车载开发文章与项目' },
            { name: '知乎汽车专栏', url: 'https://www.zhihu.com/topic/19554935/hot', desc: '汽车工程话题讨论与干货' }
        ]
    }
];

const LEARNING_METHODS = [
    {
        title: '📖 理论筑基',
        desc: '先掌握 CAN/UDS/AUTOSAR 等核心协议和架构，推荐从 Vector 官方文档和 ISO 标准入手，理解协议原理比背报文更重要。',
        tips: ['每天精读 20 页标准文档', '用思维导图整理协议层级', '结合 CANoe 实操验证']
    },
    {
        title: '🛠️ 工具实战',
        desc: '车载测试工程师的核心武器是 CANoe/CANape/dSPACE/NI，必须熟练掌握。建议下载 Vector 免费 Demo 工程，跟着官方 Tutorial 动手操作。',
        tips: ['至少完成 3 个 CANoe Demo 工程', '自己写 10 个以上 CAPL 测试脚本', '熟悉示波器抓波形分析']
    },
    {
        title: '🚗 项目驱动',
        desc: '找一个真实的车载测试项目练手——可以是开源项目（如 Apollo/Autoware）、模拟项目，或者公司内部的测试任务。在做中学是最快的。',
        tips: ['参与至少一个开源智驾项目', '独立完成一个 HIL 测试场景', '写一份完整的测试报告']
    },
    {
        title: '📊 专项深耕',
        desc: '选择一个方向深入——新能源三电测试、ADAS 场景测试、诊断刷写、以太网/SOME/IP。成为某个领域的专家比样样通更有价值。',
        tips: ['选定 1-2 个方向深入', '跟踪该领域最新标准变化', '在技术社区分享输出']
    },
    {
        title: '🌐 社区交流',
        desc: '加入车载测试、智能驾驶、新能源汽车相关的技术社区和微信群，和同行交流问题、分享经验、获取行业最新动态。',
        tips: ['加入 2-3 个高质量技术群', '参加行业会议（如 AUTOSAR 中国日）', '关注 10+ 行业大佬的技术博客']
    },
    {
        title: '🎯 证书加持',
        desc: '考取相关认证：Vector 认证工程师、SAE 认证、功能安全 ISO 26262 认证、新能源汽车维修技师证等，增加求职竞争力。',
        tips: ['Vector 认证考试准备', 'ISO 26262 功能安全培训', '持续学习，保持技术敏感度']
    }
];

const COURSES = [
    {
        id: 1,
        title: '测试基础',
        category: '测试基础',
        level: '入门',
        duration: '6小时',
        lessons: 6,
        icon: '🧪',
        color: 'from-green-500 to-emerald-500',
        description: '车载测试入门必修：基础测试方法、用例编写、BUG管理工具与生命周期，以及Linux/ADB系统基础。',
        tags: ['测试方法', '测试用例', 'Jira', 'Linux/ADB'],
        progress: 0,
        sections: [
            { title: '测试基本功', lessons: ['基础测试方法', '测试用例编写'] },
            { title: 'BUG管理', lessons: ['BUG管理工具—Jira使用', '车载中BUG的生命周期'] },
            { title: '系统基础', lessons: ['Linux基础', 'ADB基础'] }
        ]
    },
    {
        id: 2,
        title: '汽车通用基础',
        category: '汽车基础',
        level: '入门',
        duration: '8小时',
        lessons: 13,
        icon: '🚗',
        color: 'from-blue-500 to-cyan-500',
        description: '理解整车五大域概念与汽车通信网络架构，深入CAN总线协议原理、物理层布线及CANoe测试实战。',
        tags: ['五大域', '通信网络', 'CAN', 'CANoe'],
        progress: 0,
        sections: [
            { title: '整车与通信概念', lessons: ['汽车的五大域概念', '汽车通信网络', 'CAN网络概述'] },
            { title: 'CAN协议原理', lessons: ['拓扑结构', '报文结构详解', '仲裁机制', '错误检测与处理'] },
            { title: '物理层与布线', lessons: ['差分信号', '终端电阻', 'CAN总线布线规范'] },
            { title: 'CANoe测试实战', lessons: ['CANoe基础操作', 'CAPL语言入门', '测试脚本编写'] }
        ]
    },
    {
        id: 3,
        title: '测试常用工具及软件使用',
        category: '工具使用',
        level: '进阶',
        duration: '8小时',
        lessons: 4,
        icon: '🛠️',
        color: 'from-purple-500 to-pink-500',
        description: '掌握车载测试日常工具链：CANoe、ZCANPRO总线工具，Mobaxterm终端工具与UDS诊断协议。',
        tags: ['CANoe', 'ZCANPRO', 'Mobaxterm', 'UDS'],
        progress: 0,
        sections: [
            { title: '总线工具', lessons: ['CANoe使用', 'ZCANPRO使用'] },
            { title: '终端与诊断', lessons: ['Mobaxterm使用', 'UDS诊断协议'] }
        ]
    },
    {
        id: 4,
        title: '自动化工具使用',
        category: '自动化',
        level: '进阶',
        duration: '8小时',
        lessons: 4,
        icon: '⚙️',
        color: 'from-teal-500 to-cyan-500',
        description: '用脚本解放双手：CAPL、Shell、Python在车载测试自动化中的使用方法与学习思路。',
        tags: ['CAPL', 'Shell', 'Python', '自动化'],
        progress: 0,
        sections: [
            { title: '脚本语言', lessons: ['CAPL脚本使用', 'Shell脚本', 'Python基础'] },
            { title: '实战思路', lessons: ['车载测试中使用及学习思路'] }
        ]
    },
    {
        id: 5,
        title: 'AI时代如何利用好AI完善自动化以及学习技术',
        category: 'AI赋能',
        level: '拓展',
        duration: '2小时',
        lessons: 1,
        icon: '💡',
        color: 'from-amber-500 to-orange-500',
        description: '探讨如何借助AI工具提升测试自动化效率，以及AI时代下车载技术的学习方法。',
        tags: ['AI辅助', '自动化', '学习方法'],
        progress: 0,
        sections: [
            { title: 'AI赋能车载测试', lessons: ['AI时代如何利用好AI完善自动化以及学习技术'] }
        ]
    },
    {
        id: 6,
        title: '智能驾驶ADAS测试',
        category: 'ADAS测试',
        level: '高级',
        duration: '16小时',
        lessons: 13,
        icon: '🚘',
        color: 'from-rose-500 to-pink-500',
        description: '从ADAS概述到实车测试：L0-L5分级、传感器、功能与状态机、测试场景、问题定位与实车安全规范。',
        tags: ['ADAS', 'L0-L5', '传感器', '实车测试'],
        progress: 0,
        sections: [
            { title: 'ADAS概述', lessons: ['L0 — L5概念', '传感器介绍', 'ADAS所有功能', 'ADAS状态机', '感知—规划—预测—控制—执行'] },
            { title: '工作内容', lessons: ['测试场景', '部门结构', '项目阶段', '问题定位', '日志抓取'] },
            { title: '实车测试', lessons: ['测试场地', '测试设备', '安全措施'] }
        ]
    }
];

const KNOWLEDGE_BASE = [
    {
        id: 'kb1',
        category: '总线协议',
        title: 'CAN报文结构详解',
        content: `CAN 2.0B标准帧由以下部分组成：

1. 帧起始(1bit)：显性电平，标识帧开始
2. 仲裁场(12+1bit)：11位标识符 + RTR位
3. 控制场(6bit)：IDE位、r0位、DLC(4位)
4. 数据场(0-64bit)：实际数据内容
5. CRC场(16bit)：15位CRC + 1位CRC界定符
6. 应答场(2bit)：ACK槽 + ACK界定符
7. 帧结束(7bit)：隐性电平序列

CAN FD支持最高64字节数据场，仲裁场后有EDL位标识。`
    },
    {
        id: 'kb2',
        category: '诊断协议',
        title: 'UDS常用服务速查',
        content: `常用UDS诊断服务列表：

0x10 - 诊断会话控制(DiagnosticSessionControl)
  - 01: 默认会话
  - 02: 编程会话
  - 03: 扩展诊断会话

0x11 - ECU复位(ECUReset)
  - 01: 硬复位
  - 02: 断点火复位
  - 03: 软复位

0x22 - 通过标识符读数据(ReadDataByIdentifier)

0x2E - 通过标识符写数据(WriteDataByIdentifier)

0x27 - 安全访问(SecurityAccess)
  - 流程：请求种子 -> 发送密钥

0x19 - 读DTC信息(ReadDTCInformation)

0x14 - 清除诊断信息(ClearDiagnosticInformation)

0x31 - 例程控制(RoutineControl)

0x34/0x36/0x37 - 刷写流程(请求下载/传输数据/请求传输退出)`
    },
    {
        id: 'kb3',
        category: '测试基础',
        title: '汽车软件测试V模型',
        content: `汽车软件开发遵循V模型：

左侧(设计阶段)：
需求分析 → 系统设计 → 架构设计 → 详细设计 → 编码

对应右侧(测试阶段)：
验收测试 ← 系统测试 ← 集成测试 ← 软件单元测试

各阶段测试重点：
- 单元测试：函数/模块级，覆盖率>90%
- 集成测试：模块间接口交互
- 软件测试：SW在RTE/BSW环境
- 系统测试：ECU整机功能验证
- HIL测试：硬件在环实时仿真
- 整车测试：实车环境验证`
    },
    {
        id: 'kb4',
        category: '总线协议',
        title: 'CANoe测试脚本开发',
        content: `CAPL(CANoe Application Programming Language)基础：

1. 事件驱动模型
on message 0x123 { /* 收到ID=0x123的报文时触发 */ }
on timer TimerName { /* 定时器触发 */ }
on start { /* 测量开始 */ }

2. 发送报文
message 0x123 msg;
msg.byte(0) = 0x01;
output(msg);

3. 定时器
msTimer t;
setTimer(t, 100); // 100ms

4. 测试节点(Test Node)
testCase TestCheckMessage() {
  message 0x123 msg;
  testWaitForMessage(msg, 5000);
  if(msg.byte(0) == 0x01) {
    testStepPassed("Byte0 OK");
  } else {
    testStepFailed("Byte0 wrong");
  }
}

5. 测试报告使用testReportWrite()`
    },
    {
        id: 'kb5',
        category: '新能源',
        title: 'BMS核心功能测试点',
        content: `电池管理系统(BMS)测试要点：

1. 电压采集
  - 单体电压采集精度(±5mV)
  - 电压采样周期
  - 均衡功能测试

2. 温度管理
  - 温度传感器精度
  - 充放电温度限制
  - 热管理策略

3. SOC估算
  - 安时积分法验证
  - 开路电压法校准
  - 动态工况SOC精度

4. 保护功能
  - 过压/欠压保护
  - 过流/短路保护
  - 过温保护
  - 单体压差保护

5. 通信功能
  - CAN报文周期
  - 故障诊断UDS
  - 充电机通信(CC/CCS)`
    },
    {
        id: 'kb6',
        category: '智能驾驶',
        title: 'AEB测试场景规范',
        content: `AEB自动紧急制动测试场景(参考C-NCAP/Euro NCAP)：

1. CCRs (Car-to-Car Stationary)
  - 自车50km/h，前车静止
  - 目标：避免碰撞或减轻伤害

2. CCRm (Car-to-Car Moving)
  - 自车50km/h，前车20km/h同方向
  - 相对速度30km/h

3. CCRb (Car-to-Car Braking)
  - 自车50km/h，前车急刹车
  - 前车减速度6m/s²

4. PCR (Pedestrian Crossing)
  - 行人横穿测试
  - 自车速度20/30/40km/h

5. 测试指标
  - 碰撞避免率
  - 减速度响应时间
  - 制动力度控制`
    },
    {
        id: 'kb7',
        category: '总线协议',
        title: 'CAN FD vs CAN 2.0 对比',
        content: `CAN FD (Flexible Data-rate) 与经典 CAN 2.0 的关键差异：

1. 数据场长度
  - CAN 2.0：最多 8 字节
  - CAN FD：最多 64 字节（DLC 编码 0-8/12/16/20/24/32/48/64）

2. 波特率
  - CAN 2.0：全帧同一波特率，最高 1 Mbps
  - CAN FD：双波特率——仲裁段（最高 1 Mbps）+ 数据段（最高 5-8 Mbps），BRS 位切换

3. 新增控制位
  - FDF：标识 FD 帧（隐性）
  - BRS：位速率切换
  - ESI：错误状态指示

4. CRC 增强
  - 数据场 ≤16 字节用 17 位 CRC，>16 字节用 21 位 CRC
  - 增加填充位计数（Stuff Count）校验

5. 兼容性
  - CAN FD 节点可收发经典帧
  - 经典 CAN 节点收到 FD 帧会报错，不可混挂同一总线（除非网关隔离）

6. 典型应用：智驾域控、OTA 刷写（64 字节数据场使刷写吞吐提升约 8 倍）`
    },
    {
        id: 'kb8',
        category: '总线协议',
        title: 'LIN 总线基础与测试',
        content: `LIN (Local Interconnect Network) 低成本串行总线，常用于车身域：

1. 基本特性
  - 单线传输（基于 ISO 9141 K 线电平）
  - 主从架构：1 主节点 + 最多 15 从节点
  - 波特率：最高 20 kbps（常用 9600/19200 bps）
  - 无需晶振：从节点用同步场自校准

2. 帧结构
  - 报文头（主节点发）：间隔场(Break ≥13位显性) + 同步场(0x55) + PID(标识符+奇偶校验)
  - 应答（从节点发）：数据 1-8 字节 + 校验和
  - 校验和：经典校验（仅数据，LIN 1.x）/ 增强校验（含 PID，LIN 2.x）

3. 调度表
  - 主节点按 LDF 定义的调度表周期发送帧头
  - 无条件帧 / 事件触发帧 / 偶发帧 / 诊断帧(0x3C/0x3D)

4. 典型应用
  - 车窗/雨刮/座椅/空调面板/氛围灯
  - 成本敏感、速率要求低的执行器

5. 测试要点
  - 波特率容差、同步场精度
  - 校验和错误注入
  - 从节点无响应超时处理
  - 睡眠/唤醒（唤醒信号 250μs-5ms 显性电平）`
    },
    {
        id: 'kb9',
        category: '总线协议',
        title: '车载以太网与 SOME/IP',
        content: `车载以太网是智驾/座舱域的骨干网络：

1. 物理层
  - 100BASE-T1 / 1000BASE-T1：单对双绞线全双工（OPEN Alliance 制定）
  - 与传统 100BASE-TX 不兼容，需专用 PHY 与连接器

2. 协议栈
  - UDP：服务发现与事件通知（实时性好）
  - TCP：大数据传输（刷写、日志）
  - VLAN/AVB/TSN：时间敏感网络，保证确定性延迟

3. SOME/IP (Scalable service-Oriented MiddlewarE over IP)
  - 面向服务的中间件，AUTOSAR 标准组件
  - 报文头：Service ID + Method ID + Length + Client/Session ID + Protocol/Interface Version + Message Type + Return Code
  - 三种通信模式：Request/Response、Fire&Forget、Event（订阅/发布）

4. SOME/IP-SD (Service Discovery)
  - Offer Service：服务端周期广播服务地址
  - Find/Subscribe：客户端查找并订阅事件组
  - 组播地址段 224.0.0.x

5. 测试要点
  - SD 时序（Initial Wait / Repetition Phase）
  - 序列化字节序与对齐
  - 事件组订阅/退订、TTL 过期
  - 负载与延迟（TSN 优先级验证）`
    },
    {
        id: 'kb10',
        category: '诊断协议',
        title: 'DoIP 以太网诊断',
        content: `DoIP (Diagnostics over IP, ISO 13400) 基于以太网的 UDS 诊断：

1. 为什么需要 DoIP
  - CAN 带宽 500kbps，刷写 1MB 需 10+ 分钟
  - 100M 以太网刷写快 100 倍，满足 OTA/大软件刷写需求

2. 连接建立流程
  - 车辆发现（Vehicle Announcement / Identification）
  - 路由激活（Routing Activation, 0x0005）
  - 之后透传标准 UDS 报文（Diagnostic Message, 0x8001）

3. DoIP 报文头（8 字节）
  - 协议版本(0x02/0x03) + 版本取反
  - 载荷类型(2字节)：0x0005路由激活 / 0x8001诊断 / 0x8002诊断正响应 / 0x8003诊断负响应
  - 载荷长度(4字节)

4. 寻址
  - 逻辑地址 2 字节：Tester 常用 0x0E80，ECU 由 OEM 定义
  - 功能寻址：0xE000 段

5. 测试要点
  - 路由激活超时与并发连接数
  - 非法载荷类型/长度异常处理
  - 与 CAN 网关的 DoIP-CAN 路由（ISO 13400 网关）
  - 刷写吞吐量与断点续传`
    },
    {
        id: 'kb11',
        category: '软件架构',
        title: 'AUTOSAR Classic 分层架构',
        content: `AUTOSAR Classic Platform 分层（自底向上）：

1. 微控制器层 (MCAL)
  - 直接驱动硬件：ADC/PWM/CAN/SPI/Fls/Dio 驱动
  - 与具体芯片强相关，由芯片厂提供

2. ECU 抽象层 (ECU Abstraction)
  - 屏蔽硬件差异：I/O 硬件抽象、存储/通信硬件抽象

3. 服务层 (Services Layer)
  - 操作系统 (OS, 符合 OSEK)
  - 通信栈 (Com/PduR/CanIf/CanSM)
  - 诊断栈 (Dcm/Dem/Fim)
  - 存储栈 (NvM/MemIf/FEE/EA)
  - 网络管理 (Nm/ComM/BswM)

以上三层合称 BSW (Basic Software)

4. RTE (Runtime Environment)
  - 连接应用层 SWC 与 BSW 的胶水层
  - 实现 SWC 间 Port 通信（S/R 与 C/S 接口）
  - 代码由工具链自动生成（如 DaVinci Configurator）

5. 应用层 (Application Layer)
  - SWC (Software Component)：原子组件，与硬件无关
  - 端口接口：Sender-Receiver (S/R)、Client-Server (C/S)
  - Runnable：由 OS Task 周期/事件触发

记忆口诀：M 硬 E 抽 S 服务，RTE 中间 A 应用。`
    },
    {
        id: 'kb12',
        category: '测试方法',
        title: 'ISO 26262 功能安全与 ASIL',
        content: `ISO 26262 道路车辆功能安全标准核心概念：

1. 什么是功能安全
  - 由电子电气系统故障（失效）导致的风险控制
  - 不处理机械失效与人为误用（那是 SOTIF ISO 21448）

2. 安全生命周期
  - 概念阶段 → 产品开发 → 生产 → 运行 → 报废
  - 核心：HARA（危害分析与风险评估）

3. ASIL 等级（A 最低，D 最高）
  - 由 S/E/C 三因子组合确定：
    S 严重度（S0无伤 ~ S3致命伤）
    E 暴露率（E0极低 ~ E4高概率）
    C 可控性（C0易控 ~ C3难控）
  - QM：低于 ASIL A，按常规质量流程开发即可
  - 典型：AEB 制动指令 ASIL D，氛围灯 QM

4. 关键概念
  - 安全目标 (Safety Goal)：最高层安全需求
  - ASIL 分解：如 ASIL D = ASIL B + ASIL B（冗余）
  - 安全机制：看门狗、ECC、双核锁步(Lockstep)

5. 测试要求（ASIL 越高越严格）
  - 需求覆盖、故障注入测试
  - 代码覆盖率：ASIL D 要求 MC/DC 覆盖
  - 工具置信度 (TCL1-3) 评估`
    }
];

const QUIZZES = [
    {
        id: 1,
        courseId: 2,
        title: 'CAN总线基础测试',
        questions: [
            {
                q: 'CAN 2.0B标准帧的标识符长度是多少位？',
                options: ['8位', '11位', '29位', '32位'],
                answer: 1,
                explain: 'CAN 2.0A使用11位标识符(标准帧)，CAN 2.0B扩展帧使用29位标识符。'
            },
            {
                q: 'CAN总线仲裁时，哪种电平具有优先级？',
                options: ['显性电平', '隐性电平', '两者相同', '取决于波特率'],
                answer: 0,
                explain: '显性电平(逻辑0)优先级高于隐性电平(逻辑1)，低ID号优先级更高。'
            },
            {
                q: 'CAN总线两端为什么需要120Ω终端电阻？',
                options: ['提高电压', '阻抗匹配减少反射', '节省功耗', '增强信号'],
                answer: 1,
                explain: '120Ω是CAN总线的特征阻抗，终端电阻用于阻抗匹配，减少信号反射。'
            },
            {
                q: 'CAN FD相比CAN 2.0的主要改进是什么？',
                options: ['更长的标识符', '更大的数据场(最高64字节)', '更高的电压', '更多节点'],
                answer: 1,
                explain: 'CAN FD最大特点是数据场从8字节扩展到64字节，仲裁阶段500kbps，数据阶段最高2Mbps。'
            },
            {
                q: '当两个CAN节点同时发送报文时，仲裁机制如何工作？',
                options: ['同时发送会冲突都失败', '逐位比较，发送隐性而监听到显性的节点退出', '随机选择一个继续', '延迟一段时间再发'],
                answer: 1,
                explain: '仲裁采用CSMA/CA，每个节点逐位发送并监听总线，若发送隐性(1)但检测到显性(0)则退出仲裁。'
            }
        ]
    },
    {
        id: 2,
        courseId: 3,
        title: 'UDS诊断协议测试',
        questions: [
            {
                q: 'UDS中0x10服务的功能是什么？',
                options: ['ECU复位', '诊断会话控制', '安全访问', '读DTC'],
                answer: 1,
                explain: '0x10是DiagnosticSessionControl，用于切换诊断会话(默认/编程/扩展)。'
            },
            {
                q: 'UDS安全访问服务(0x27)的流程是？',
                options: ['直接发送密钥', '先请求种子再发送密钥', '同时发送种子和密钥', '不需要种子'],
                answer: 1,
                explain: '安全访问流程：客户端请求种子 -> 服务器返回种子 -> 客户端基于种子计算密钥并发送。'
            },
            {
                q: 'UDS刷写流程的正确顺序是？',
                options: ['34→36→37', '37→36→34', '36→34→37', '34→37→36'],
                answer: 0,
                explain: '刷写流程：0x34请求下载(获取地址和大小) → 0x36传输数据(分块发送) → 0x37请求传输退出。'
            },
            {
                q: '负响应码NRC 0x7F的含义是？',
                options: ['成功', '拒绝', '子功能不支持', '条件不满足'],
                answer: 2,
                explain: 'NRC 0x12表示子功能不支持，NRC 0x22表示条件不满足，NRC 0x33表示安全访问被拒绝。'
            },
            {
                q: '默认会话(Default Session)下可以执行哪些操作？',
                options: ['所有诊断服务', '仅基础服务如读DTC', '仅刷写', '仅安全访问'],
                answer: 1,
                explain: '默认会话下只能执行基础诊断，如读DTC、读数据等；写入和刷写需要切换到扩展/编程会话。'
            }
        ]
    },
    {
        id: 3,
        courseId: 1,
        title: '整车测试基础测试',
        questions: [
            {
                q: '汽车软件测试V模型中，单元测试对应哪个设计阶段？',
                options: ['需求分析', '系统设计', '详细设计', '编码'],
                answer: 3,
                explain: 'V模型左侧编码阶段对应右侧单元测试，详细设计对应集成测试，架构设计对应软件测试。'
            },
            {
                q: '以下哪种不属于黑盒测试用例设计方法？',
                options: ['等价类划分', '边界值分析', '代码覆盖率', '状态迁移法'],
                answer: 2,
                explain: '代码覆盖率是白盒测试指标，其他都是黑盒测试用例设计方法。'
            },
            {
                q: '严重(Severity)为Critical的缺陷通常意味着？',
                options: ['UI显示问题', '功能异常但有替代方案', '系统崩溃或数据丢失', '建议优化'],
                answer: 2,
                explain: 'Critical级别表示系统崩溃、数据丢失、安全问题等严重影响系统可用性的问题。'
            },
            {
                q: '测试用例的三要素是？',
                options: ['输入、输出、预期结果', '目的、方法、结论', '数据、步骤、结果', '前置条件、操作步骤、预期结果'],
                answer: 3,
                explain: '标准测试用例包括：前置条件、操作步骤、预期结果，有时还包含测试数据。'
            },
            {
                q: '回归测试的主要目的是？',
                options: ['发现新缺陷', '验证修复是否引入新问题', '提高测试覆盖率', '减少测试时间'],
                answer: 1,
                explain: '回归测试是在软件修改后重新执行原有测试用例，确保修改没有引入新缺陷。'
            }
        ]
    },
    {
        id: 4,
        courseId: 7,
        title: '新能源汽车测试',
        questions: [
            {
                q: '动力电池SOC的准确含义是？',
                options: ['电压百分比', '剩余容量百分比', '能量百分比', '电流百分比'],
                answer: 1,
                explain: 'SOC(State of Charge)是电池当前剩余容量与总容量的百分比。'
            },
            {
                q: '快充(DC)通信使用的标准是？',
                options: ['GB/T 27930', 'GB/T 20234', 'ISO 15118', 'GB/T 18487'],
                answer: 0,
                explain: 'GB/T 27930是直流快充通信协议，GB/T 20234是充电连接装置标准。'
            },
            {
                q: 'BMS中均衡功能的主要作用是？',
                options: ['提高总电压', '平衡单体电压', '增加容量', '降低温度'],
                answer: 1,
                explain: '均衡用于平衡电池包内各单体电池的电压/容量差异，防止某些单体过早过充/过放。'
            },
            {
                q: '以下哪种不是常见的电机类型？',
                options: ['永磁同步电机PMSM', '异步电机IM', '直流有刷电机', '步进电机'],
                answer: 3,
                explain: '新能源车常用PMSM和IM，步进电机不适合作为驱动电机。'
            },
            {
                q: '整车控制器VCU的主要职责是？',
                options: ['电池管理', '电机控制', '能量管理与协调', '充电管理'],
                answer: 2,
                explain: 'VCU是整车大脑，负责协调BMS、MCU、充电系统等，管理能量分配和驾驶模式。'
            }
        ]
    },
    {
        id: 5,
        courseId: 6,
        title: 'ADAS智能驾驶测试',
        questions: [
            {
                q: 'SAE自动驾驶分级中，L2的含义是？',
                options: ['无自动化', '驾驶辅助', '部分自动化', '有条件自动化'],
                answer: 2,
                explain: 'L2部分自动化：系统同时控制转向和加减速，但驾驶员需监控环境并随时接管。'
            },
            {
                q: 'AEB系统主要使用什么传感器？',
                options: ['仅摄像头', '仅毫米波雷达', '摄像头+毫米波雷达融合', '仅激光雷达'],
                answer: 2,
                explain: '主流AEB采用摄像头和毫米波雷达融合方案，兼顾语义识别和距离测量。'
            },
            {
                q: '以下哪项不属于ACC功能？',
                options: ['自动跟车', '保持车道', '自动刹车', '加速至设定速度'],
                answer: 1,
                explain: 'ACC(自适应巡航)负责纵向控制(加减速)，车道保持是LKA功能(横向控制)。'
            },
            {
                q: '自动驾驶仿真测试的优势是？',
                options: ['完全真实', '成本高但准确', '可重复、覆盖极端场景', '不能测试算法'],
                answer: 2,
                explain: '仿真测试可安全地覆盖极端场景，可重复测试，成本远低于实车测试。'
            },
            {
                q: '激光雷达相比摄像头的优势是？',
                options: ['成本更低', '可直接获取精确3D距离', '不受光照影响', '可识别交通标志'],
                answer: 1,
                explain: '激光雷达可直接获取精确的3D点云距离信息，不受光照条件影响，但成本较高。'
            }
        ]
    }
];

const CATEGORIES = ['全部', '测试基础', '汽车基础', '工具使用', '自动化', 'AI赋能', 'ADAS测试'];

const USER_DATA = {
    name: '车载测试工程师',
    avatar: '👨‍💻',
    level: '中级',
    joinDate: '2024-01-15',
    stats: {
        totalStudyHours: 0,
        completedCourses: 0,
        quizPassed: 0,
        streakDays: 0
    },
    courseProgress: {},
    quizHistory: [],
    achievements: []
};

function loadUserData() {
    const saved = localStorage.getItem('carStudyUserData');
    if (saved) {
        return JSON.parse(saved);
    }
    return { ...USER_DATA };
}

function saveUserData(data) {
    localStorage.setItem('carStudyUserData', JSON.stringify(data));
}
