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
        title: 'CAN总线基础与测试',
        category: '总线协议',
        level: '入门',
        duration: '8小时',
        lessons: 12,
        icon: '🔌',
        color: 'from-blue-500 to-cyan-500',
        description: '深入学习CAN总线协议原理、报文结构、物理层特性，以及使用Vector CANoe/CANalyzer进行总线测试的实操技能。',
        tags: ['CAN 2.0', 'CAN FD', '仲裁', '错误帧'],
        progress: 0,
        sections: [
            { title: '车载网络概述', lessons: ['车载网络演进', 'CAN总线在整车中的地位', '拓扑结构'] },
            { title: 'CAN协议原理', lessons: ['报文结构详解', '仲裁机制', '错误检测与处理'] },
            { title: '物理层与布线', lessons: ['差分信号', '终端电阻', 'CAN总线布线规范'] },
            { title: '测试工具实战', lessons: ['CANoe基础操作', 'CAPL语言入门', '测试脚本编写'] }
        ]
    },
    {
        id: 2,
        title: 'UDS诊断协议详解',
        category: '诊断协议',
        level: '进阶',
        duration: '12小时',
        lessons: 18,
        icon: '🔍',
        color: 'from-purple-500 to-pink-500',
        description: '全面掌握ISO 14229 UDS诊断服务，包括会话管理、安全访问、常用诊断服务及其在车载测试中的应用。',
        tags: ['ISO 14229', '诊断服务', '刷写', '安全访问'],
        progress: 0,
        sections: [
            { title: 'UDS基础', lessons: ['OSI模型与诊断', '诊断架构', '会话层协议'] },
            { title: '核心诊断服务', lessons: ['0x10会话控制', '0x11 ECU复位', '0x22读数据', '0x2E写数据'] },
            { title: '安全机制', lessons: ['0x27安全访问', '密钥算法', '会话与安全的关系'] },
            { title: '进阶服务', lessons: ['0x14清除DTC', '0x19读DTC信息', '0x31例程控制', '0x34/0x36/0x37刷写流程'] }
        ]
    },
    {
        id: 3,
        title: '整车测试基础',
        category: '测试基础',
        level: '入门',
        duration: '6小时',
        lessons: 10,
        icon: '🚗',
        color: 'from-green-500 to-emerald-500',
        description: '了解整车测试的基本概念、测试流程、测试分类，以及如何制定测试计划和编写测试用例。',
        tags: ['测试流程', '测试用例', '测试计划', '缺陷管理'],
        progress: 0,
        sections: [
            { title: '测试基础概念', lessons: ['软件测试金字塔', 'V模型与敏捷', '整车测试范畴'] },
            { title: '测试分类', lessons: ['单元测试', '集成测试', '系统测试', '验收测试'] },
            { title: '测试设计方法', lessons: ['等价类划分', '边界值分析', '状态迁移法', '场景法'] },
            { title: '测试管理', lessons: ['测试计划编写', '缺陷生命周期', '测试报告撰写'] }
        ]
    },
    {
        id: 4,
        title: 'AUTOSAR架构与测试',
        category: '软件架构',
        level: '高级',
        duration: '16小时',
        lessons: 22,
        icon: '🏗️',
        color: 'from-orange-500 to-red-500',
        description: '深入学习AUTOSAR Classic和Adaptive平台架构，了解SWC开发、RTE通信、BSW模块及其测试方法。',
        tags: ['AUTOSAR Classic', 'AUTOSAR Adaptive', 'RTE', 'BSW'],
        progress: 0,
        sections: [
            { title: 'AUTOSAR概述', lessons: ['AUTOSAR历史与目标', 'Classic vs Adaptive', '架构分层'] },
            { title: '应用层SWC', lessons: ['SWC类型', '端口接口', '组件设计'] },
            { title: 'RTE通信', lessons: ['信号交互', '事件机制', '多SWC调度'] },
            { title: 'BSW模块', lessons: ['诊断栈', '通信栈', '操作系统'] },
            { title: 'AUTOSAR测试', lessons: ['单元测试', '集成测试', '配置验证'] }
        ]
    },
    {
        id: 5,
        title: '车载以太网测试',
        category: '总线协议',
        level: '进阶',
        duration: '10小时',
        lessons: 15,
        icon: '🌐',
        color: 'from-indigo-500 to-blue-500',
        description: '学习车载以太网技术，包括100/1000Mbps物理层、TCP/IP协议栈、SOME/IP中间件及测试方法。',
        tags: ['Ethernet', 'SOME/IP', 'TCP/IP', 'DoIP'],
        progress: 0,
        sections: [
            { title: '车载以太网基础', lessons: ['为什么需要以太网', '物理层标准', '与CAN的对比'] },
            { title: 'TCP/IP协议栈', lessons: ['IP地址与路由', 'TCP/UDP协议', 'DHCP/DNS'] },
            { title: 'SOME/IP中间件', lessons: ['服务发现', '事件订阅', '序列化'] },
            { title: '车载诊断', lessons: ['DoIP协议', '以太网刷写', '安全通信'] }
        ]
    },
    {
        id: 6,
        title: 'HI测试与HIL仿真',
        category: '测试方法',
        level: '进阶',
        duration: '14小时',
        lessons: 20,
        icon: '🖥️',
        color: 'from-teal-500 to-cyan-500',
        description: '掌握硬件在环(HIL)测试系统搭建、模型构建、自动化测试脚本编写，了解主流HIL平台使用。',
        tags: ['HIL', 'dSPACE', 'NI', '实时仿真'],
        progress: 0,
        sections: [
            { title: 'HIL测试原理', lessons: ['HIL vs SIL vs PIL', 'HIL系统组成', '测试场景搭建'] },
            { title: '仿真模型', lessons: ['Plant模型', '车辆动力学', '发动机模型'] },
            { title: 'dSPACE平台', lessons: ['ControlDesk操作', 'DS1006板卡', '自动化测试'] },
            { title: 'NI平台', lessons: ['VeriStand配置', 'PXI硬件', '测试脚本开发'] },
            { title: '测试工程实战', lessons: ['测试用例执行', '结果分析', '报告生成'] }
        ]
    },
    {
        id: 7,
        title: '新能源汽车测试',
        category: '专项测试',
        level: '高级',
        duration: '18小时',
        lessons: 25,
        icon: '⚡',
        color: 'from-yellow-500 to-orange-500',
        description: '全面覆盖新能源汽车三电系统测试，包括动力电池、电机驱动、整车控制器的测试技术与标准。',
        tags: ['BMS', 'MCU', 'VCU', '充电测试'],
        progress: 0,
        sections: [
            { title: '动力电池测试', lessons: ['电池包结构', 'BMS功能测试', '充放电测试', '安全测试'] },
            { title: '电机系统测试', lessons: ['永磁同步电机', '逆变器测试', '控制算法验证'] },
            { title: '整车控制测试', lessons: ['VCU功能', '能量管理', '驾驶模式切换'] },
            { title: '充电系统测试', lessons: ['慢充快充', '桩车协议', '充电安全'] },
            { title: '标准与法规', lessons: ['GB/T标准', '安全要求', '试验规范'] }
        ]
    },
    {
        id: 8,
        title: '智能驾驶ADAS测试',
        category: '专项测试',
        level: '高级',
        duration: '20小时',
        lessons: 28,
        icon: '🤖',
        color: 'from-rose-500 to-pink-500',
        description: '学习ADAS功能测试、感知测试、规控测试，掌握场景库建设、仿真测试工具和实车测试方法。',
        tags: ['ADAS', '自动驾驶', '感知', '规划控制'],
        progress: 0,
        sections: [
            { title: 'ADAS概述', lessons: ['SAE分级', 'ADAS功能地图', '传感器介绍'] },
            { title: '感知测试', lessons: ['摄像头测试', '毫米波雷达测试', '激光雷达测试', '融合算法验证'] },
            { title: '规控测试', lessons: ['车道保持LKA', '自适应巡航ACC', '自动紧急制动AEB'] },
            { title: '仿真测试', lessons: ['Prescan/Simulink', '场景库构建', '回归测试'] },
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
    }
];

const QUIZZES = [
    {
        id: 1,
        courseId: 1,
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
        courseId: 2,
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
        courseId: 3,
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
        courseId: 8,
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

const CATEGORIES = ['全部', '总线协议', '诊断协议', '测试基础', '软件架构', '测试方法', '专项测试'];

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
