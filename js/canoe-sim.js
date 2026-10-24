/* ==========================================================
   CANoe 交互式模拟器 v2 - 九键车载学习平台
   真实流程参考 Phoenixy 博客 + Vector 官方文档
   ========================================================== */

const CANOE_SIM_STATE = {
    tab: 'hardware',
    isMeasuring: false,
    isRecording: false,
    messages: [],
    timerId: null,
    startTime: 0,
    userMessageTimers: {},
    recStartIdx: 0,
    // Graphics 数据缓存（每个信号保留最近 100 个点）
    signalBuf: {
        SteeringAngle: [], VehicleSpeed: [], LongAccel: [], LatAccel: [], ParkingState: [], Gear: []
    }
};

/* 车载信号模型：车辆加减速场景 */
const SIM_SIGNALS = [
    {
        id: '0x100', name: 'EngineSpeed', dlc: 8, cycle: 50,
        desc: 'EMS 发动机转速',
        data: () => [randHex(0x00, 0x7F), randHex(0x00, 0xFF), randHex(0x00, 0x14), 0, 0, 0, 0, 0],
        color: 'text-cyan-400'
    },
    {
        id: '0x101', name: 'VehicleSpeed', dlc: 4, cycle: 100,
        desc: '车速 (0.01km/h) · 0→100→0 加减速循环',
        data: () => {
            // 20s 一个循环：前 10s 从 0 加速到 100，后 10s 从 100 减速到 0
            const t = Date.now() % 20000;
            const speed = t < 10000 ? (t / 10000) * 100 : ((20000 - t) / 10000) * 100;
            const raw = Math.round(speed * 100) & 0xFFFF;   // 0.01 km/h 分辨率
            return [(raw >> 8) & 0xFF, raw & 0xFF, 0, 0];
        },
        color: 'text-emerald-400',
        extract: (bytes) => ((bytes[0] << 8) | bytes[1]) / 100.0   // km/h
    },
    {
        id: '0x123', name: 'EPS_Steering', dlc: 8, cycle: 50,
        desc: '转向角 + 转速',
        data: () => {
            const angle = Math.sin(Date.now() / 1000) * 250;  // 弧度转角度
            const a = Math.round(angle * 10) & 0xFFFF;
            const speed = Math.round(Math.cos(Date.now() / 800) * 500);
            return [(a >> 8) & 0xFF, a & 0xFF, (speed >> 8) & 0xFF, speed & 0xFF, 0, 0, 0, 0];
        },
        color: 'text-violet-400',
        extract: (b) => { const a = (b[0] << 8) | b[1]; return ((a & 0x8000) ? a - 0x10000 : a) / 10.0; }
    },
    {
        id: '0x200', name: 'VCU_ParkState', dlc: 8, cycle: 100,
        desc: '泊车状态位 + 档位',
        data: () => {
            const t = Date.now() % 20000;
            let state, gear;
            if (t < 2000)      { state = 0; gear = 1; }   // Idle + Park
            else if (t < 5000) { state = 1; gear = 4; }   // Searching + Drive
            else if (t < 8000) { state = 2; gear = 4; }   // Aligning + Drive
            else if (t < 15000){ state = 3; gear = 2; }   // BackingIn + Reverse
            else if (t < 18000){ state = 4; gear = 1; }   // Completed + Park
            else               { state = 0; gear = 1; }
            return [state, gear, 0, 0, 0, 0, 0, 0];
        },
        color: 'text-amber-400',
        extract: (b) => b[0],
        stateLabels: ['Idle空闲','Searching搜索','Aligning对准','BackingIn倒车','Completed完成','Fault故障']
    },
    {
        id: '0x400', name: 'Acceleration', dlc: 6, cycle: 50,
        desc: '纵向 + 横向加速度 (0.01g)',
        data: () => {
            // 纵向加速度随加减速阶段切换：加速段 +0.3g，减速段 -0.3g
            const t = Date.now() % 20000;
            const la = t < 10000 ? 30 : -30;   // 0.01g 单位 → ±0.30g
            const laHex = ((la & 0xFFFF) << 16) >> 16;   // 保留符号
            const lat = Math.round(Math.cos(Date.now() / 900) * 20);
            const latHex = ((lat & 0xFFFF) << 16) >> 16;
            return [(laHex >> 8) & 0xFF, laHex & 0xFF, (latHex >> 8) & 0xFF, latHex & 0xFF, 0, 0];
        },
        color: 'text-pink-400',
        extractLong: (b) => { const x = (b[0] << 8) | b[1]; return ((x & 0x8000) ? x - 0x10000 : x) / 100.0; },
        extractLat:  (b) => { const x = (b[2] << 8) | b[3]; return ((x & 0x8000) ? x - 0x10000 : x) / 100.0; }
    },
    {
        id: '0x18F00402', name: 'BMS_Status', dlc: 8, cycle: 200,
        desc: 'BMS 电池状态 (29bit 扩展帧)',
        data: () => [randHex(0x00, 0x02), randHex(0x40, 0x64), randHex(0xAA, 0xBB), 0, 0, 0, 0, 0],
        color: 'text-emerald-500'
    },
    {
        id: '0x7DF', name: 'DiagRequest', dlc: 8, cycle: 0,
        desc: 'UDS 诊断请求',
        data: () => [0x02, 0x10, 0x03, 0xAA, 0, 0, 0, 0],
        color: 'text-pink-500'
    },
    {
        id: '0x7E8', name: 'DiagResponse', dlc: 8, cycle: 0,
        desc: 'UDS 诊断响应 (ECU物理响应)',
        data: () => [0x02, 0x50, 0x03, 0xAA, 0, 0, 0, 0],
        color: 'text-pink-300'
    },
    {
        id: '0x18FEF100', name: 'ABS_Brake', dlc: 8, cycle: 20,
        desc: 'ABS 制动压力 (高优先级)',
        data: () => [randHex(0x00, 0x14), randHex(0x00, 0x64), 0, 0, 0, 0, 0, 0],
        color: 'text-red-400'
    }
];

function randHex(min, max) { return Math.floor(Math.random() * (max - min + 1)) + min; }

/* 快捷发送 */
const CANOE_TIMELINE = [
    { step: 1, title: '硬件与驱动', desc: 'VN1610 + USB + 终端电阻 + Vector Hardware Manager' },
    { step: 2, title: '新建工程', desc: '1ch CAN 模板 → Measurement Setup' },
    { step: 3, title: '波特率 & 硬件', desc: 'Simulation Setup 500k → Hardware Config 选 VN1610' },
    { step: 4, title: 'IG 报文生成', desc: '插 Interactive Generator → 建报文创信号' },
    { step: 5, title: '导入 DBC', desc: 'Database Editor 看信号名和字节布局' },
    { step: 6, title: 'Graphics 曲线', desc: '把信号拖进 Graphics Window 实时看曲线' },
    { step: 7, title: 'Diagnostics', desc: '配 UDS 地址 → 会话 1001/1002/1003 → 安全访问 27xx' }
];

