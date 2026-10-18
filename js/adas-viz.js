/* ==========================================================
   智驾可视化仪表盘 - 九键车载学习平台
   纯 Canvas 2D + requestAnimationFrame，零外部依赖
   参考 TeslaWay / Altara AV / 车载 HMI 设计
   ========================================================== */

const ADAS_STATE = {
    mode: 'acc',                    // acc | parking | lcc
    running: false,
    time: 0,
    // 车辆状态
    ego: {
        x: 0, y: 0, heading: 0,     // 位置/航向
        speed: 40,                   // km/h
        acc: 0,                      // m/s²
        brake: false,
        steerAngle: 0,               // deg
        gear: 'D',
        soc: 78,
        turnSignal: 'off',           // left/right/off
        l2Active: true,
        lccActive: true,
        accActive: true,
        apActive: false,
        handsOff: false
    },
    // 前车
    leadCar: { x: 0, y: -200, speed: 35, accel: 0, visible: true },
    // 周围障碍物（模拟 LiDAR/Radar 检测）
    obstacles: [],
    // 超声波（泊车）
    ultrasonics: [],                 // 8 个探头距离 cm
    // 历史数据（曲线图用）
    histSpeed: [], histLeadDist: [], histAcc: [], histBrake: [], histSteer: [],
    timerId: null,
    lastFrame: 0
};

const ROAD_W = 360, ROAD_H = 560;  // 主道路 canvas 逻辑尺寸
const LANE_COLOR = '#22d3ee';

/* ============ 入口 ============ */
function renderAdasViz() {
    const content = document.getElementById('main-content');
    content.className = 'container mx-auto px-4 py-6 max-w-6xl fade-in';
    content.innerHTML = `
        <div class="fade-in">
            <button onclick="navigate('home')" class="text-cyan-600 hover:underline mb-4 flex items-center text-sm">← 返回首页</button>

            <div class="gradient-bg rounded-3xl p-5 sm:p-8 mb-6 text-white relative overflow-hidden">
                <div class="absolute -top-20 -right-20 w-60 h-60 bg-cyan-400/10 rounded-full"></div>
                <div class="absolute -bottom-16 -left-16 w-52 h-52 bg-emerald-400/10 rounded-full"></div>
                <div class="relative z-10">
                    <div class="flex items-center gap-3 mb-2">
                        <div class="w-12 h-12 bg-white/20 backdrop-blur rounded-xl flex items-center justify-center text-2xl">🚘</div>
                        <div>
                            <h1 class="text-xl sm:text-2xl md:text-3xl font-bold">智驾可视化仪表盘</h1>
                            <p class="text-cyan-100 text-xs sm:text-sm mt-1">ACC跟车 · LCC车道保持 · 泊车辅助 · 传感器叠加</p>
                        </div>
                    </div>
                </div>
            </div>

            <!-- 模式切换 -->
            <div class="bg-white rounded-2xl p-1.5 sm:p-2 shadow-sm flex gap-1.5 sm:gap-2 mb-4">
                ${[
                    { id:'acc', label:'ACC 跟车', icon:'🛣️' },
                    { id:'parking', label:'泊车辅助', icon:'🅿️' },
                    { id:'lcc', label:'LCC 车道保持', icon:'↔️' }
                ].map((m, i) => `
                    <button id="adas-mode-${m.id}" onclick="adasSetMode('${m.id}')"
                            class="adas-mode-btn flex-1 py-3 px-2 sm:px-4 rounded-xl font-semibold text-sm sm:text-base transition-all ${i===0?'bg-gradient-to-r from-cyan-500 to-emerald-500 text-white shadow-md':'text-slate-600 hover:bg-slate-100'}">
                        ${m.icon} <span class="hidden sm:inline">${m.label}</span>
                    </button>
                `).join('')}
                <button id="adas-ctrl" onclick="adasToggleRun()"
                        class="px-3 sm:px-5 py-3 rounded-xl font-bold text-sm sm:text-base bg-emerald-500 hover:bg-emerald-600 text-white shadow-md transition-all">▶ 启动</button>
            </div>

            <div class="grid lg:grid-cols-3 gap-4">
                <!-- 左: 主道路 Canvas -->
                <div class="lg:col-span-2 bg-slate-900 rounded-2xl overflow-hidden shadow-xl border border-slate-700">
                    <div class="bg-slate-800 px-3 py-2 border-b border-slate-700 flex items-center justify-between">
                        <div class="flex items-center gap-2 text-xs font-bold text-white">🎥 前视摄像头 + ADAS 叠加</div>
                        <span id="adas-fps" class="text-[10px] text-slate-400">— FPS</span>
                    </div>
                    <div class="relative" style="aspect-ratio: ${ROAD_W}/${ROAD_H}">
                        <canvas id="adas-road" class="w-full h-full block bg-gradient-to-b from-sky-900 via-slate-800 to-slate-700"></canvas>
                        <!-- HUD 叠加层 -->
                        <div class="absolute top-3 left-3 text-[10px] sm:text-xs text-white space-y-1 pointer-events-none">
                            <div class="bg-black/40 px-2 py-1 rounded backdrop-blur">
                                <span class="text-cyan-400 font-bold">●</span> 车道线检测
                            </div>
                            <div class="bg-black/40 px-2 py-1 rounded backdrop-blur">
                                <span class="text-amber-400 font-bold">●</span> 前车雷达锁定
                            </div>
                        </div>
                        <!-- TTC 警告 -->
                        <div id="adas-ttc-warn" class="absolute top-3 right-3 bg-red-600/80 text-white px-3 py-1.5 rounded-lg font-bold text-sm shadow-lg hidden animate-pulse">
                            ⚠️ 碰撞危险！TTC < 2s
                        </div>
                    </div>
                </div>

                <!-- 右: 车辆状态仪表 -->
                <div class="space-y-4">
                    ${renderAdasDashboard()}
                    ${renderAdasMiniGraphs()}
                </div>
            </div>

            <!-- 底部: 雷达+LiDAR+超声波 -->
            <div class="grid sm:grid-cols-3 gap-4 mt-4">
                ${renderAdasSensors()}
            </div>
        </div>
    `;

    window.adasSetMode = function(mode) {
        ADAS_STATE.mode = mode;
        document.querySelectorAll('.adas-mode-btn').forEach(b => {
            b.className = 'adas-mode-btn flex-1 py-3 px-2 sm:px-4 rounded-xl font-semibold text-sm sm:text-base transition-all text-slate-600 hover:bg-slate-100';
        });
        document.getElementById('adas-mode-' + mode).className = 'adas-mode-btn flex-1 py-3 px-2 sm:px-4 rounded-xl font-semibold text-sm sm:text-base transition-all bg-gradient-to-r from-cyan-500 to-emerald-500 text-white shadow-md';
        initAdasScenario(mode);
    };
    window.adasToggleRun = function() {
        ADAS_STATE.running = !ADAS_STATE.running;
        const btn = document.getElementById('adas-ctrl');
        if (ADAS_STATE.running) {
            btn.textContent = '⏹ 暂停';
            btn.className = 'px-3 sm:px-5 py-3 rounded-xl font-bold text-sm sm:text-base bg-red-500 hover:bg-red-600 text-white shadow-md transition-all';
            if (!ADAS_STATE.timerId) adasLoop();
        } else {
            btn.textContent = '▶ 启动';
            btn.className = 'px-3 sm:px-5 py-3 rounded-xl font-bold text-sm sm:text-base bg-emerald-500 hover:bg-emerald-600 text-white shadow-md transition-all';
        }
    };

    initAdasScenario('acc');
    requestAnimationFrame(adasLoop);
}