/* ============ 入口 ============ */
function renderCanoeSimulator() {
    CANOE_SIM_STATE.tab = 'hardware';
    CANOE_SIM_STATE.messages = [];
    CANOE_SIM_STATE.isMeasuring = false;
    CANOE_SIM_STATE.isRecording = false;
    CANOE_SIM_STATE.startTime = 0;
    Object.keys(CANOE_SIM_STATE.signalBuf).forEach(k => CANOE_SIM_STATE.signalBuf[k] = []);

    const content = document.getElementById('main-content');
    content.className = 'container mx-auto px-4 py-6 max-w-6xl fade-in';
    content.innerHTML = `
        <div class="fade-in">
            <button onclick="navigate('home')" class="text-cyan-600 hover:underline mb-4 flex items-center text-sm">← 返回首页</button>

            <!-- 教学模拟声明 -->
            <div class="mb-4 rounded-xl border-2 border-amber-500/50 bg-amber-500/10 px-4 py-2.5 text-[11px] sm:text-xs text-amber-200 leading-relaxed flex items-start gap-2">
                <span class="text-amber-400 font-bold flex-shrink-0">⚠️</span>
                <div>
                    <strong>教学模拟 · 不连接真实硬件</strong> 本页面所有报文、波形、指示灯、VN1610/UDS 响应均为前端模拟数据，
                    仅用于演示 CANoe/UDS 的界面布局和操作流程；不能控制或读取真实 CANoe、VN1610、ECU、CAN 总线或其他商业软件。
                </div>
            </div>

            <div class="gradient-bg rounded-3xl p-5 sm:p-8 mb-6 text-white relative overflow-hidden">
                <div class="absolute -top-20 -right-20 w-60 h-60 bg-cyan-400/10 rounded-full"></div>
                <div class="absolute -bottom-16 -left-16 w-52 h-52 bg-emerald-400/10 rounded-full"></div>
                <div class="relative z-10">
                    <div class="flex items-center gap-3 mb-2">
                        <div class="w-12 h-12 bg-white/20 backdrop-blur rounded-xl flex items-center justify-center text-2xl">🖥️</div>
                        <div>
                            <h1 class="text-xl sm:text-2xl md:text-3xl font-bold">CANoe 交互式模拟器</h1>
                            <p class="text-cyan-100 text-xs sm:text-sm mt-1">从硬件到软件 · 含车速 0→100→0 加减速与纵向加速度实时曲线</p>
                        </div>
                    </div>
                    <div class="flex gap-2 flex-wrap mt-3">
                        <span class="badge bg-white/20">🔧 VN1610 指示灯面板</span>
                        <span class="badge bg-white/20">📊 Graphics 实时曲线</span>
                        <span class="badge bg-white/20">🔧 UDS Diagnostics</span>
                        <span class="badge bg-white/20">🚗 加减速场景信号</span>
                    </div>
                </div>
            </div>
            ${renderCanoeTabs()}
            <div id="canoe-tab-content" class="mt-4"></div>
        </div>
    `;

    window.canoeSetTab = function(tab) {
        CANOE_SIM_STATE.tab = tab;
        document.querySelectorAll('.canoe-tab').forEach(b => {
            b.className = 'canoe-tab flex-1 py-3 px-2 sm:px-4 rounded-xl font-semibold text-sm sm:text-base transition-all text-slate-600 hover:bg-slate-100';
        });
        document.getElementById('canoe-tab-' + tab).className = 'canoe-tab flex-1 py-3 px-2 sm:px-4 rounded-xl font-semibold text-sm sm:text-base transition-all bg-gradient-to-r from-cyan-500 to-emerald-500 text-white shadow-md';
        const target = {
            hardware: renderCanoeHardware,
            software: renderCanoeSoftware,
            simulator: renderCanoeWorkbench
        }[tab] || renderCanoeHardware;
        document.getElementById('canoe-tab-content').innerHTML = target();
        if (tab === 'hardware') bindHardwareSim();
        if (tab === 'software') bindSwStepper();
        if (tab === 'simulator') bindWorkbenchSim();
    };

    document.getElementById('canoe-tab-content').innerHTML = renderCanoeHardware();
    bindHardwareSim();
}

function renderCanoeTabs() {
    const tabs = [
        { id: 'hardware', label: '硬件与连接', icon: '🔌' },
        { id: 'software', label: '软件配置 7 步', icon: '⚙️' },
        { id: 'simulator', label: '实验台+Graphics', icon: '📊' }
    ];
    return `
        <div class="bg-white rounded-2xl p-1.5 sm:p-2 shadow-sm flex gap-1.5 sm:gap-2">
            ${tabs.map((t, i) => `
                <button id="canoe-tab-${t.id}" onclick="canoeSetTab('${t.id}')"
                        class="canoe-tab flex-1 py-3 px-2 sm:px-4 rounded-xl font-semibold text-sm sm:text-base transition-all ${i === 0 ? 'bg-gradient-to-r from-cyan-500 to-emerald-500 text-white shadow-md' : 'text-slate-600 hover:bg-slate-100'}">
                    ${t.icon} <span class="hidden sm:inline">${t.label}</span>
                </button>
            `).join('')}
        </div>
    `;
}

/* ============ Tab 1: 硬件 ============ */
function renderCanoeHardware() {
    return `
        <div class="space-y-6">
            <div class="bg-white rounded-2xl p-4 sm:p-6 shadow-sm">
                <h2 class="text-lg sm:text-xl font-bold text-slate-800 mb-4">🔧 VN1610 实物 + 指示灯详解</h2>

                <!-- VN1610 实物模拟 -->
                <div class="grid lg:grid-cols-5 gap-4">
                    <div class="lg:col-span-2">
                        <div class="bg-slate-800 rounded-xl p-4 border border-slate-700">
                            <!-- 设备本体 -->
                            <div class="bg-gradient-to-b from-slate-700 to-slate-900 rounded-lg p-3 relative">
                                <div class="text-center text-xs text-cyan-400 mb-2 tracking-widest">Vector VN1610</div>
                                <!-- Status 三色灯 -->
                                <div class="flex items-center gap-2 mb-2">
                                    <span class="text-[10px] text-slate-400 w-14">Status</span>
                                    <div class="flex gap-1.5">
                                        <span id="hw-led-red" class="w-3 h-3 rounded-full bg-slate-700 border border-slate-600 transition-all"></span>
                                        <span id="hw-led-yellow" class="w-3 h-3 rounded-full bg-yellow-500 transition-all shadow-[0_0_6px_rgba(234,179,8,0.7)]"></span>
                                        <span id="hw-led-green" class="w-3 h-3 rounded-full bg-slate-700 border border-slate-600 transition-all"></span>
                                    </div>
                                    <span id="hw-status-text" class="text-[10px] text-yellow-400">初始化中</span>
                                </div>
                                <!-- CH1-CH4 通道灯 -->
                                <div class="space-y-1">
                                    ${[1,2,3,4].map(n => `
                                        <div class="flex items-center gap-2">
                                            <span class="text-[10px] text-slate-400 w-14">CH${n}</span>
                                            <span id="hw-ch${n}" class="w-3 h-3 rounded-full bg-slate-700 border border-slate-600 transition-all"></span>
                                            <span class="text-[10px] text-slate-500">CAN (未连接)</span>
                                        </div>
                                    `).join('')}
                                </div>
                                <!-- USB 口 -->
                                <div class="mt-3 pt-2 border-t border-slate-600 flex items-center justify-between">
                                    <span class="text-[10px] text-slate-400">USB 3.0 Type-B</span>
                                    <span id="hw-usb-led" class="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                                </div>
                            </div>
                            <!-- 背面接口 -->
                            <div class="mt-3 bg-slate-900 rounded p-2 text-center text-[10px] text-slate-500">
                                DB9 Connectors ×4 | 电源: USB 供电 | 接口: CAN/CAN FD/LIN
                            </div>
                            <button onclick="hwConnect()" id="hw-btn"
                                    class="w-full mt-3 px-3 py-2 rounded-lg text-xs font-bold bg-cyan-500 hover:bg-cyan-600 text-white transition-all">
                                🔌 模拟：VN1610 接 ECU 总线并开启测量
                            </button>
                            <button onclick="hwDisconnect()" 
                                    class="w-full mt-2 px-3 py-2 rounded-lg text-xs font-bold bg-slate-600 hover:bg-slate-500 text-white transition-all">
                                ⏹ 断开 / 触发 BUS OFF
                            </button>
                        </div>
                    </div>

                    <!-- 右侧说明 -->
                    <div class="lg:col-span-3 space-y-3">
                        <div class="p-3 rounded-lg border-l-4 border-yellow-500 bg-yellow-50">
                            <div class="font-bold text-yellow-800 text-sm mb-1">⚠️ 初始状态（黄色灯亮）</div>
                            <div class="text-xs text-slate-600">橘黄色 = 绿色+红色同时亮，是 VN1610 上电初始化期间的状态，几秒后自动消失变成绿色闪烁。</div>
                        </div>
                        <div class="p-3 rounded-lg border-l-4 border-emerald-500 bg-emerald-50">
                            <div class="font-bold text-emerald-800 text-sm mb-1">🟢 绿色闪烁 = USB 已连通但未测量</div>
                            <div class="text-xs text-slate-600">刚插上 USB、未启动测量（Offline/Simulation 模式）时的状态。</div>
                        </div>
                        <div class="p-3 rounded-lg border-l-4 border-cyan-500 bg-cyan-50">
                            <div class="font-bold text-cyan-800 text-sm mb-1">🟢 绿色常亮 = 在线测量中（RealBus + Online）</div>
                            <div class="text-xs text-slate-600">当 VN1610 接上实车 ECU 总线、且 CANoe 点了黄色闪电图标（Start Measurement）后，通道上有真实数据流入流出 → 绿色常亮。</div>
                        </div>
                        <div class="p-3 rounded-lg border-l-4 border-red-500 bg-red-50">
                            <div class="font-bold text-red-800 text-sm mb-1">🔴 红色 = BUS OFF / 硬件故障</div>
                            <div class="text-xs text-slate-600">通道持续错误帧触发 BUS OFF，或者 VN1610 硬件损坏。需要断电复位 VN1610。</div>
                        </div>
                        <div class="p-3 rounded-lg border-l-4 border-violet-500 bg-violet-50">
                            <div class="font-bold text-violet-800 text-sm mb-1">🟡 CHx 橘黄色 = 通道上有错误帧</div>
                            <div class="text-xs text-slate-600">波特率不匹配、CAN_H/CAN_L 接反、终端电阻缺失等 → 错误帧激增 → CHx 变橘黄。排查第一要务：先断电测终端电阻是不是 60Ω。</div>
                        </div>
                    </div>
                </div>

                <!-- DB9 引脚图 -->
                <div class="mt-6">
                    <h3 class="font-bold text-slate-800 mb-3">🔌 DB9 接口引脚定义（Vector 标准）</h3>
                    <div class="grid grid-cols-2 sm:grid-cols-5 gap-2">
                        ${[
                            {pin: 1, sig: 'GND', color: 'bg-slate-300'},
                            {pin: 5, sig: 'CAN_L', color: 'bg-yellow-400'},
                            {pin: 6, sig: 'CAN_H', color: 'bg-orange-400'},
                            {pin: 9, sig: 'GND', color: 'bg-slate-300'},
                            {pin: 14, sig: 'CAN_L', color: 'bg-yellow-400'}
                        ].map(p => `
                            <div class="${p.color} rounded-lg p-2 text-center">
                                <div class="font-bold text-slate-800 text-sm">Pin ${p.pin}</div>
                                <div class="text-[10px] text-slate-700">${p.sig}</div>
                            </div>
                        `).join('')}
                    </div>
                </div>
            </div>

            <!-- 连接流程 -->
            <div class="bg-white rounded-2xl p-4 sm:p-6 shadow-sm">
                <h3 class="font-bold text-slate-800 mb-3">📋 连接 ECU 总线步骤（实车）</h3>
                <div class="space-y-2">
                    ${[
                        '断电！总线两端各有 120Ω 终端电阻（总共 60Ω），万用表验证',
                        'VN1610 用 USB 接笔记本（建议后置 USB 口，供电更稳）',
                        'DB9 Pin6=CAN_H → ECU 的 CAN_H；Pin14=CAN_L → ECU 的 CAN_L；Pin5/1=GND → GND',
                        '打开 Vector Hardware Config，VN1610 显示 Ready ✅ 绿色',
                        '给 ECU 上电（12V），VN1610 Status 灯 由黄变绿',
                        '打开 CANoe → 新建工程 → Measurement Setup → Hardware Config 选 VN1610 CH1',
                        '点 ▶ Start Measurement (F5)，CH1 指示灯 绿色常亮 = 有报文在流！'
                    ].map((s,i) => `
                        <div class="flex gap-3 items-start">
                            <div class="w-6 h-6 flex-shrink-0 bg-gradient-to-br from-cyan-500 to-emerald-500 text-white rounded-full flex items-center justify-center font-bold text-xs">${i+1}</div>
                            <div class="text-xs sm:text-sm text-slate-700 pt-0.5">${s}</div>
                        </div>
                    `).join('')}
                </div>
            </div>
        </div>
    `;
}