function renderAdasDashboard() {
    return `
        <div class="bg-slate-900 rounded-2xl p-4 shadow-xl border border-slate-700">
            <div class="text-xs font-bold text-white mb-3">🚗 自车状态 (Ego Vehicle)</div>
            <!-- 档位 -->
            <div class="flex gap-1.5 mb-4">
                ${['P','R','N','D'].map(g => `
                    <div id="adas-gear-${g}" class="flex-1 text-center py-2 rounded-lg font-bold text-sm transition-all ${ADAS_STATE.ego.gear===g?'bg-gradient-to-br from-cyan-500 to-emerald-500 text-white shadow-md':'bg-slate-800 text-slate-500'}">${g}</div>
                `).join('')}
            </div>
            <!-- 速度大数字 -->
            <div class="text-center mb-4">
                <div id="adas-speed" class="text-5xl sm:text-6xl font-black bg-gradient-to-r from-cyan-400 to-emerald-400 bg-clip-text text-transparent tabular-nums">40</div>
                <div class="text-[10px] text-slate-500 tracking-widest">km/h</div>
            </div>
            <!-- L2 指示灯 -->
            <div class="grid grid-cols-2 gap-1.5 mb-4">
                ${[
                    { key:'l2', label:'L2 辅助', val: ADAS_STATE.ego.l2Active, color:'cyan' },
                    { key:'acc', label:'ACC 跟车', val: ADAS_STATE.ego.accActive, color:'emerald' },
                    { key:'lcc', label:'LCC 车道保持', val: ADAS_STATE.ego.lccActive, color:'violet' },
                    { key:'ap', label:'AP 泊车', val: ADAS_STATE.ego.apActive, color:'amber' }
                ].map(s => `
                    <div class="flex items-center gap-2 bg-slate-800 rounded-lg px-2.5 py-1.5">
                        <span class="w-2 h-2 rounded-full ${s.val?'bg-'+s.color+'-400 shadow-[0_0_8px_rgba...]':'bg-slate-600'}"></span>
                        <span class="text-[10px] text-slate-400">${s.label}</span>
                        <span id="adas-flag-${s.key}" class="ml-auto text-[9px] ${s.val?'text-'+s.color+'-400':'text-slate-600'}">${s.val?'ON':'OFF'}</span>
                    </div>
                `).join('')}
            </div>
            <!-- SOC + 加速度 -->
            <div class="space-y-2">
                <div>
                    <div class="flex justify-between text-[10px] text-slate-400 mb-1">
                        <span>🔋 电池 SOC</span><span id="adas-soc-val">${ADAS_STATE.ego.soc}%</span>
                    </div>
                    <div class="h-1.5 bg-slate-800 rounded-full overflow-hidden">
                        <div id="adas-soc-bar" class="h-full bg-gradient-to-r from-emerald-500 to-cyan-500 transition-all" style="width:${ADAS_STATE.ego.soc}%"></div>
                    </div>
                </div>
                <div class="grid grid-cols-2 gap-2 text-center">
                    <div class="bg-slate-800 rounded-lg p-2">
                        <div id="adas-accel" class="text-lg font-bold text-cyan-400 tabular-nums">0.0</div>
                        <div class="text-[9px] text-slate-500">纵向 m/s²</div>
                    </div>
                    <div class="bg-slate-800 rounded-lg p-2">
                        <div id="adas-steer" class="text-lg font-bold text-violet-400 tabular-nums">0°</div>
                        <div class="text-[9px] text-slate-500">转向角</div>
                    </div>
                </div>
            </div>
        </div>
    `;
}

function renderAdasMiniGraphs() {
    return `
        <div class="bg-slate-900 rounded-2xl p-4 shadow-xl border border-slate-700">
            <div class="text-xs font-bold text-white mb-2">📈 实时数据曲线</div>
            ${['Speed','LeadDist','Acc','Steer'].map(k => `
                <div class="mb-2">
                    <div class="flex justify-between text-[10px] mb-0.5">
                        <span class="text-slate-400">${{Speed:'车速 km/h',LeadDist:'车距 m',Acc:'加速度 m/s²',Steer:'转向角 °'}[k]}</span>
                        <span id="adas-mini-val-${k}" class="font-mono text-cyan-300 tabular-nums">—</span>
                    </div>
                    <canvas id="adas-mini-${k}" height="32" class="w-full block rounded bg-slate-950 border border-slate-800"></canvas>
                </div>
            `).join('')}
        </div>
    `;
}

function renderAdasSensors() {
    return `
        <!-- 前雷达 扇形 -->
        <div class="bg-slate-900 rounded-2xl p-4 border border-slate-700">
            <div class="text-xs font-bold text-white mb-3">📡 前雷达 (毫米波)</div>
            <div class="relative" style="aspect-ratio: 1">
                <canvas id="adas-radar" class="w-full h-full block"></canvas>
            </div>
            <div class="mt-2 space-y-1 text-[10px]">
                <div class="flex items-center gap-2 text-slate-400"><span class="w-2 h-2 rounded-full bg-emerald-400"></span> 前车 ${ADAS_STATE.leadCar.visible?'检测到':'无'}</div>
                <div class="flex items-center gap-2 text-slate-400"><span class="w-2 h-2 rounded-full bg-cyan-400"></span> 自车 0 m</div>
            </div>
        </div>

        <!-- LiDAR 环形 -->
        <div class="bg-slate-900 rounded-2xl p-4 border border-slate-700">
            <div class="text-xs font-bold text-white mb-3">🟡 环视 LiDAR 点云</div>
            <div class="relative" style="aspect-ratio: 1">
                <canvas id="adas-lidar" class="w-full h-full block"></canvas>
            </div>
            <div class="mt-2 text-[10px] text-slate-400 text-center">360° 扫描 · 绿色点=近障碍物</div>
        </div>

        <!-- 超声波 8 个 -->
        <div class="bg-slate-900 rounded-2xl p-4 border border-slate-700">
            <div class="text-xs font-bold text-white mb-3">📏 超声波探头 (泊车辅助)</div>
            <div id="adas-usonic" class="relative h-36 bg-slate-950 rounded-lg border border-slate-800 overflow-hidden flex items-center justify-center">
                <!-- 8 个探头条由 JS 渲染 -->
            </div>
            <div class="mt-2 text-[10px] text-slate-400 text-center">检测范围 0.2m - 3m</div>
        </div>
    `;
}