function hwConnect() {
    // 模拟连接 ECU 总线 + 测量
    setHwStatus('green', '在线测量中 (RealBus)');
    setHwCh(1, 'green', '正常通信');
    setHwCh(2, 'green', '正常通信');
    setHwCh(3, 'off', '未使用');
    setHwCh(4, 'off', '未使用');
    showToast('🟢 VN1610 已连接 ECU 总线，开始收发报文！');
}
function hwDisconnect() {
    // 模拟断开
    setHwStatus('off', '未连接');
    [1,2,3,4].forEach(n => setHwCh(n, 'off', '未连接'));
    showToast('🔴 VN1610 已断开');
}
function setHwStatus(color, text) {
    const r = document.getElementById('hw-led-red');
    const y = document.getElementById('hw-led-yellow');
    const g = document.getElementById('hw-led-green');
    const t = document.getElementById('hw-status-text');
    if (r) r.className = 'w-3 h-3 rounded-full transition-all ' + (color === 'red' ? 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.8)]' : 'bg-slate-700 border border-slate-600');
    if (y) y.className = 'w-3 h-3 rounded-full transition-all ' + (color === 'yellow' ? 'bg-yellow-500 shadow-[0_0_6px_rgba(234,179,8,0.7)]' : 'bg-slate-700 border border-slate-600');
    if (g) g.className = 'w-3 h-3 rounded-full transition-all ' + (color === 'green' ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.9)]' : 'bg-slate-700 border border-slate-600');
    if (t) t.textContent = text;
    if (color === 'green') t.className = 'text-[10px] text-emerald-400';
    if (color === 'yellow') t.className = 'text-[10px] text-yellow-400';
    if (color === 'red') t.className = 'text-[10px] text-red-400';
}
function setHwCh(n, color, text) {
    const el = document.getElementById('hw-ch' + n);
    const label = el?.parentElement?.querySelector('span:last-child');
    if (!el) return;
    if (color === 'green') {
        el.className = 'w-3 h-3 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_6px_rgba(16,185,129,0.8)]';
    } else if (color === 'yellow') {
        el.className = 'w-3 h-3 rounded-full bg-yellow-500 shadow-[0_0_6px_rgba(234,179,8,0.7)]';
    } else if (color === 'red') {
        el.className = 'w-3 h-3 rounded-full bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.8)]';
    } else {
        el.className = 'w-3 h-3 rounded-full bg-slate-700 border border-slate-600';
    }
    if (label) {
        label.textContent = text;
        label.className = 'text-[10px]';
        if (color === 'green') label.classList.add('text-emerald-400');
        if (color === 'red') label.classList.add('text-red-400');
        if (color === 'yellow') label.classList.add('text-yellow-400');
    }
}
function bindHardwareSim() {}

/* ============ Tab 2: 软件配置 ============ */
function renderCanoeSoftware() {
    return `
        <div class="bg-white rounded-2xl p-4 sm:p-6 shadow-sm">
            <h2 class="text-lg sm:text-xl font-bold text-slate-800 mb-4">⚙️ CANoe 真实配置流程（Phoenixy 学习笔记版）</h2>
            <div class="flex overflow-x-auto scrollbar-hide mb-4 pb-2" id="sw-stepper"></div>
            <div id="sw-content" class="min-h-[300px]"></div>
        </div>
    `;
    bindSwStepper();
}
function bindSwStepper() {
    const sw = document.getElementById('sw-stepper');
    sw.innerHTML = CANOE_TIMELINE.map((s, i) => `
        <div class="flex items-center flex-shrink-0">
            <button onclick="canoeSwStep(${i})" id="sw-btn-${i}"
                    class="canoe-sw-step flex flex-col items-center text-center px-3 py-2 rounded-xl transition-all ${i === 0 ? 'bg-gradient-to-br from-cyan-500 to-emerald-500 text-white shadow-md' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}">
                <div class="w-8 h-8 rounded-full bg-white/20 ${i !== 0 ? 'text-slate-400' : ''} flex items-center justify-center font-bold text-sm">${s.step}</div>
                <div class="text-[10px] sm:text-xs font-semibold mt-1 whitespace-nowrap">${s.title}</div>
            </button>
            ${i < CANOE_TIMELINE.length - 1 ? '<div class="w-4 sm:w-6 h-0.5 bg-slate-200"></div>' : ''}
        </div>
    `).join('');
    window.canoeSwStep = function(idx) {
        document.querySelectorAll('.canoe-sw-step').forEach((btn, i) => {
            btn.className = 'canoe-sw-step flex flex-col items-center text-center px-3 py-2 rounded-xl transition-all ' +
                (i === idx ? 'bg-gradient-to-br from-cyan-500 to-emerald-500 text-white shadow-md' : 'bg-slate-100 text-slate-600 hover:bg-slate-200');
        });
        document.getElementById('sw-content').innerHTML = renderSwStep(idx);
    };
    document.getElementById('sw-content').innerHTML = renderSwStep(0);
}