/* ============ 场景初始化 ============ */
function initAdasScenario(mode) {
    const e = ADAS_STATE.ego;
    ADAS_STATE.running = false;
    const btn = document.getElementById('adas-ctrl');
    if (btn) { btn.textContent = '▶ 启动'; btn.className = 'px-3 sm:px-5 py-3 rounded-xl font-bold text-sm sm:text-base bg-emerald-500 hover:bg-emerald-600 text-white shadow-md transition-all'; }
    
    if (mode === 'acc') {
        e.speed = 40; e.gear = 'D'; e.acc = 0; e.steerAngle = 0;
        e.accActive = true; e.lccActive = true; e.apActive = false; e.l2Active = true;
        ADAS_STATE.leadCar = { y: -180, speed: 32, visible: true };
    } else if (mode === 'parking') {
        e.speed = 8; e.gear = 'R'; e.acc = 0.2; e.steerAngle = -35;
        e.accActive = false; e.lccActive = false; e.apActive = true; e.l2Active = true;
        ADAS_STATE.leadCar.visible = false;
    } else if (mode === 'lcc') {
        e.speed = 60; e.gear = 'D'; e.acc = 0; e.steerAngle = 0;
        e.accActive = false; e.lccActive = true; e.apActive = false; e.l2Active = true;
        ADAS_STATE.leadCar.visible = false;
    }
    updateAdasDashboard();
}

/* ============ 主循环 ============ */
function adasLoop(ts) {
    if (!ADAS_STATE.lastFrame) ADAS_STATE.lastFrame = ts;
    const dt = Math.min(0.05, (ts - ADAS_STATE.lastFrame) / 1000);
    ADAS_STATE.lastFrame = ts;
    ADAS_STATE.time += dt;
    if (ADAS_STATE.running) {
        updateAdasPhysics(dt);
        updateAdasHist();
    }
    drawAdasRoad();
    drawAdasMiniGraphs();
    drawAdasRadar();
    drawAdasLidar();
    drawAdasUltrasonics();
    updateAdasDashboard();
    requestAnimationFrame(adasLoop);
}

function updateAdasPhysics(dt) {
    const e = ADAS_STATE.ego;
    const m = ADAS_STATE.mode;

    if (m === 'acc') {
        // 跟车模型：检测到前车，保持期望车距
        const leadDist = -ADAS_STATE.leadCar.y;
        const targetDist = Math.max(25, e.speed * 0.8 + 10);  // 安全距离
        if (ADAS_STATE.leadCar.visible) {
            const distErr = leadDist - targetDist;
            const speedErr = e.speed - ADAS_STATE.leadCar.speed;
            e.acc = Math.max(-3, Math.min(2, distErr * 0.08 - speedErr * 0.3));
        } else {
            e.acc = Math.min(1.5, (60 - e.speed) * 0.05);
        }
    } else if (m === 'parking') {
        // 泊车：慢速倒车 + 来回打方向
        const t = ADAS_STATE.time;
        e.speed = 6 + Math.sin(t * 1.5) * 3;
        e.gear = 'R';
        e.steerAngle = Math.sin(t * 0.6) * 38;
        e.acc = Math.sin(t * 1.5) * 0.5;
        // 超声波模拟
        ADAS_STATE.ultrasonics = Array.from({length: 8}, (_, i) => {
            const base = [120, 80, 40, 150, 130, 70, 30, 140][i] || 100;
            return Math.max(20, base + Math.sin(t + i) * 25);
        });
    } else if (m === 'lcc') {
        // 车道保持：模拟 S 型弯道，方向盘微修
        const t = ADAS_STATE.time;
        e.speed = 60 + Math.sin(t * 0.3) * 5;
        e.steerAngle = Math.sin(t * 0.8) * 8 + Math.sin(t * 2.2) * 4;
        e.acc = Math.cos(t * 0.5) * 0.6;
    }

    // 更新速度
    e.speed = Math.max(0, Math.min(120, e.speed + e.acc * dt * 3.6));
    // SOC 缓慢下降
    e.soc = Math.max(5, e.soc - dt * 0.002);
    // TTC 警告
    const leadDist = -ADAS_STATE.leadCar.y;
    const ttc = ADAS_STATE.leadCar.visible && leadDist > 0 ? leadDist / Math.max(1, (e.speed - ADAS_STATE.leadCar.speed) / 3.6) : 999;
    const warn = document.getElementById('adas-ttc-warn');
    if (warn) warn.className = ttc > 0 && ttc < 2 ? 'absolute top-3 right-3 bg-red-600/80 text-white px-3 py-1.5 rounded-lg font-bold text-sm shadow-lg animate-pulse' : 'hidden';
}

function updateAdasHist() {
    const e = ADAS_STATE.ego;
    ADAS_STATE.histSpeed.push(e.speed);
    ADAS_STATE.histAcc.push(e.acc);
    ADAS_STATE.histSteer.push(e.steerAngle);
    ADAS_STATE.histLeadDist.push(Math.max(0, -ADAS_STATE.leadCar.y));
    ['Speed','LeadDist','Acc','Steer'].forEach(k => {
        const buf = ADAS_STATE['hist' + (k==='LeadDist'?'LeadDist':k)];
        if (buf.length > 60) buf.shift();
    });
}