function renderSwStep(idx) {
    const steps = [
        {
            title: 'Step 1 — 硬件驱动先装好！',
            body: `
                <p class="text-slate-700 text-sm leading-relaxed mb-3">
                    这一步最容易被跳过但最关键：先去 Vector 官网下载 <strong class="text-cyan-600">Vector Hardware Manager</strong>，
                    装完再插 VN1610 USB —— Windows 设备管理器里不能有黄色感叹号！
                </p>
                <div class="bg-red-50 border-l-4 border-red-500 p-3 rounded text-xs mb-3">
                    <strong>⚠️ 大坑：</strong>先插硬件再装驱动 → Windows 可能装错驱动 → VN1610 永远不亮。
                    正确顺序：<strong>装 Vector Hardware Manager → 再插 VN1610</strong>。
                </div>
                <div class="bg-slate-900 text-cyan-300 rounded-lg p-3 text-xs font-mono">
<span class="text-slate-500">// Vector Hardware Manager 里看到的设备树</span><br>
✓ VN1610  (Connected)<br>
├─ CH1  CAN  (Available)<br>
└─ CH2  CAN  (Available)
                </div>
            `
        },
        {
            title: 'Step 2 — 新建工程',
            body: `
                <p class="text-slate-700 text-sm leading-relaxed mb-3">
                    File → New Configuration → 选模板。常用：<strong>1ch 单 CAN</strong> 或 <strong>2ch 双 CAN</strong>。
                </p>
                <div class="grid sm:grid-cols-2 gap-2 mb-3">
                    <div class="bg-slate-50 rounded-lg p-3 text-xs border border-slate-200">
                        <strong class="text-cyan-600">Simulation Setup</strong><br>
                        改波特率、改硬件、加 IG 报文生成器的主入口
                    </div>
                    <div class="bg-slate-50 rounded-lg p-3 text-xs border border-slate-200">
                        <strong class="text-cyan-600">Database Editor</strong><br>
                        导入/编辑 DBC，定义报文和信号
                    </div>
                </div>
            `
        },
        {
            title: 'Step 3 — 波特率 + 硬件配置',
            body: `
                <p class="text-slate-700 text-sm leading-relaxed mb-3">
                    双击 Measurement Setup → 点 <strong class="text-cyan-600">Simulation Setup</strong>（上半那个面板的小闪电）→ 波特率改 <strong>500 kbps</strong>。
                    然后 <strong>Hardware → Hardware Config</strong>，把 VN1610 的 CH1 勾上。
                </p>
                <div class="bg-slate-900 rounded-lg p-3 text-xs font-mono text-cyan-300 mb-3">
<span class="text-emerald-400">Hardware Config 确认页</span><br>
┌─────────────────────────────────┐<br>
│ ✅ VN1610 (1234567)   Ready      │<br>
│   ├─ CH1 ✅ 500 kbps CAN        │<br>
│   └─ CH2 ❌ 未使用               │<br>
└─────────────────────────────────┘
                </div>
                <div class="text-xs text-amber-700 bg-amber-50 p-2 rounded border-l-4 border-amber-500">
                    ⚠️ 波特率必须和 ECU 实际总线一致！CANoe 500k / ECU 250k → 全是错误帧 → CH1 橘黄灯闪烁
                </div>
            `
        },
        {
            title: 'Step 4 — 插 IG 报文生成器',
            body: `
                <p class="text-slate-700 text-sm leading-relaxed mb-3">
                    在 Measurement Setup 里，找到 <strong>IG (Interactive Generator)</strong> 双色线位置 → 右键 → 
                    <strong>Insert CAN Interactive Generator</strong>。这是 CANoe 自动发周期报文的神器。
                </p>
                <div class="bg-slate-900 rounded-lg p-3 text-xs font-mono text-cyan-300 mb-3">
<span class="text-slate-500">// Measurement Setup 树结构</span><br>
CAN<br>
├─ VN1610 CH1<br>
├─ IG (Interactive Generator) ← <strong class="bg-cyan-500/30 px-1">右键这里 Insert</strong><br>
│   ├─ 0x100 EngineSpeed  [50ms]<br>
│   ├─ 0x200 ParkState    [100ms]<br>
│   └─ 0x123 SteeringAngle [50ms]<br>
└─ Trace Window
                </div>
            `
        },
        {
            title: 'Step 5 — 导入 DBC，看信号',
            body: `
                <p class="text-slate-700 text-sm leading-relaxed mb-3">
                    Database → Import Database File (.dbc)。导入后，所有报文和信号都变成有名字的，不再是看不懂的十六进制。
                    在 Database Editor 里可以 <strong>Message 右键 → Add Signal</strong>、拖拽信号到正确字节位置。
                </p>
                <div class="grid sm:grid-cols-2 gap-2 mb-3">
                    <div class="bg-cyan-50 rounded-lg p-3 text-xs border border-cyan-200">
                        <strong class="text-cyan-700">没 DBC 时</strong><br>
                        <code class="text-slate-500">0.01234  0x100  FF 2B 00 00 ...</code><br>
                        ← 看不懂的一坨字节
                    </div>
                    <div class="bg-emerald-50 rounded-lg p-3 text-xs border border-emerald-200">
                        <strong class="text-emerald-700">有 DBC 后</strong><br>
                        <code class="text-emerald-600">EngineData  EngineSpeed=1100 rpm</code><br>
                        ← 一目了然的信号
                    </div>
                </div>
            `
        },
        {
            title: 'Step 6 — Graphics Window 看实时曲线',
            body: `
                <p class="text-slate-700 text-sm leading-relaxed mb-3">
                    这是 CANoe 最强大的功能！Window → Graphics Window → 从 Symbol Explorer 把信号<strong>拖进图表</strong>。
                    车辆加减速场景常用：<strong>车速 VehicleSpeed（0→100→0 循环）、纵向加速度 LongAccel</strong>。
                </p>
                <div class="bg-gradient-to-br from-slate-900 to-slate-800 rounded-lg p-3 text-[10px] font-mono text-emerald-300 mb-3">
<span class="text-slate-400">// Graphics Window 实时波形示意</span><br>
VehicleSpeed (km/h)│  ╱╲      ← 0→100→0 三角波循环  │<br>
LongAccel (g)      │  +__--   ← 加速 +0.3g / 减速 -0.3g  │<br>
                </div>
                <button onclick="canoeSetTab('simulator')" class="w-full bg-gradient-to-r from-cyan-500 to-emerald-500 text-white font-bold py-2.5 rounded-lg">
                    🎯 去模拟实验台亲手试！
                </button>
            `
        },
        {
            title: 'Step 7 — Diagnostics 配 UDS',
            body: `
                <p class="text-slate-700 text-sm leading-relaxed mb-3">
                    Diagnostics & XCP → 右键 Diagnostic/ISO TP → Add UDS。扩展会话勾 <strong>29bit</strong>，标准帧取消勾选。
                    然后在 <strong>Basic</strong> 里依次配：
                </p>
                <div class="bg-slate-900 rounded-lg p-3 text-xs font-mono text-cyan-300 mb-3">
<span class="text-emerald-400">Diagnostic Layer 配置树</span><br>
├─ Service 10 (Session Control)<br>
│   ├─ 10 01  Default (读取 DTC、基础诊断)<br>
│   ├─ 10 02  Programming (刷写专用)<br>
│   └─ 10 03  Extended (解锁后能读写)<br>
└─ Service 27 (Security Access)<br>
    ├─ 27 01 → SUC 67 01  / Fail 7F<br>
    ├─ 27 02 → SUC 67 02<br>
    ├─ 27 03 → SUC 67 03  (二级解锁)<br>
    └─ 27 11 → SUC 67 11  (编程解锁)
                </div>
                <div class="text-[10px] text-slate-500">
                    💡 1001 能读数据但不能写；2701→2702→2703 解锁后才能写 DID、清 DTC、控制 I/O；2711/2712 专门用于刷写。
                </div>
                <button onclick="canoeSetTab('simulator')" class="mt-2 w-full bg-gradient-to-r from-cyan-500 to-emerald-500 text-white font-bold py-2.5 rounded-lg">
                    🔧 去模拟实验台试 Diagnostics
                </button>
            `
        }
    ];
    return `<div class="text-sm"><div class="font-bold text-slate-800 mb-2 text-base">${steps[idx].title}</div>${steps[idx].body}</div>`;
}

/* ============ Tab 3: 模拟实验台 ============ */
function renderCanoeWorkbench() {
    return `
        <div class="bg-slate-900 rounded-2xl overflow-hidden shadow-xl">
            ${renderWbHeader()}
            <div class="flex flex-col lg:flex-row">
                <div class="lg:w-72 border-b lg:border-b-0 lg:border-r border-slate-700 bg-slate-800 p-4 space-y-4">
                    ${renderWbLeftPanel()}
                </div>
                <div class="flex-1 p-3 sm:p-4 space-y-4">
                    <div class="grid lg:grid-cols-2 gap-4">
                        <div class="bg-slate-950 rounded-xl border border-slate-700 overflow-hidden">
                            <div class="bg-slate-800 px-3 py-2 border-b border-slate-700 flex items-center justify-between">
                                <div class="flex items-center gap-2 text-xs font-bold text-white">📋 Trace Window</div>
                                <span id="trace-stat" class="text-[10px] text-slate-400">总: 0  错误: 0</span>
                            </div>
                            <div id="trace-body" class="h-[240px] sm:h-[280px] lg:h-[320px] overflow-y-auto font-mono text-[10px] sm:text-xs leading-relaxed p-2"></div>
                        </div>
                        ${renderWbGraphics()}
                    </div>
                    ${renderWbDiagnostics()}
                    ${renderWbStats()}
                </div>
            </div>
        </div>
    `;
}

function renderWbHeader() {
    return `
        <div class="bg-gradient-to-r from-slate-800 to-slate-700 px-3 sm:px-5 py-3 flex items-center justify-between gap-3 border-b border-slate-700">
            <div class="flex items-center gap-2 sm:gap-3">
                <div class="text-lg sm:text-xl">🖥️</div>
                <div>
                    <div class="text-white font-bold text-sm sm:text-base">CANoe - 模拟实验台</div>
                    <div class="text-slate-400 text-[10px] sm:text-xs">VN1610 · CH1 · 500 kbps · CAN 2.0B  <span id="meas-ind" class="ml-2"></span></div>
                </div>
            </div>
            <div class="flex items-center gap-1.5 sm:gap-2">
                <button id="btn-measure" onclick="canoeToggleMeasure()"
                        class="px-3 sm:px-4 py-2 rounded-lg font-bold text-xs sm:text-sm bg-emerald-500 hover:bg-emerald-600 text-white shadow-md transition-all">▶ 开始</button>
                <button id="btn-record" onclick="canoeToggleRecord()" disabled
                        class="px-3 sm:px-4 py-2 rounded-lg font-bold text-xs sm:text-sm bg-slate-600 text-slate-400 shadow-md transition-all disabled:cursor-not-allowed">⏺ 录制</button>
                <button onclick="canoeClearTrace()"
                        class="px-3 sm:px-4 py-2 rounded-lg font-bold text-xs sm:text-sm bg-slate-600 hover:bg-slate-500 text-white shadow-md transition-all">🗑</button>
            </div>
        </div>
    `;
}

function renderWbLeftPanel() {
    return `
        <!-- VN1610 指示灯 -->
        <div>
            <div class="text-cyan-400 font-semibold text-xs mb-2">🖥️ VN1610 Status</div>
            <div class="bg-slate-900 rounded-lg p-3 text-[10px] font-mono">
                <div class="flex items-center gap-2 mb-1.5">
                    <span class="text-slate-400 w-12">Status</span>
                    <span id="wb-led-red" class="w-2.5 h-2.5 rounded-full bg-slate-700"></span>
                    <span id="wb-led-yellow" class="w-2.5 h-2.5 rounded-full bg-yellow-500"></span>
                    <span id="wb-led-green" class="w-2.5 h-2.5 rounded-full bg-slate-700"></span>
                    <span id="wb-status-text" class="text-yellow-400 ml-1">初始化</span>
                </div>
                ${[1,2,3,4].map(n => `
                    <div class="flex items-center gap-2 mb-1">
                        <span class="text-slate-400 w-12">CH${n}</span>
                        <span id="wb-ch${n}" class="w-2 h-2 rounded-full bg-slate-700"></span>
                        <span class="text-slate-500">${n===1?'500k CAN':'未使用'}</span>
                    </div>
                `).join('')}
            </div>
        </div>

        <!-- 手动发送 -->
        <div>
            <div class="text-cyan-400 font-semibold text-xs mb-2">📤 手动发送</div>
            <div class="space-y-2">
                <div>
                    <label class="text-[10px] text-slate-400">ID (hex, 支持 29bit 如 0x18F00402)</label>
                    <input id="tx-id" type="text" value="0x100" class="w-full bg-slate-900 text-white text-xs px-2 py-1.5 rounded border border-slate-700 focus:border-cyan-500 outline-none font-mono">
                </div>
                <div>
                    <label class="text-[10px] text-slate-400">Data (8 字节 hex 空格分隔)</label>
                    <input id="tx-data" type="text" value="00 1F 00 00 00 00 00 00" class="w-full bg-slate-900 text-white text-xs px-2 py-1.5 rounded border border-slate-700 focus:border-cyan-500 outline-none font-mono">
                </div>
                <div class="flex gap-2">
                    <div class="flex-1">
                        <label class="text-[10px] text-slate-400">周期(ms) 0=单次</label>
                        <input id="tx-cycle" type="number" value="0" min="0" class="w-full bg-slate-900 text-white text-xs px-2 py-1.5 rounded border border-slate-700 focus:border-cyan-500 outline-none">
                    </div>
                    <button onclick="canoeUserSend()" class="px-3 py-2 rounded-lg text-xs font-bold bg-cyan-500 hover:bg-cyan-600 text-white h-[34px] self-end">▶ 发送</button>
                </div>
            </div>
        </div>

        <!-- 快捷预设 -->
        <div>
            <div class="text-cyan-400 font-semibold text-xs mb-2">⚡ 快捷报文（车辆信号）</div>
            <div class="grid grid-cols-2 gap-1.5">
                ${SIM_SIGNALS.map((m, i) => `
                    <button onclick="canoePreset('${m.id}', '${m.data().join(' ')}', ${m.cycle})"
                            title="${m.desc}"
                            class="bg-slate-700 hover:bg-slate-600 text-white text-[9px] sm:text-[10px] px-1.5 py-1.5 rounded font-mono transition-all text-left">
                        ${m.id}<br><span class="text-[8px] text-slate-400 leading-tight">${m.desc.split('(')[0].trim()}</span>
                    </button>
                `).join('')}
                <button onclick="canoeInjectError()"
                        class="col-span-2 bg-red-600 hover:bg-red-700 text-white text-[10px] px-2 py-1.5 rounded font-bold">
                    ⚠️ 注入错误帧 (模拟 CHx 变橘黄)
                </button>
            </div>
        </div>

        <div id="cyclic-list-wrap" class="hidden">
            <div class="text-emerald-400 font-semibold text-xs mb-2">🔄 周期发送中</div>
            <div id="cyclic-list" class="space-y-1"></div>
        </div>
    `;
}

function renderWbGraphics() {
    return `
        <div class="bg-slate-950 rounded-xl border border-slate-700 overflow-hidden">
            <div class="bg-slate-800 px-3 py-2 border-b border-slate-700 flex items-center justify-between flex-wrap gap-1">
                <div class="flex items-center gap-2 text-xs font-bold text-white">📊 Graphics Window (车速信号)</div>
                <span id="gfx-stat" class="text-[10px] text-slate-400">实时波形</span>
            </div>
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-0 border-b border-slate-700">
                ${renderGfxMini('VehicleSpeed', '车速 km/h', 0, 100, '#10b981')}
                ${renderGfxMini('LongAccel', '纵向加速度 g', -1, 1, '#f472b6')}
            </div>
            <div class="p-3 border-b border-slate-700">
                <div class="text-[10px] text-slate-400 mb-2 flex items-center justify-between">
                    <span>🚗 加减速阶段</span>
                    <span id="speed-phase-badge" class="px-2 py-0.5 rounded text-[10px] bg-slate-700 text-slate-300">—</span>
                </div>
                <div class="grid grid-cols-3 gap-1.5">
                    ${[{k:'accel',n:'加速',c:'emerald'},{k:'cruise',n:'匀速',c:'cyan'},{k:'decel',n:'减速',c:'rose'}].map(p => `
                        <div class="text-center text-[9px]">
                            <div id="phase-dot-${p.k}" class="w-full h-6 rounded bg-slate-800 flex items-center justify-center transition-all border border-slate-700">${p.n}</div>
                        </div>
                    `).join('')}
                </div>
            </div>
            <div class="text-[10px] text-slate-500 p-3">
                💡 点击 <span class="text-cyan-400">▶ 开始</span> 启动测量 → 车速曲线自动从 <span class="text-emerald-400">0 加速到 100</span>，再 <span class="text-rose-400">减速回到 0</span>，循环往复（20s/周期）
            </div>
        </div>
    `;
}

function renderGfxMini(key, label, min, max, color) {
    return `
        <div class="p-2 sm:p-3 border-b sm:border-b-0 sm:border-r border-slate-700">
            <div class="flex items-center justify-between text-[10px] mb-1">
                <span class="text-slate-400">${label}</span>
                <span id="gfx-val-${key}" class="font-mono font-bold" style="color:${color}">—</span>
            </div>
            <svg id="gfx-svg-${key}" viewBox="0 0 200 40" preserveAspectRatio="none" class="w-full h-10">
                <line x1="0" y1="20" x2="200" y2="20" stroke="#334155" stroke-width="0.5" stroke-dasharray="2 2"/>
                <path d="" fill="none" stroke="${color}" stroke-width="1.2" id="gfx-path-${key}"/>
            </svg>
            <div class="text-[8px] text-slate-600 flex justify-between"><span>${max}</span><span>${min}</span></div>
        </div>
    `;
}