/* ============ 道路 Canvas ============ */
function drawAdasRoad() {
    const canvas = document.getElementById('adas-road');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const w = canvas.width = canvas.clientWidth * devicePixelRatio;
    const h = canvas.height = canvas.clientHeight * devicePixelRatio;
    ctx.scale(devicePixelRatio, devicePixelRatio);
    const W = canvas.clientWidth, H = canvas.clientHeight;
    ctx.clearRect(0, 0, W, H);

    // 天空
    const skyGrad = ctx.createLinearGradient(0, 0, 0, H * 0.45);
    skyGrad.addColorStop(0, '#0f172a'); skyGrad.addColorStop(1, '#1e293b');
    ctx.fillStyle = skyGrad; ctx.fillRect(0, 0, W, H * 0.45);

    // 路面（透视梯形）
    ctx.fillStyle = '#334155';
    ctx.beginPath();
    ctx.moveTo(W * 0.15, H * 0.45);
    ctx.lineTo(W * 0.85, H * 0.45);
    ctx.lineTo(W, H);
    ctx.lineTo(0, H);
    ctx.closePath(); ctx.fill();

    // 车道线（多条）
    ctx.strokeStyle = '#fbbf24';
    ctx.lineWidth = 2;
    const vanishingX = W / 2;
    const vanishY = H * 0.45;
    const roadBottomHalf = [0.35, 0.5, 0.65];  // 横向车道分割比例

    // 中央虚线
    ctx.strokeStyle = '#f1f5f9';
    ctx.lineWidth = 3;
    const t = ADAS_STATE.time;
    for (let i = 0; i < 15; i++) {
        const progress = ((i + 0.5) - t * 0.8) % 15;
        if (progress < 0) continue;
        const scale0 = (1 - progress / 15);
        const scale1 = (1 - (progress + 0.5) / 15);
        if (scale0 < 0 || scale1 < 0) continue;
        const x0 = vanishingX + (W * 0.5 - vanishingX) * scale0;
        const y0 = vanishY + (H - vanishY) * scale0;
        const x1 = vanishingX + (W * 0.5 - vanishingX) * scale1;
        const y1 = vanishY + (H - vanishY) * scale1;
        ctx.beginPath(); ctx.moveTo(x0, y0); ctx.lineTo(x1, y1); ctx.stroke();
    }
    // 左右边界实线
    ctx.strokeStyle = '#e2e8f0'; ctx.lineWidth = 4;
    ctx.beginPath(); ctx.moveTo(W * 0.15, vanishY); ctx.lineTo(0, H); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(W * 0.85, vanishY); ctx.lineTo(W, H); ctx.stroke();

    // 路牌/远山
    ctx.fillStyle = '#1e293b';
    ctx.beginPath();
    ctx.moveTo(0, vanishY); ctx.lineTo(W * 0.2, H * 0.35); ctx.lineTo(W * 0.4, vanishY); ctx.closePath(); ctx.fill();
    ctx.beginPath();
    ctx.moveTo(W * 0.6, vanishY); ctx.lineTo(W * 0.8, H * 0.3); ctx.lineTo(W, vanishY); ctx.closePath(); ctx.fill();

    // 前车（在自车上方）
    const leadY = vanishY + (H - vanishY) * 0.3 + (ADAS_STATE.leadCar.y + 200) / 400 * (H - vanishY);
    if (ADAS_STATE.leadCar.visible) {
        const leadScale = 0.5 + 0.5 * (1 - (ADAS_STATE.leadCar.y + 300) / 400);
        const leadW = 80 * leadScale, leadH = 40 * leadScale;
        const leadCX = W / 2;
        ctx.fillStyle = '#1e40af';
        ctx.fillRect(leadCX - leadW / 2, leadY - leadH, leadW, leadH);
        ctx.fillStyle = '#60a5fa';
        ctx.fillRect(leadCX - leadW / 2 + 6, leadY - leadH + 4, leadW - 12, leadH / 2);
        // 尾灯光
        ctx.fillStyle = '#f87171';
        ctx.fillRect(leadCX - leadW / 2 + 4, leadY - 4, 8, 4);
        ctx.fillRect(leadCX + leadW / 2 - 12, leadY - 4, 8, 4);
        // 距离标签
        ctx.fillStyle = 'rgba(0,0,0,0.5)';
        ctx.fillRect(leadCX - 30, leadY - leadH - 20, 60, 16);
        ctx.fillStyle = '#fbbf24'; ctx.font = 'bold 11px sans-serif'; ctx.textAlign = 'center';
        ctx.fillText(`${Math.round(-ADAS_STATE.leadCar.y)}m`, leadCX, leadY - leadH - 8);
        // ACC 锁定框（蓝色）
        ctx.strokeStyle = '#06b6d4'; ctx.lineWidth = 2; ctx.setLineDash([4, 3]);
        ctx.strokeRect(leadCX - leadW / 2 - 4, leadY - leadH - 4, leadW + 8, leadH + 8);
        ctx.setLineDash([]);
    }

    // 自车（底部）
    const e = ADAS_STATE.ego;
    const carCX = W / 2 + e.steerAngle * 0.8;  // 轻微横移模拟打方向
    const carCY = H - 40;
    ctx.save();
    ctx.translate(carCX, carCY);
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(-30, -20, 60, 30);
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(-25, -18, 50, 14);
    // 前挡风
    ctx.fillStyle = '#38bdf8';
    ctx.fillRect(-20, -16, 40, 8);
    // 方向盘指示（ACC激活）
    if (e.accActive || e.lccActive) {
        ctx.strokeStyle = '#10b981'; ctx.lineWidth = 2;
        ctx.beginPath(); ctx.arc(0, -14, 5, 0, Math.PI * 2); ctx.stroke();
        ctx.fillStyle = '#10b981';
        ctx.fillRect(-1, -20, 2, 10);
    }
    // 转向灯
    if (e.turnSignal !== 'off') {
        ctx.fillStyle = '#f59e0b';
        ctx.fillRect(e.turnSignal === 'right' ? 28 : -32, -6, 4, 6);
    }
    // 前雷达扇形
    ctx.fillStyle = 'rgba(56,189,248,0.08)';
    ctx.beginPath();
    ctx.moveTo(0, -20); ctx.lineTo(-120, -150); ctx.lineTo(120, -150); ctx.closePath(); ctx.fill();
    ctx.strokeStyle = 'rgba(56,189,248,0.3)'; ctx.lineWidth = 1;
    ctx.stroke();
    ctx.restore();

    // 泊车辅助轨迹预测（parking 模式）
    if (ADAS_STATE.mode === 'parking') {
        ctx.strokeStyle = '#00e5a0'; ctx.lineWidth = 2; ctx.setLineDash([6, 4]);
        ctx.beginPath();
        for (let i = 0; i < 40; i++) {
            const progress = i / 40;
            const px = carCX + progress * 20 - progress * progress * 40;
            const py = carCY - progress * 300;
            if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
        }
        ctx.stroke(); ctx.setLineDash([]);
    }
}

/* ============ 迷你曲线图 ============ */
function drawAdasMiniGraphs() {
    const configs = [
        { key:'Speed', buf: ADAS_STATE.histSpeed,  color:'#06b6d4', min:0, max:120, unit:'km/h' },
        { key:'LeadDist', buf: ADAS_STATE.histLeadDist, color:'#fbbf24', min:0, max:80, unit:'m' },
        { key:'Acc', buf: ADAS_STATE.histAcc, color:'#ec4899', min:-3, max:2, unit:'m/s²' },
        { key:'Steer', buf: ADAS_STATE.histSteer, color:'#a78bfa', min:-45, max:45, unit:'°' }
    ];
    configs.forEach(c => {
        const canvas = document.getElementById('adas-mini-' + c.key);
        if (!canvas || !c.buf.length) return;
        const ctx = canvas.getContext('2d');
        const W = canvas.width = canvas.clientWidth * 2;
        const H = canvas.height = 32 * 2;
        ctx.clearRect(0, 0, W, H);
        // 中线（acc 图）
        if (c.key === 'Acc') {
            ctx.strokeStyle = 'rgba(255,255,255,0.15)'; ctx.lineWidth = 1;
            ctx.beginPath(); ctx.moveTo(0, H / 2); ctx.lineTo(W, H / 2); ctx.stroke();
        }
        const step = W / Math.max(1, c.buf.length - 1);
        ctx.strokeStyle = c.color; ctx.lineWidth = 2;
        ctx.beginPath();
        c.buf.forEach((v, i) => {
            const x = i * step;
            const y = H - ((v - c.min) / (c.max - c.min)) * H;
            if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
        });
        ctx.stroke();
        const val = c.buf[c.buf.length - 1];
        const valEl = document.getElementById('adas-mini-val-' + c.key);
        if (valEl) valEl.textContent = val.toFixed(c.key === 'Speed' || c.key === 'LeadDist' ? 0 : 1);
    });
}