function renderWbDiagnostics() {
    return `
        <div class="bg-slate-950 rounded-xl border border-slate-700 overflow-hidden">
            <div class="bg-slate-800 px-3 py-2 border-b border-slate-700 text-xs font-bold text-white flex items-center justify-between">
                🔧 Diagnostics Console (UDS)
                <span id="uds-session" class="text-[10px] text-cyan-400">默认会话 10 01</span>
            </div>
            <div class="p-3 text-xs space-y-2">
                <div class="text-slate-400 text-[10px] mb-1">切换会话：</div>
                <div class="flex gap-1.5 flex-wrap">
                    <button onclick="udsSend('10 01','Default Session')" class="px-2.5 py-1.5 rounded bg-slate-700 hover:bg-slate-600 text-white">10 01 默认</button>
                    <button onclick="udsSend('10 03','Extended Session')" class="px-2.5 py-1.5 rounded bg-violet-600 hover:bg-violet-700 text-white">10 03 扩展</button>
                    <button onclick="udsSend('10 02','Programming Session')" class="px-2.5 py-1.5 rounded bg-orange-600 hover:bg-orange-700 text-white">10 02 编程</button>
                </div>
                <div class="text-slate-400 text-[10px] mt-2 mb-1">安全访问 (扩展会话才能用)：</div>
                <div class="flex gap-1.5 flex-wrap">
                    <button onclick="udsSend('27 01','SecurityAccess Level 1')" class="px-2.5 py-1.5 rounded bg-emerald-600 hover:bg-emerald-700 text-white">27 01 解锁</button>
                    <button onclick="udsSend('22 F1 90','Read DID F190 硬件版本')" class="px-2.5 py-1.5 rounded bg-cyan-600 hover:bg-cyan-700 text-white">22 F1 90 读版本</button>
                    <button onclick="udsSend('19 02','Read DTC 已存储')" class="px-2.5 py-1.5 rounded bg-amber-600 hover:bg-amber-700 text-white">19 02 读故障码</button>
                    <button onclick="udsSend('14 FF FF FF','Clear DTC')" class="px-2.5 py-1.5 rounded bg-red-600 hover:bg-red-700 text-white">14 清故障码</button>
                </div>
                <div id="uds-log" class="mt-2 bg-black rounded p-2 text-[10px] font-mono h-20 overflow-y-auto text-emerald-400 border border-slate-800">
                    <span class="text-slate-500">// Diagnostics Console 已就绪</span>
                </div>
            </div>
        </div>
    `;
}

function renderWbStats() {
    return `
        <div class="grid grid-cols-2 sm:grid-cols-4 gap-2">
            <div class="bg-slate-800 rounded-lg p-2 text-center">
                <div id="stat-rate" class="text-lg font-bold text-cyan-400">0</div>
                <div class="text-[9px] text-slate-400">报文/秒</div>
            </div>
            <div class="bg-slate-800 rounded-lg p-2 text-center">
                <div id="stat-load" class="text-lg font-bold text-emerald-400">0%</div>
                <div class="text-[9px] text-slate-400">总线负载</div>
            </div>
            <div class="bg-slate-800 rounded-lg p-2 text-center">
                <div id="stat-error" class="text-lg font-bold text-amber-400">0</div>
                <div class="text-[9px] text-slate-400">错误帧</div>
            </div>
            <div class="bg-slate-800 rounded-lg p-2 text-center">
                <div id="stat-rec" class="text-lg font-bold text-violet-400">0</div>
                <div class="text-[9px] text-slate-400">录制帧数</div>
            </div>
        </div>
    `;
}

/* ===== Workbench 交互 ===== */
function bindWorkbenchSim() {
    CANOE_SIM_STATE.messages = [];
    CANOE_SIM_STATE.isMeasuring = false;
    CANOE_SIM_STATE.isRecording = false;
    CANOE_SIM_STATE.userMessageTimers = {};
    CANOE_SIM_STATE.startTime = 0;
    Object.keys(CANOE_SIM_STATE.signalBuf).forEach(k => CANOE_SIM_STATE.signalBuf[k] = []);
    clearWbGraphics();
    renderTrace();
    renderCyclicList();
    // 初始 VN1610 灯状态
    wbSetLed('yellow', '初始化中');
    [1,2,3,4].forEach(n => wbSetCh(n, 'off'));
}

function wbSetLed(color, text) {
    const r = document.getElementById('wb-led-red'), y = document.getElementById('wb-led-yellow'), g = document.getElementById('wb-led-green'), t = document.getElementById('wb-status-text');
    if (r) r.className = 'w-2.5 h-2.5 rounded-full ' + (color === 'red' ? 'bg-red-500 shadow-[0_0_6px_rgba(239,68,68,0.8)]' : 'bg-slate-700');
    if (y) y.className = 'w-2.5 h-2.5 rounded-full ' + (color === 'yellow' ? 'bg-yellow-500 shadow-[0_0_6px_rgba(234,179,8,0.7)]' : 'bg-slate-700');
    if (g) g.className = 'w-2.5 h-2.5 rounded-full ' + (color === 'green' ? 'bg-emerald-500 shadow-[0_0_6px_rgba(16,185,129,0.9)]' : 'bg-slate-700');
    if (t) { t.textContent = text; t.className = 'ml-1 text-[10px] ' + ({green:'text-emerald-400',yellow:'text-yellow-400',red:'text-red-400'}[color]||''); }
}
function wbSetCh(n, color) {
    const el = document.getElementById('wb-ch' + n);
    if (!el) return;
    if (color === 'green') el.className = 'w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_5px_rgba(16,185,129,0.8)] animate-pulse';
    else if (color === 'yellow') el.className = 'w-2 h-2 rounded-full bg-yellow-500 shadow-[0_0_5px_rgba(234,179,8,0.7)]';
    else if (color === 'red') el.className = 'w-2 h-2 rounded-full bg-red-500 shadow-[0_0_5px_rgba(239,68,68,0.8)]';
    else el.className = 'w-2 h-2 rounded-full bg-slate-700';
}

function canoeToggleMeasure() {
    const s = CANOE_SIM_STATE;
    const btn = document.getElementById('btn-measure');
    const recBtn = document.getElementById('btn-record');
    const measInd = document.getElementById('meas-ind');
    s.isMeasuring = !s.isMeasuring;
    if (s.isMeasuring) {
        s.startTime = Date.now();
        btn.textContent = '⏹ 停止';
        btn.className = 'px-3 sm:px-4 py-2 rounded-lg font-bold text-xs sm:text-sm bg-red-500 hover:bg-red-600 text-white shadow-md transition-all';
        recBtn.disabled = false;
        recBtn.className = 'px-3 sm:px-4 py-2 rounded-lg font-bold text-xs sm:text-sm bg-red-500/80 hover:bg-red-500 text-white shadow-md transition-all';
        measInd.innerHTML = '<span class="text-emerald-400">🟢 Online + RealBus + 测量中</span>';
        wbSetLed('green', 'Online + RealBus 测量中');
        [1,2].forEach(n => wbSetCh(n, 'green'));
        startAutoGenerate();
    } else {
        btn.textContent = '▶ 开始';
        btn.className = 'px-3 sm:px-4 py-2 rounded-lg font-bold text-xs sm:text-sm bg-emerald-500 hover:bg-emerald-600 text-white shadow-md transition-all';
        recBtn.disabled = true;
        recBtn.className = 'px-3 sm:px-4 py-2 rounded-lg font-bold text-xs sm:text-sm bg-slate-600 text-slate-400 shadow-md transition-all disabled:cursor-not-allowed';
        measInd.innerHTML = '<span class="text-slate-500">⚪ 已停止</span>';
        if (s.isRecording) canoeToggleRecord();
        wbSetLed('yellow', '停止 (Simulation 模式)');
        [1,2].forEach(n => wbSetCh(n, 'off'));
        stopAutoGenerate();
        stopAllCyclic();
    }
}

function canoeToggleRecord() {
    const s = CANOE_SIM_STATE;
    const btn = document.getElementById('btn-record');
    s.isRecording = !s.isRecording;
    if (s.isRecording) {
        s.recStartIdx = s.messages.length;
        btn.textContent = '⏹ 停止录制';
        btn.className = 'px-3 sm:px-4 py-2 rounded-lg font-bold text-xs sm:text-sm bg-red-700 hover:bg-red-800 text-white shadow-md transition-all';
        showToast('⏺ 开始录制，点击停止后所有红色高亮报文即为 Log');
    } else {
        btn.textContent = '⏺ 录制';
        btn.className = 'px-3 sm:px-4 py-2 rounded-lg font-bold text-xs sm:text-sm bg-emerald-600 hover:bg-emerald-700 text-white shadow-md transition-all';
        showToast('✅ 录制完成！Log 已生成（当前模拟环境未保存到文件，真实 CANoe 会存 .blf 格式）');
    }
    renderTrace();
}