/* ============ 雷达 ============ */
function drawAdasRadar() {
    const canvas = document.getElementById('adas-radar');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const S = canvas.width = canvas.clientWidth * devicePixelRatio;
    canvas.height = S;
    ctx.clearRect(0, 0, S, S);
    const cx = S / 2, cy = S * 0.85, r = S * 0.7;
    // 扇形网格
    ctx.strokeStyle = 'rgba(56,189,248,0.2)'; ctx.lineWidth = 1;
    for (let a = -60; a <= 60; a += 30) {
        ctx.beginPath();
        ctx.moveTo(cx, cy);
        const rad = a * Math.PI / 180;
        ctx.lineTo(cx + Math.sin(rad) * r, cy - Math.cos(rad) * r);
        ctx.stroke();
    }
    for (let rr = r / 4; rr <= r; rr += r / 4) {
        ctx.beginPath();
        ctx.arc(cx, cy, rr, -Math.PI * 7 / 12, -Math.PI * 5 / 12);
        ctx.stroke();
    }
    // 扫描波
    const scanA = (ADAS_STATE.time * 120) % 240 - 120;
    const rad = scanA * Math.PI / 180;
    const grd = ctx.createLinearGradient(cx, cy, cx + Math.sin(rad) * r, cy - Math.cos(rad) * r);
    grd.addColorStop(0, 'rgba(56,189,248,0.5)');
    grd.addColorStop(1, 'rgba(56,189,248,0)');
    ctx.fillStyle = grd;
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.lineTo(cx + Math.sin(rad - 10) * r, cy - Math.cos(rad - 10) * r);
    ctx.lineTo(cx + Math.sin(rad + 10) * r, cy - Math.cos(rad + 10) * r);
    ctx.closePath(); ctx.fill();
    // 自车
    ctx.fillStyle = '#10b981';
    ctx.beginPath();
    ctx.arc(cx, cy, 6, 0, Math.PI * 2); ctx.fill();
    // 前车检测点
    if (ADAS_STATE.leadCar.visible) {
        const distRatio = Math.max(0.15, Math.min(1, -ADAS_STATE.leadCar.y / 250));
        const tx = cx + Math.sin(-10 * Math.PI / 180) * r * distRatio;
        const ty = cy - Math.cos(-10 * Math.PI / 180) * r * distRatio;
        ctx.fillStyle = '#f59e0b';
        ctx.beginPath(); ctx.arc(tx, ty, 7, 0, Math.PI * 2); ctx.fill();
        ctx.strokeStyle = 'rgba(245,158,11,0.5)'; ctx.lineWidth = 1.5;
        ctx.beginPath(); ctx.arc(tx, ty, 12 + Math.sin(ADAS_STATE.time * 3) * 3, 0, Math.PI * 2); ctx.stroke();
    }
    ctx.fillStyle = 'rgba(255,255,255,0.6)';
    ctx.font = 'bold 10px sans-serif'; ctx.textAlign = 'center';
    ctx.fillText('前雷达', cx, cy - r - 4);
}