function canoeClearTrace() { CANOE_SIM_STATE.messages = []; CANOE_SIM_STATE.isRecording = false; clearWbGraphics(); renderTrace(true); }

function canoeUserSend() {
    const idRaw = document.getElementById('tx-id').value.trim();
    const dataRaw = document.getElementById('tx-data').value.trim();
    const cycle = parseInt(document.getElementById('tx-cycle').value) || 0;
    const id = idRaw.startsWith('0x') ? idRaw : '0x' + idRaw;
    const bytes = dataRaw.split(/\s+/).filter(Boolean).map(b => parseInt(b, 16));
    const data = bytes.length ? bytes : [0,0,0,0,0,0,0,0];
    if (cycle > 0) {
        const key = id + '_' + cycle + '_user';
        stopCyclic(key);
        CANOE_SIM_STATE.userMessageTimers[key] = setInterval(() => {
            if (CANOE_SIM_STATE.isMeasuring) pushMessage(buildSimMsg({ id, data, cycle, isUser: true, name: 'UserSend' }));
        }, cycle);
        renderCyclicList();
    }
    pushMessage(buildSimMsg({ id, data, cycle, isUser: true, name: 'UserSend' }));
    if (!CANOE_SIM_STATE.isMeasuring) renderTrace();
}

function canoePreset(id, dataStr, cycle) {
    document.getElementById('tx-id').value = id;
    document.getElementById('tx-data').value = dataStr;
    document.getElementById('tx-cycle').value = cycle;
    canoeUserSend();
}

function canoeInjectError() {
    // 触发 CH1 变橘黄
    wbSetCh(1, 'yellow');
    setTimeout(() => { if (CANOE_SIM_STATE.isMeasuring) wbSetCh(1, 'green'); }, 1500);
    pushMessage({
        time: relativeTime(), id: 'Err', name: 'Error Frame', dlc: '-',
        data: ['StuffError'], count: 1, isUser: true, isError: true
    });
}

function buildSimMsg({ id, data, cycle, isUser, name }) {
    const preset = SIM_SIGNALS.find(p => p.id.toLowerCase() === id.toLowerCase());
    const finalData = preset && !isUser ? preset.data() : data;
    const dlc = finalData.length;
    const msg = {
        time: relativeTime(), id,
        name: name || preset?.name || 'Unknown',
        dlc, data: finalData.map(b => ('0' + (typeof b === 'number' ? b.toString(16).toUpperCase() : '').slice(-2))),
        count: 1, isUser: !!isUser, isError: false
    };
    // 关键修复：把 preset 的信号解析方法挂到 msg 上，让 Graphics 曲线能调用
    if (preset && !isUser) {
        if (preset.extract) msg.extract = preset.extract;
        if (preset.extractLong) msg.extractLong = preset.extractLong;
        if (preset.extractLat) msg.extractLat = preset.extractLat;
    }
    return msg;
}

function relativeTime() {
    if (!CANOE_SIM_STATE.startTime) CANOE_SIM_STATE.startTime = Date.now();
    return ((Date.now() - CANOE_SIM_STATE.startTime) / 1000).toFixed(4);
}

function startAutoGenerate() {
    CANOE_SIM_STATE.timerId = setInterval(() => {
        if (!CANOE_SIM_STATE.isMeasuring) return;
        SIM_SIGNALS.forEach(m => {
            if (m.cycle > 0 && Math.random() < 0.6) {
                pushMessage(buildSimMsg({ id: m.id, data: m.data(), cycle: m.cycle, name: m.name }));
                updateGraphics(CANOE_SIM_STATE.messages[CANOE_SIM_STATE.messages.length - 1]);
            }
        });
    }, 60);
}

function stopAutoGenerate() {
    if (CANOE_SIM_STATE.timerId) { clearInterval(CANOE_SIM_STATE.timerId); CANOE_SIM_STATE.timerId = null; }
}

function stopAllCyclic() {
    Object.keys(CANOE_SIM_STATE.userMessageTimers).forEach(k => clearInterval(CANOE_SIM_STATE.userMessageTimers[k]));
    CANOE_SIM_STATE.userMessageTimers = {}; renderCyclicList();
}
function stopCyclic(key) { clearInterval(CANOE_SIM_STATE.userMessageTimers[key]); delete CANOE_SIM_STATE.userMessageTimers[key]; renderCyclicList(); }

function renderCyclicList() {
    const wrap = document.getElementById('cyclic-list-wrap');
    const list = document.getElementById('cyclic-list');
    if (!wrap) return;
    const keys = Object.keys(CANOE_SIM_STATE.userMessageTimers);
    if (!keys.length) { wrap.classList.add('hidden'); return; }
    wrap.classList.remove('hidden');
    list.innerHTML = keys.map(k => {
        const parts = k.split('_');
        return `<div class="flex items-center justify-between bg-slate-900 rounded p-1.5 text-[10px]">
            <span class="font-mono text-cyan-400">${parts[0]} · ${parts[1]}ms</span>
            <button onclick="stopCyclic('${k}')" class="text-red-400 hover:text-red-300">✕</button>
        </div>`;
    }).join('');
}

/* ===== Graphics 实时曲线 ===== */
function updateGraphics(msg) {
    const buf = CANOE_SIM_STATE.signalBuf;
    if (msg.isError || msg.data === undefined) return;
    const b = msg.data.map(h => parseInt(h, 16));
    // VehicleSpeed from 0x101 —— 0→100→0 加减速三角波
    if (msg.id === '0x101' && msg.extract) {
        const val = msg.extract(b);
        buf.VehicleSpeed.push(val);
        if (buf.VehicleSpeed.length > 100) buf.VehicleSpeed.shift();
        drawLine('VehicleSpeed', val, 0, 100);
        // 同步更新加减速阶段指示
        updateSpeedPhase(val);
    }
    // LongAccel from 0x400 —— 加速段 +0.3g / 减速段 -0.3g
    if (msg.id === '0x400') {
        const sim = SIM_SIGNALS.find(s => s.id === '0x400');
        if (sim) {
            const longVal = sim.extractLong(b);
            buf.LongAccel.push(longVal);
            if (buf.LongAccel.length > 100) buf.LongAccel.shift();
            drawLine('LongAccel', longVal, -1, 1);
        }
    }
}

function updateSpeedPhase(speed) {
    const badge = document.getElementById('speed-phase-badge');
    const accelDot = document.getElementById('phase-dot-accel');
    const cruiseDot = document.getElementById('phase-dot-cruise');
    const decelDot = document.getElementById('phase-dot-decel');
    if (!badge) return;
    const buf = CANOE_SIM_STATE.signalBuf.VehicleSpeed || [];
    const prev = buf.length > 1 ? buf[buf.length - 2] : speed;
    let phase, label, color;
    if (speed > prev + 0.05)      { phase = 'accel';  label = '加速中 ↑'; color = 'emerald'; }
    else if (speed < prev - 0.05) { phase = 'decel';  label = '减速中 ↓'; color = 'rose'; }
    else                          { phase = 'cruise'; label = '匀速 →';  color = 'cyan'; }
    badge.textContent = label;
    badge.className = 'px-2 py-0.5 rounded text-[10px] text-white ' +
        ({emerald:'bg-emerald-600',cyan:'bg-cyan-600',rose:'bg-rose-600'}[color] || 'bg-slate-700');
    const map = { accel: accelDot, cruise: cruiseDot, decel: decelDot };
    Object.entries(map).forEach(([k, el]) => {
        if (!el) return;
        if (k === phase) el.className = 'w-full h-6 rounded flex items-center justify-center transition-all border text-white ' +
            ({emerald:'bg-emerald-500 border-emerald-400',cyan:'bg-cyan-500 border-cyan-400',rose:'bg-rose-500 border-rose-400'}[color] || 'bg-slate-700');
        else el.className = 'w-full h-6 rounded bg-slate-800 flex items-center justify-center transition-all border border-slate-700 text-slate-500';
    });
}