/* ============ LiDAR ============ */
function drawAdasLidar() {
    const canvas = document.getElementById('adas-lidar');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const S = canvas.width = canvas.clientWidth * devicePixelRatio;
    canvas.height = S;
    ctx.clearRect(0, 0, S, S);
    const cx = S / 2, cy = S / 2, r = S * 0.45;
    // 同心圆
    ctx.strokeStyle = 'rgba(251,191,36,0.25)'; ctx.lineWidth = 1;
    for (let i = 1; i <= 4; i++) {
        ctx.beginPath(); ctx.arc(cx, cy, r * i / 4, 0, Math.PI * 2); ctx.stroke();
    }
    // 扫描旋转
    const rotA = ADAS_STATE.time * 3;
    ctx.strokeStyle = 'rgba(251,191,36,0.4)';
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.lineTo(cx + Math.cos(rotA) * r, cy + Math.sin(rotA) * r);
    ctx.stroke();
    // 点云（伪随机固定种子 + time）
    for (let i = 0; i < 80; i++) {
        const baseA = (i * 37 + ADAS_STATE.time * 0.5) % 360 * Math.PI / 180;
        const baseR = r * (0.2 + Math.sin(i * 3.1) * 0.35);
        const jitter = Math.sin(ADAS_STATE.time * 2 + i) * 3;
        const px = cx + Math.cos(baseA) * (baseR + jitter);
        const py = cy + Math.sin(baseA) * (baseR + jitter);
        // 近点亮，远点暗
        const dist = Math.sqrt((px - cx) ** 2 + (py - cy) ** 2);
        const alpha = 1 - dist / (r * 1.1);
        ctx.fillStyle = `rgba(52,211,153,${alpha * 0.8})`;
        ctx.fillRect(px - 1.5, py - 1.5, 3, 3);
    }
    // 周围障碍物（parking 模式下有车）
    if (ADAS_STATE.mode === 'parking') {
        [[r * 0.8, -Math.PI / 3], [r * 0.7, Math.PI / 3], [r * 0.6, Math.PI * 0.8]].forEach(([rr, a]) => {
            ctx.fillStyle = 'rgba(239,68,68,0.8)';
            const px = cx + Math.cos(a) * rr;
            const py = cy + Math.sin(a) * rr;
            ctx.fillRect(px - 6, py - 4, 12, 8);
        });
    }
    // 自车中心
    ctx.fillStyle = '#fbbf24';
    ctx.beginPath(); ctx.arc(cx, cy, 5, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = 'rgba(255,255,255,0.6)';
    ctx.font = 'bold 10px sans-serif'; ctx.textAlign = 'center';
    ctx.fillText('LiDAR 360°', cx, 12);
}

/* ============ 超声波 ============ */
function drawAdasUltrasonics() {
    const wrap = document.getElementById('adas-usonic');
    if (!wrap) return;
    if (!wrap.innerHTML || !wrap._initialized) {
        wrap._initialized = true;
        // 画一辆小车轮廓在中间
        wrap.innerHTML = `
            <div class="absolute inset-0 flex items-center justify-center">
                <div class="relative">
                    <!-- 车轮廓 -->
                    <div class="w-24 h-10 bg-slate-800 rounded-lg border border-slate-600 relative z-10">
                        <div class="absolute top-1 left-2 right-2 h-3 bg-sky-900 rounded-sm"></div>
                    </div>
                    <!-- 8 个探头 -->
                    ${[
                        { x: 50, y: -20, cls:'front-0' },  // 前中
                        { x: 20, y: -15, cls:'front-1' },  // 前左
                        { x: 80, y: -15, cls:'front-2' },  // 前右
                        { x: -20, y: 15, cls:'side-1' },   // 左
                        { x: 120, y: 15, cls:'side-2' },   // 右
                        { x: 20, y: 50, cls:'rear-1' },    // 后左
                        { x: 80, y: 50, cls:'rear-2' },    // 后右
                        { x: 50, y: 55, cls:'rear-0' }     // 后中
                    ].map((p, i) => `
                        <div class="absolute probe-dot" data-i="${i}" style="left:${p.x}%; top:${p.y + 20}%;">
                            <div class="w-3 h-3 rounded-full bg-cyan-500 border border-white shadow-[0_0_6px_rgba(6,182,212,0.8)]"></div>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    }
    // 更新探头颜色/大小（根据距离）
    const dots = wrap.querySelectorAll('.probe-dot > div');
    const d = ADAS_STATE.ultrasonics;
    const vals = d.length ? d : [120, 80, 40, 150, 130, 70, 30, 140];
    dots.forEach((dot, i) => {
        const v = vals[i] || 100;
        // 距离越小越红越大
        const ratio = Math.max(0.1, Math.min(1, v / 200));
        const hue = ratio > 0.6 ? 200 : ratio > 0.3 ? 40 : 0;
        dot.style.backgroundColor = `hsl(${hue}, 80%, 50%)`;
        dot.style.boxShadow = `0 0 ${8 - ratio * 6}px hsl(${hue}, 80%, 60%)`;
        dot.style.width = dot.style.height = (6 - ratio * 3) + 'px';
    });
}

/* ============ 仪表盘数值更新 ============ */
function updateAdasDashboard() {
    const e = ADAS_STATE.ego;
    // 速度
    const speedEl = document.getElementById('adas-speed');
    if (speedEl) speedEl.textContent = Math.round(e.speed);
    // SOC
    const socBar = document.getElementById('adas-soc-bar');
    const socVal = document.getElementById('adas-soc-val');
    if (socBar) socBar.style.width = e.soc.toFixed(0) + '%';
    if (socVal) socVal.textContent = e.soc.toFixed(0) + '%';
    // 加速度
    const acc = document.getElementById('adas-accel');
    if (acc) { acc.textContent = e.acc.toFixed(1); acc.className = 'text-lg font-bold tabular-nums ' + (e.acc > 0.3 ? 'text-emerald-400' : e.acc < -0.5 ? 'text-red-400' : 'text-cyan-400'); }
    // 转向角
    const steer = document.getElementById('adas-steer');
    if (steer) steer.textContent = Math.round(e.steerAngle) + '°';
    // 档位
    ['P','R','N','D'].forEach(g => {
        const el = document.getElementById('adas-gear-' + g);
        if (!el) return;
        if (e.gear === g) el.className = 'flex-1 text-center py-2 rounded-lg font-bold text-sm transition-all bg-gradient-to-br from-cyan-500 to-emerald-500 text-white shadow-md';
        else el.className = 'flex-1 text-center py-2 rounded-lg font-bold text-sm transition-all bg-slate-800 text-slate-500';
    });
    // 标志位
    const flags = { l2: e.l2Active, acc: e.accActive, lcc: e.lccActive, ap: e.apActive };
    Object.keys(flags).forEach(k => {
        const el = document.getElementById('adas-flag-' + k);
        if (el) el.textContent = flags[k] ? 'ON' : 'OFF';
    });
    // LeadDist 大数字
    const d = ADAS_STATE.ultrasonics;
}