function drawLine(key, currentVal, min, max) {
    const svg = document.getElementById('gfx-svg-' + key);
    const path = document.getElementById('gfx-path-' + key);
    const valEl = document.getElementById('gfx-val-' + key);
    if (!svg || !path) return;
    const buf = CANOE_SIM_STATE.signalBuf[key] || [];
    if (!buf.length) return;
    const w = 200, h = 40;
    const step = w / Math.max(1, buf.length - 1);
    let d = '';
    buf.forEach((v, i) => {
        const x = i * step;
        const clamped = Math.max(min, Math.min(max, v));
        const y = h - ((clamped - min) / (max - min)) * h;
        d += (i === 0 ? 'M' : 'L') + x.toFixed(1) + ',' + y.toFixed(1) + ' ';
    });
    path.setAttribute('d', d);
    if (valEl) valEl.textContent = (currentVal !== undefined ? currentVal.toFixed(1) : '—');
}

function clearWbGraphics() {
    ['VehicleSpeed','LongAccel'].forEach(k => {
        const path = document.getElementById('gfx-path-' + k);
        const valEl = document.getElementById('gfx-val-' + k);
        if (path) path.setAttribute('d', '');
        if (valEl) valEl.textContent = '—';
    });
    ['accel','cruise','decel'].forEach(k => {
        const dot = document.getElementById('phase-dot-' + k);
        if (dot) dot.className = 'w-full h-6 rounded bg-slate-800 flex items-center justify-center transition-all border border-slate-700 text-slate-500';
    });
    const badge = document.getElementById('speed-phase-badge');
    if (badge) { badge.textContent = '—'; badge.className = 'px-2 py-0.5 rounded text-[10px] bg-slate-700 text-slate-300'; }
}

/* ===== Diagnostics UDS ===== */
const UDS_RESPONSES = {
    '10 01':  { pos: '50 01', neg: '7F 10 12', session: '默认会话 10 01', ok: true },
    '10 02':  { pos: '50 02', neg: '7F 10 12', session: '编程会话 10 02', ok: true },
    '10 03':  { pos: '50 03', neg: '7F 10 12', session: '扩展会话 10 03', ok: true },
    '27 01':  { pos: '67 01', neg: '7F 27 33', msg: 'SecurityAccess 解锁成功 (需要先进入扩展会话)', require: 'extend' },
    '27 02':  { pos: '67 02', neg: '7F 27 33', msg: 'SecurityAccess SUC 02 返回' },
    '22 F1 90': { pos: '62 F1 90 01 02 03 04 05', neg: '7F 22 31', msg: 'Read DID F190 → 返回硬件版本' },
    '19 02':  { pos: '59 02 44 45 4D 4F', neg: '—', msg: 'Read DTC 0x454D (Engine Fault)' },
    '14 FF FF FF': { pos: '54', neg: '—', msg: 'Clear DTC 成功' }
};
let udsCurrentSession = 'default';

function udsSend(raw, name) {
    const resp = UDS_RESPONSES[raw.toUpperCase()];
    if (!resp) return appendUdsLog(`> ${raw}  [未知服务]`, 'text-amber-400');
    // 会话状态管理
    let isOk = true;
    if (resp.session) {
        udsCurrentSession = resp.session.includes('扩展') ? 'extend' : resp.session.includes('编程') ? 'programming' : 'default';
    }
    if (resp.require === 'extend' && udsCurrentSession !== 'extend') {
        appendUdsLog(`> ${raw}  (需要先 10 03 扩展会话)`, 'text-red-400');
        appendUdsLog(`  7F 27 33  [NRC: SecurityAccessDenied]`, 'text-red-400');
        return;
    }
    appendUdsLog(`> ${raw}  [${name}]`, 'text-cyan-400');
    setTimeout(() => {
        const pos = resp.pos || '';
        const neg = resp.neg;
        // 100ms 后返回正响应
        appendUdsLog(`< 7E8 ${pos}  [正响应 ${resp.msg || ''}]`, 'text-emerald-400');
        if (resp.session) document.getElementById('uds-session').textContent = '当前: ' + resp.session;
    }, 120);
}

function appendUdsLog(line, cls) {
    const log = document.getElementById('uds-log');
    if (!log) return;
    const div = document.createElement('div');
    div.className = cls + ' whitespace-pre-wrap';
    div.textContent = line;
    log.appendChild(div);
    log.scrollTop = log.scrollHeight;
}

/* ===== Trace 渲染（和 canoe-sim.js 前半一致） ===== */
function pushMessage(msg) {
    const s = CANOE_SIM_STATE;
    const last = s.messages[s.messages.length - 1];
    if (last && !msg.isError && !msg.isUser &&
        last.id === msg.id && last.name === msg.name && last.data.join() === msg.data.join()) {
        last.count++; last.time = msg.time;
    } else {
        s.messages.push(msg);
    }
    if (s.messages.length > 500) s.messages.shift();
    renderTrace();
}

function renderTrace(forceClear) {
    const body = document.getElementById('trace-body');
    if (!body) return;
    const s = CANOE_SIM_STATE;
    const msgs = s.messages;
    const errorCount = msgs.filter(m => m.isError).length;
    const recCount = s.isRecording ? (msgs.length - s.recStartIdx) : 0;
    document.getElementById('trace-stat').textContent = `总: ${msgs.length}  错误: ${errorCount}`;
    document.getElementById('stat-error').textContent = errorCount;
    document.getElementById('stat-rec').textContent = recCount;
    const now = Date.now();
    const elapsed = Math.max(1, (now - (s.startTime || now)) / 1000);
    document.getElementById('stat-rate').textContent = s.isMeasuring ? Math.floor(msgs.length / elapsed) : 0;
    document.getElementById('stat-load').textContent = s.isMeasuring ? (8 + (msgs.length % 15) + Math.random() * 5).toFixed(1) + '%' : '0%';
    if (!msgs.length) {
        body.innerHTML = forceClear ? '<div class="text-emerald-500 text-center py-10 text-xs">Trace 已清空 ✨ 点 ▶ 开始</div>' :
            '<div class="text-slate-600 text-center py-10"><div class="text-4xl mb-2">🟡</div>点左上角 ▶ 开始 启动测量</div>';
        return;
    }
    const colorMap = {};
    SIM_SIGNALS.forEach(m => colorMap[m.id] = m.color);
    const html = msgs.slice(-70).map((m, idx) => {
        const recCls = s.isRecording && idx >= (msgs.length - 70 - s.recStartIdx + msgs.length) ? 'bg-red-500/10' : '';
        // 更简单：如果在录制中且是新消息，红色标记 (recStartIdx 之后)
        const newMsgIdx = msgs.indexOf(m);
        const isRec = s.isRecording && newMsgIdx >= s.recStartIdx;
        const recCls2 = isRec ? 'bg-red-500/10 border-l-2 border-red-500/50' : 'border-l-2 border-transparent';
        const dataStr = m.data.map(d => `<span class="text-slate-400">${d}</span>`).join(' ');
        const idCls = colorMap[m.id] || (m.isUser ? 'text-violet-400' : 'text-slate-300');
        const nameCls = m.isError ? 'text-red-400' : m.isUser ? 'text-violet-300' : 'text-slate-400';
        const dot = m.isError ? '<span class="text-red-500 mr-1">⛔</span>' : m.isUser ? '<span class="text-violet-400 mr-1">📤</span>' : '<span class="text-slate-500 mr-1">·</span>';
        const mainCls = m.isError ? 'text-red-400 font-bold bg-red-500/10' : m.isUser ? 'text-violet-400' : 'text-slate-200';
        return `<div class="flex items-center gap-2 px-2 py-1 border-b border-slate-800 text-[10px] sm:text-xs ${mainCls} ${recCls2}">
            <span class="text-slate-500 flex-shrink-0 w-16 text-right font-mono">${m.time}</span>
            ${dot}
            <span class="${idCls} font-mono flex-shrink-0 w-[70px]">${m.id}</span>
            <span class="${nameCls} flex-shrink-0 w-24 sm:w-28 truncate">${m.name}</span>
            <span class="text-slate-500 flex-shrink-0 w-5 text-center">${m.dlc}</span>
            <span class="flex-1 font-mono">${dataStr}</span>
            ${m.count > 1 ? `<span class="text-amber-500 text-[9px] flex-shrink-0">×${m.count}</span>` : ''}
        </div>`;
    }).join('');
    body.innerHTML = html;
    body.scrollTop = body.scrollHeight;
}

function showToast(msg) {
    let toast = document.getElementById('toast');
    if (!toast) {
        toast = document.createElement('div');
        toast.id = 'toast';
        toast.className = 'fixed top-20 left-1/2 -translate-x-1/2 bg-slate-800 text-white px-5 py-2.5 rounded-xl shadow-2xl z-50 text-sm border border-cyan-500/50';
        document.body.appendChild(toast);
    }
    toast.textContent = msg;
    toast.style.opacity = '1';
    clearTimeout(toast._t);
    toast._t = setTimeout(() => { toast.style.transition = 'opacity 0.4s'; toast.style.opacity = '0'; }, 2200);
}
