/* ===============================================
   🅿️ 智驾泊车逻辑控制模拟器
   Three.js 3D 动画 + Canvas 状态机 + 信号曲线 + 控制流程图
   =============================================== */

window.PARKING_STATE = {
    isRunning: false,
    startTime: 0,
    duration: 14000,          // 14 秒完整泊车
    currentState: 'IDLE',
    stateProgress: 0,          // 0~1
    signals: {
        vehicleSpeed: 0,
        steeringAngle: 0,      // -30 ~ 30 度
        longAccel: 0,
        latAccel: 0,
        parkState: 0,          // 0~5
        ultrasonicFL: 300,
        ultrasonicFR: 300,
        ultrasonicBL: 300,
        ultrasonicBR: 300,
        occupancyGrid: 0
    },
    // 状态机定义
    STATES: [
        { id: 'IDLE',      name: '待机',       desc: '泊车系统未激活',    duration: 1500 },
        { id: 'SEARCH',    name: '搜索车位',   desc: '前雷达扫描寻找空车位', duration: 3000 },
        { id: 'ALIGN',     name: '对准车位',   desc: '车辆平行对齐 + 预打角', duration: 2500 },
        { id: 'BACKING',   name: '倒车入位',   desc: 'EPS 大角度反向打角，低速倒车', duration: 3500 },
        { id: 'FINAL',     name: '最终调整',   desc: '前雷达测量后距，微调', duration: 2000 },
        { id: 'COMPLETE',  name: '泊车完成',   desc: 'P 档激活，拉手刹',  duration: 1500 }
    ]
};

/* ============== renderParkingSimulator ============== */
window.renderParkingSimulator = function() {
    const main = document.getElementById('main-content');
    main.innerHTML = `
        <div class="fade-in">
            <button onclick="navigate('home')" class="text-cyan-400 hover:text-cyan-300 text-sm mb-3">← 返回首页</button>

            <!-- 教学模拟声明 -->
            <div class="mb-4 rounded-xl border border-cyan-500/30 bg-cyan-500/5 px-4 py-2.5 text-[11px] sm:text-xs text-cyan-300/90 leading-relaxed flex items-start gap-2">
                <span class="text-cyan-400 font-bold flex-shrink-0">💡</span>
                <div><strong>教学演示 · 非真实控制器</strong> 本页面 Three.js 3D 动画、状态机流转、信号曲线均为前端模拟，演示泊车系统的控制逻辑；不能控制真实车辆。泊车路径采用简化 Bézier 轨迹。</div>
            </div>

            <!-- Hero -->
            <div class="gradient-bg industry-banner rounded-3xl p-5 sm:p-8 mb-6 text-white relative overflow-hidden border-0">
                <div class="relative z-10">
                    <div class="text-base sm:text-lg font-black tracking-wide mb-1">🅿️ 智驾泊车逻辑控制</div>
                    <h1 class="text-2xl sm:text-3xl md:text-4xl font-black mb-2 text-white">从感知到执行的完整链路</h1>
                    <p class="text-xs sm:text-sm text-white/85 max-w-2xl leading-relaxed">
                        本页演示 L2+ 自动泊车 APA 的完整控制逻辑：感知（超声波 + 环视）→ 规划（A* / Hybrid A* 搜索轨迹）→ 控制（MPC 模型预测控制 EPS + EHB）→ 执行（发送 CAN 报文到转向/制动）。
                        可点击 <span class="font-semibold">▶ 启动泊车</span> 观看 14 秒完整流程，同步查看 3D 动画、状态机流转、关键信号曲线。
                    </p>
                    <div class="mt-3 flex gap-1.5 flex-wrap">
                        <span class="badge bg-white/20 border-white/35 text-white text-[10px] font-semibold">APA</span>
                        <span class="badge bg-white/20 border-white/35 text-white text-[10px] font-semibold">Hybrid A*</span>
                        <span class="badge bg-white/20 border-white/35 text-white text-[10px] font-semibold">MPC 控制</span>
                        <span class="badge bg-white/20 border-white/35 text-white text-[10px] font-semibold">CANoe 信号</span>
                    </div>
                </div>
            </div>

            <!-- 控制面板 -->
            <div class="card p-3 sm:p-4 mb-5 flex items-center gap-2 sm:gap-4 flex-wrap">
                <button id="park-start" onclick="startParking()"
                        class="btn-glow text-sm px-4 py-2 flex items-center gap-2">
                    ▶ 启动泊车
                </button>
                <button id="park-reset" onclick="resetParking()"
                        class="px-4 py-2 rounded-xl text-sm border border-slate-600 hover:border-cyan-400 text-slate-300 hover:text-cyan-300 transition-all">
                    ↺ 重置
                </button>
                <div id="park-status-badge" class="px-3 py-1.5 rounded-full bg-slate-800/60 border border-slate-700 text-xs text-slate-400 flex items-center gap-2">
                    <span class="w-2 h-2 bg-slate-500 rounded-full" id="park-status-dot"></span>
                    待机 · 泊车未激活
                </div>
                <div class="ml-auto text-[10px] sm:text-xs text-slate-500 hidden sm:block">
                    物理模型：匀速减速 + 最大转角 30° + 倒车速度上限 5 km/h
                </div>
            </div>

            <!-- 3D 动画 -->
            <div class="card p-0 overflow-hidden mb-5">
                <div class="px-4 py-2 border-b border-slate-800/70 flex items-center justify-between">
                    <span class="text-xs sm:text-sm font-bold text-slate-300 flex items-center gap-2">
                        <span class="w-1.5 h-1.5 bg-cyan-400 rounded-full animate-pulse"></span>
                        🚗 3D 泊车动画（Three.js）
                    </span>
                    <span class="text-[10px] text-slate-500">点击场景可旋转视角</span>
                </div>
                <div id="parking-3d" style="height:420px; width:100%;"></div>
            </div>

            <!-- 状态机 -->
            <div class="card p-4 sm:p-5 mb-5">
                <h3 class="text-sm sm:text-base font-bold text-slate-300 mb-3 flex items-center gap-2">
                    <span class="w-1 h-4 bg-gradient-to-b from-cyan-400 to-emerald-500 rounded"></span>
                    🔄 泊车状态机（6 状态）
                </h3>
                <div class="relative">
                    <svg id="fsm-svg" viewBox="0 0 720 120" class="w-full h-auto"></svg>
                </div>
                <div id="fsm-detail" class="mt-3 p-3 bg-slate-800/50 border border-slate-700 rounded-lg text-[11px] sm:text-xs text-slate-300">
                    💡 点击"启动泊车"后，上方 6 个状态圆会按时间依次点亮，中间的箭头会变成高亮，表示当前流转方向。
                </div>
            </div>

            <!-- 控制流程图 -->
            <div class="card p-4 sm:p-5 mb-5">
                <h3 class="text-sm sm:text-base font-bold text-slate-300 mb-3 flex items-center gap-2">
                    <span class="w-1 h-4 bg-gradient-to-b from-cyan-400 to-emerald-500 rounded"></span>
                    🧠 控制逻辑流水线
                </h3>
                <div id="pipeline-flow" class="relative h-24"></div>
                <div id="pipeline-desc" class="mt-3 text-[11px] sm:text-xs text-slate-400 bg-slate-800/40 rounded-lg p-2.5">
                    点击启动后，四个模块会依次亮起，展示感知→规划→控制→执行的数据流向。
                </div>
            </div>

            <!-- 信号曲线（4 路） -->
            <div class="card p-4 sm:p-5 mb-5">
                <h3 class="text-sm sm:text-base font-bold text-slate-300 mb-3 flex items-center gap-2">
                    <span class="w-1 h-4 bg-gradient-to-b from-cyan-400 to-emerald-500 rounded"></span>
                    📈 关键信号曲线（模拟 CANoe Graphics）
                </h3>
                <div class="grid sm:grid-cols-2 gap-3">
                    <div>
                        <div class="flex items-center gap-2 mb-1 text-[10px] text-slate-400">
                            <span class="inline-block w-3 h-3 rounded bg-cyan-400"></span>
                            VehicleSpeed 车速 (km/h)
                        </div>
                        <canvas id="sig-speed" width="400" height="110" class="w-full h-auto rounded bg-slate-900/60"></canvas>
                    </div>
                    <div>
                        <div class="flex items-center gap-2 mb-1 text-[10px] text-slate-400">
                            <span class="inline-block w-3 h-3 rounded bg-amber-400"></span>
                            EPS SteeringAngle 转向角 (°)
                        </div>
                        <canvas id="sig-steer" width="400" height="110" class="w-full h-auto rounded bg-slate-900/60"></canvas>
                    </div>
                    <div>
                        <div class="flex items-center gap-2 mb-1 text-[10px] text-slate-400">
                            <span class="inline-block w-3 h-3 rounded bg-emerald-400"></span>
                            LongAccel 纵向加速度 (g)
                        </div>
                        <canvas id="sig-accel" width="400" height="110" class="w-full h-auto rounded bg-slate-900/60"></canvas>
                    </div>
                    <div>
                        <div class="flex items-center gap-2 mb-1 text-[10px] text-slate-400">
                            <span class="inline-block w-3 h-3 rounded bg-violet-400"></span>
                            ParkingState 泊车状态 (0~5)
                        </div>
                        <canvas id="sig-parkstate" width="400" height="110" class="w-full h-auto rounded bg-slate-900/60"></canvas>
                    </div>
                </div>
                <div class="mt-3 text-[10px] text-slate-500 leading-relaxed">
                    上方曲线可直接对应 CANoe Graphics Window 中监控的 0x101 / 0x123 / 0x400 / 0x200 报文信号。真实工程中这些信号来自 DBC 定义的 CAN 报文，这里以相同的时间序列特征做前端模拟。
                </div>
            </div>

            <!-- 泊车原理 -->
            <div class="card p-4 sm:p-6 mb-8">
                <h3 class="text-sm sm:text-base font-bold text-slate-300 mb-4 flex items-center gap-2">
                    <span class="w-1 h-4 bg-gradient-to-b from-cyan-400 to-emerald-500 rounded"></span>
                    📚 自动泊车系统原理（APA）
                </h3>
                <div class="grid sm:grid-cols-2 lg:grid-cols-5 gap-3 stagger">
                    ${[
                        { step:'①', name:'感知层', sub:'Sensor Fusion',
                          desc:'12 颗超声波 (USS) + 4 颗环视摄像头 (AVM) + 毫米波雷达，通过 CAN/LIN 总线上报原始数据到泊车 ECU。',
                          sig:'USS_FL/FR/BL/BR · AVM_F/R/L/R',
                          color:'from-cyan-400 to-cyan-600' },
                        { step:'②', name:'车位检测', sub:'Parking Slot Detection',
                          desc:'对 AVM 图像做语义分割 + USS 距离阈值判断，生成 20×20cm 网格的占用栅格 (Occupancy Grid)，提取车位中心 + 朝向。',
                          sig:'SlotCenterX/Y · SlotHeading · OccupancyGrid',
                          color:'from-amber-400 to-amber-600' },
                        { step:'③', name:'轨迹规划', sub:'Path Planning',
                          desc:'Hybrid A* 搜索满足阿克曼约束的平滑路径（Reeds-Shepp 曲线），生成 100ms 间隔的参考轨迹点 (x, y, θ, v, κ)。',
                          sig:'RefTraj_X/Y · RefTraj_Heading · Curvature κ',
                          color:'from-violet-400 to-violet-600' },
                        { step:'④', name:'控制器', sub:'MPC Control',
                          desc:'模型预测控制 (MPC) 在 2s 预测域内优化 EPS 转角和 EHB 制动，约束最大转角 30°、转角速率 150°/s、纵向加速度 ±0.4g。',
                          sig:'SteeringCmd · BrakePressure · AccelCmd',
                          color:'from-emerald-400 to-emerald-600' },
                        { step:'⑤', name:'CAN 执行', sub:'Actuation',
                          desc:'控制命令编码为 CAN 29-bit 扩展帧 (0x123 / 0x200)，发送到 EPS ECU 和 EHB ECU；同时触发仪表 HUD "P" 图标 + 蜂鸣器。',
                          sig:'0x123 SteeringAngle · 0x200 BrakePressure',
                          color:'from-rose-400 to-rose-600' }
                    ].map(s => `
                        <div class="group relative">
                            <div class="rounded-xl p-3 border border-slate-700/50 bg-slate-800/40 h-full hover:border-cyan-500/40 transition-all">
                                <div class="flex items-center gap-2 mb-2">
                                    <div class="w-9 h-9 rounded-lg bg-gradient-to-br ${s.color} flex items-center justify-center text-sm font-black text-white shadow-lg flex-shrink-0">${s.step}</div>
                                    <div class="leading-tight">
                                        <div class="font-bold text-white text-sm">${s.name}</div>
                                        <div class="text-[9px] text-cyan-400/70 font-mono">${s.sub}</div>
                                    </div>
                                </div>
                                <div class="text-[11px] text-slate-400 leading-snug mb-2">${s.desc}</div>
                                <div class="text-[10px] text-cyan-300/70 font-mono bg-slate-900/60 rounded px-2 py-1 border border-slate-700/50">
                                    关键信号：${s.sig}
                                </div>
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>

            <!-- 底部 CTA -->
            <div class="gradient-bg industry-banner rounded-2xl p-4 sm:p-6 mb-6 border-0">
                <div class="flex items-center gap-2 text-white/90 text-xs sm:text-sm">
                    💡 感兴趣？可以进 CANoe 模拟器对比相同的信号曲线，或者进智驾可视化页面看更大的 ACC/APA 场景。
                    <button onclick="navigate('canoe-simulator')" class="ml-auto px-3 py-1.5 rounded-lg bg-white/20 hover:bg-white/30 text-white text-xs font-bold transition-all">CANoe 模拟器 →</button>
                </div>
            </div>

        </div>
    `;

    // ============ 初始化 Three.js ============
    parkInit3D();
    // ============ 初始化 SVG 状态机 ============
    parkInitFSM();
    // ============ 初始化流水线 ============
    parkInitPipeline();
    // ============ 初始化曲线 ============
    parkInitCurves();

    if (!PARKING_STATE.isRunning) parkDrawCurves(); // 画初始静态图
};

/* ============== startParking / resetParking ============== */
window.startParking = function() {
    PARKING_STATE.isRunning = true;
    PARKING_STATE.startTime = performance.now();
    PARKING_STATE.stateProgress = 0;
    PARKING_STATE.currentState = 'IDLE';
    const btn = document.getElementById('park-start');
    if (btn) btn.textContent = '● 运行中...';
    if (btn) btn.disabled = true;
    parkLoop();
};

window.resetParking = function() {
    PARKING_STATE.isRunning = false;
    PARKING_STATE.stateProgress = 0;
    PARKING_STATE.currentState = 'IDLE';
    PARKING_STATE.signals = {
        vehicleSpeed: 0, steeringAngle: 0, longAccel: 0, latAccel: 0,
        parkState: 0, ultrasonicFL: 300, ultrasonicFR: 300,
        ultrasonicBL: 300, ultrasonicBR: 300, occupancyGrid: 0
    };
    const btn = document.getElementById('park-start');
    if (btn) { btn.textContent = '▶ 启动泊车'; btn.disabled = false; }
    if (window._parkAnimId) cancelAnimationFrame(window._parkAnimId);
    // 清空曲线缓存
    [speedData, steerData, accelData, parkData].forEach(a => a.fill(0));
    parkDrawCurves();
    parkUpdateStatusBadge(0);
    parkDrawFSM(0, null);
    parkDrawPipeline(0, null);
    // 重置 3D 小车（初始位姿：道路左端，朝 +X）
    if (window._parkCar) {
        window._parkCar.position.set(-8.5, 0, 0);
        window._parkCar.rotation.set(0, Math.PI / 2, 0);
    }
    (window._parkFrontWheels || []).forEach(g => { g.rotation.y = 0; });
    (window._parkTailLights || []).forEach(m => { m.material.emissiveIntensity = 0.25; });
    const hud = document.getElementById('park-3d-hud');
    if (hud) hud.innerHTML = '⏸ 待机 · 等待启动';
};

/* 主题切换时重建 3D 场景 + 重绘曲线（app.js toggleTheme 遍历 window._themeHooks 调用） */
window._themeHooks = window._themeHooks || [];
window._themeHooks.push(function() {
    if (document.getElementById('parking-3d')) {
        parkInit3D();
        if (!PARKING_STATE.isRunning) parkDrawCurves();
    }
});

/* ============ 主循环 ============ */
function parkLoop() {
    if (!PARKING_STATE.isRunning) return;
    const now = performance.now();
    const elapsed = now - PARKING_STATE.startTime;
    const t = Math.min(elapsed / PARKING_STATE.duration, 1);
    PARKING_STATE.stateProgress = t;

    parkUpdateStateMachine(elapsed);
    parkUpdateSignals(elapsed);
    parkUpdateStatusBadge(t);
    parkUpdate3D(t);
    parkDrawCurves();
    parkDrawFSM(t, PARKING_STATE.currentState);
    parkDrawPipeline(t, PARKING_STATE.currentState);

    if (t >= 1) {
        PARKING_STATE.isRunning = false;
        const btn = document.getElementById('park-start');
        if (btn) { btn.textContent = '▶ 重新泊车'; btn.disabled = false; }
        return;
    }
    window._parkAnimId = requestAnimationFrame(parkLoop);
}

/* ============== Three.js 3D 场景 ==============
   场景布局：道路沿 X 轴（自车朝 +X 行驶），右侧（-Z 侧）路缘 + 平行车位
   车位：x ∈ [-3.25, 2.25]（长 5.5m），z ∈ [-4.2, -2.2]（宽 2m），中心 (-0.5, -3.2)
   前车中心 (4.5, -3.2)，后车中心 (-5.5, -3.2)，均朝 +X；车长 4.5m
   heading 约定：rotation.y，车头方向向量 = (sin(h), 0, cos(h))；朝 +X 时 h = π/2
*/
function parkThemeColors() {
    const dark = document.documentElement.classList.contains('dark');
    return dark ? {
        bg: 0x0a1628, ground: 0x14203a, road: 0x0c1626, curb: 0x334155, sidewalk: 0x1c2942,
        lane: 0x22d3ee, slotEdge: 0xe2e8f0, parked: 0x5b6b82, building: 0x101b30, buildingTop: 0x1a2a47
    } : {
        bg: 0xe9eff7, ground: 0xdbe4ee, road: 0xc0cddd, curb: 0x9aa8bc, sidewalk: 0xccd6e4,
        lane: 0x0e7490, slotEdge: 0x334155, parked: 0x93a5bd, building: 0xc6d2e2, buildingTop: 0xaebdd2
    };
}

/* 泊车轨迹关键帧：[tEnd, x, z, heading]
   位置与朝向显式插值 —— 倒车段车头朝向 ≠ 运动方向（真实平行泊车是车尾先入位） */
const PARK_KEYFRAMES = [
    [0.000, -8.5,  0.00, Math.PI/2],          // IDLE
    [0.107, -8.5,  0.00, Math.PI/2],          // IDLE 结束
    [0.321, -1.6,  0.00, Math.PI/2],          // SEARCH：低速直行经过车位
    [0.500,  1.8, -0.15, Math.PI/2],          // ALIGN：与前车平行停靠
    [0.580,  1.30, -0.80, Math.PI/2 - 0.28],  // BACKING：右打满倒车，车尾入位
    [0.660,  0.55, -1.75, Math.PI/2 - 0.40],  // 最深夹角 ≈ 23°
    [0.720, -0.25, -2.55, Math.PI/2 - 0.12],  // 反打，车头甩入
    [0.750, -0.50, -3.00, Math.PI/2 - 0.02],  // 基本摆正
    [0.893, -0.50, -3.20, Math.PI/2],         // FINAL：微调居中
    [1.000, -0.50, -3.20, Math.PI/2]          // COMPLETE
];

function parkSampleTrajectory(t) {
    const K = PARK_KEYFRAMES;
    if (t <= K[0][0]) return { x: K[0][1], z: K[0][2], h: K[0][3] };
    for (let i = 1; i < K.length; i++) {
        if (t <= K[i][0]) {
            const a = K[i-1], b = K[i];
            const span = b[0] - a[0];
            const f = span > 0 ? (t - a[0]) / span : 0;
            // 平滑插值（smoothstep），避免关键帧处顿挫
            const s = f * f * (3 - 2 * f);
            return {
                x: a[1] + (b[1] - a[1]) * s,
                z: a[2] + (b[2] - a[2]) * s,
                h: a[3] + (b[3] - a[3]) * s
            };
        }
    }
    const L = K[K.length - 1];
    return { x: L[1], z: L[2], h: L[3] };
}

function parkInit3D() {
    if (typeof THREE === 'undefined') { console.warn('Three.js 未加载'); return; }
    const container = document.getElementById('parking-3d');
    if (!container) return;
    container.innerHTML = '';

    const TC = parkThemeColors();
    const w = container.clientWidth;
    const h = container.clientHeight;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(TC.bg);
    scene.fog = new THREE.Fog(TC.bg, 26, 60);

    const camera = new THREE.PerspectiveCamera(50, w / h, 0.1, 200);

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(w, h);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    container.appendChild(renderer.domElement);

    // HUD 覆盖层（状态 + 车速 + 转角）
    const hud = document.createElement('div');
    hud.id = 'park-3d-hud';
    hud.style.cssText = 'position:absolute;top:10px;left:12px;z-index:5;pointer-events:none;' +
        'font-family:monospace;font-size:11px;line-height:1.6;padding:8px 12px;border-radius:10px;' +
        'background:rgba(8,15,30,0.55);backdrop-filter:blur(6px);color:#67e8f9;border:1px solid rgba(103,232,249,0.25);';
    hud.innerHTML = '⏸ 待机 · 等待启动';
    container.style.position = 'relative';
    container.appendChild(hud);

    // 灯光
    const hemi = new THREE.HemisphereLight(0xbfe6ff, 0x2a3a55, 0.75);
    scene.add(hemi);
    const dir = new THREE.DirectionalLight(0xffffff, 0.9);
    dir.position.set(-6, 14, 6);
    dir.castShadow = true;
    dir.shadow.mapSize.set(1024, 1024);
    dir.shadow.camera.left = -16; dir.shadow.camera.right = 16;
    dir.shadow.camera.top = 16;  dir.shadow.camera.bottom = -16;
    scene.add(dir);

    // 地面（整体）
    const ground = new THREE.Mesh(
        new THREE.PlaneGeometry(46, 30),
        new THREE.MeshStandardMaterial({ color: TC.ground, roughness: 0.95 })
    );
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;
    scene.add(ground);

    // 沥青路面（沿 X 轴，z ∈ [-1.9, 1.9]）
    const road = new THREE.Mesh(
        new THREE.PlaneGeometry(46, 3.8),
        new THREE.MeshStandardMaterial({ color: TC.road, roughness: 0.9 })
    );
    road.rotation.x = -Math.PI / 2;
    road.position.y = 0.005;
    road.receiveShadow = true;
    scene.add(road);

    // 车道虚线（沿 X 轴，z = 0）
    for (let x = -20; x < 21; x += 2.6) {
        const dash = new THREE.Mesh(
            new THREE.PlaneGeometry(1.3, 0.1),
            new THREE.MeshBasicMaterial({ color: TC.lane })
        );
        dash.rotation.x = -Math.PI / 2;
        dash.position.set(x, 0.012, 0);
        scene.add(dash);
    }

    // 路缘石（z = -2.0）与人行道（z < -2）
    const curb = new THREE.Mesh(
        new THREE.BoxGeometry(46, 0.14, 0.22),
        new THREE.MeshStandardMaterial({ color: TC.curb, roughness: 0.8 })
    );
    curb.position.set(0, 0.07, -2.0);
    curb.castShadow = true;
    scene.add(curb);
    const sidewalk = new THREE.Mesh(
        new THREE.PlaneGeometry(46, 5.4),
        new THREE.MeshStandardMaterial({ color: TC.sidewalk, roughness: 0.95 })
    );
    sidewalk.rotation.x = -Math.PI / 2;
    sidewalk.position.set(0, 0.008, -4.8);
    sidewalk.receiveShadow = true;
    scene.add(sidewalk);

    // 目标车位（绿色半透明底 + 白色框线，位置一致）
    const slotFill = new THREE.Mesh(
        new THREE.PlaneGeometry(5.5, 2.0),
        new THREE.MeshStandardMaterial({ color: 0x10b981, transparent: true, opacity: 0.18 })
    );
    slotFill.rotation.x = -Math.PI / 2;
    slotFill.position.set(-0.5, 0.02, -3.2);
    scene.add(slotFill);
    const sx0 = -3.25, sx1 = 2.25, sz0 = -4.2, sz1 = -2.2;
    const slotEdges = new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(sx0, 0.025, sz1), new THREE.Vector3(sx1, 0.025, sz1), // 前边
        new THREE.Vector3(sx0, 0.025, sz0), new THREE.Vector3(sx0, 0.025, sz1), // 左边
        new THREE.Vector3(sx1, 0.025, sz0), new THREE.Vector3(sx1, 0.025, sz1)  // 右边
    ]);
    scene.add(new THREE.LineSegments(slotEdges, new THREE.LineBasicMaterial({ color: TC.slotEdge })));
    // 车位 "P" 标记（绿色小方块组合）
    const pMark = new THREE.Mesh(
        new THREE.PlaneGeometry(0.8, 0.8),
        new THREE.MeshBasicMaterial({ color: 0x10b981, transparent: true, opacity: 0.5 })
    );
    pMark.rotation.x = -Math.PI / 2;
    pMark.position.set(-0.5, 0.022, -3.2);
    scene.add(pMark);

    // 前后障碍车（均朝 +X，即 rotation.y = π/2）
    const frontCar = parkBuildCar(TC.parked, false);
    frontCar.position.set(4.5, 0, -3.2);
    frontCar.rotation.y = Math.PI / 2;
    scene.add(frontCar);
    const backCar = parkBuildCar(TC.parked, false);
    backCar.position.set(-5.5, 0, -3.2);
    backCar.rotation.y = Math.PI / 2;
    scene.add(backCar);

    // 远景楼群（增强场景纵深）
    for (let i = 0; i < 7; i++) {
        const bw = 2.2 + (i % 3) * 0.8;
        const bh = 2.5 + ((i * 37) % 5) * 1.6;
        const bx = -18 + i * 6;
        const bz = -9.5 - (i % 2) * 2;
        const b = new THREE.Mesh(
            new THREE.BoxGeometry(bw, bh, 2.4),
            new THREE.MeshStandardMaterial({ color: TC.building, roughness: 0.9 })
        );
        b.position.set(bx, bh / 2, bz);
        scene.add(b);
        const top = new THREE.Mesh(
            new THREE.BoxGeometry(bw * 0.6, 0.3, 1.6),
            new THREE.MeshStandardMaterial({ color: TC.buildingTop, roughness: 0.9 })
        );
        top.position.set(bx, bh + 0.15, bz);
        scene.add(top);
    }

    // 自车（青色，朝 +X）
    const ego = parkBuildCar(0x00d4ff, true);
    ego.position.set(-8.5, 0, 0);
    ego.rotation.y = Math.PI / 2;
    scene.add(ego);
    window._parkCar = ego;

    // 轨迹预览虚线（从 keyframes 采样）
    const trailPts = [];
    for (let i = 0; i <= 90; i++) {
        const p = parkSampleTrajectory(0.107 + (0.893 - 0.107) * (i / 90));
        trailPts.push(new THREE.Vector3(p.x, 0.03, p.z));
    }
    const trailGeo = new THREE.BufferGeometry().setFromPoints(trailPts);
    const trailLine = new THREE.Line(trailGeo, new THREE.LineDashedMaterial({
        color: 0x00e5a0, dashSize: 0.35, gapSize: 0.28, opacity: 0.55, transparent: true
    }));
    trailLine.computeLineDistances();
    scene.add(trailLine);

    // 相机跟随 + 拖拽旋转
    let isDragging = false, prevX = 0, prevY = 0;
    let yaw = 1.15, radius = 11, height = 7.5;
    const camTarget = new THREE.Vector3(-8.5, 0, 0);
    container.addEventListener('mousedown', e => { isDragging = true; prevX = e.clientX; prevY = e.clientY; });
    window.addEventListener('mouseup', () => isDragging = false);
    window.addEventListener('mousemove', e => {
        if (!isDragging) return;
        yaw += (e.clientX - prevX) * 0.008;
        height = Math.max(3, Math.min(16, height - (e.clientY - prevY) * 0.03));
        prevX = e.clientX; prevY = e.clientY;
    });
    container.addEventListener('wheel', e => {
        e.preventDefault();
        radius = Math.max(6, Math.min(20, radius + e.deltaY * 0.01));
    }, { passive: false });

    if (window._park3dAnimId) cancelAnimationFrame(window._park3dAnimId);
    function animate() {
        window._park3dAnimId = requestAnimationFrame(animate);
        // 相机平滑跟随自车
        if (window._parkCar) {
            camTarget.lerp(window._parkCar.position, 0.06);
        }
        camera.position.set(
            camTarget.x + Math.cos(yaw) * radius,
            height,
            camTarget.z + Math.sin(yaw) * radius
        );
        camera.lookAt(camTarget.x, 0.4, camTarget.z);
        renderer.render(scene, camera);
    }
    animate();

    window.addEventListener('resize', () => {
        const w2 = container.clientWidth, h2 = container.clientHeight;
        if (!w2 || !h2) return;
        camera.aspect = w2 / h2; camera.updateProjectionMatrix();
        renderer.setSize(w2, h2);
    });
}

/* 建车（车头朝 +Z，heading=0 时沿 +Z 行驶）
   isEgo：带车顶传感器灯条 / 可转向独立前轮 / 前后车灯 */
function parkBuildCar(color, isEgo = false) {
    const group = new THREE.Group();
    const c = new THREE.Color(color);

    // 车身
    const body = new THREE.Mesh(
        new THREE.BoxGeometry(1.8, 0.55, 4.5),
        new THREE.MeshStandardMaterial({ color: c, metalness: 0.35, roughness: 0.35 })
    );
    body.position.y = 0.38;
    body.castShadow = true; body.receiveShadow = true;
    group.add(body);

    // 车顶（座舱）
    const roof = new THREE.Mesh(
        new THREE.BoxGeometry(1.6, 0.45, 2.4),
        new THREE.MeshStandardMaterial({ color: 0x0f172a, metalness: 0.5, roughness: 0.2 })
    );
    roof.position.set(0, 0.88, -0.25);
    roof.castShadow = true;
    group.add(roof);

    // 车轮：前轮为独立转向 group（z=+1.45 为车头侧）
    const wheelGeo = new THREE.CylinderGeometry(0.36, 0.36, 0.28, 16);
    const wheelMat = new THREE.MeshStandardMaterial({ color: 0x111827, roughness: 0.9 });
    const frontWheels = [];
    for (const [x, z, isFront] of [[0.92, 1.45, true], [-0.92, 1.45, true], [0.92, -1.45, false], [-0.92, -1.45, false]]) {
        const w = new THREE.Mesh(wheelGeo, wheelMat);
        w.rotation.z = Math.PI / 2;
        w.castShadow = true;
        if (isFront && isEgo) {
            const steer = new THREE.Group();
            steer.position.set(x, 0.36, z);
            steer.add(w);
            group.add(steer);
            frontWheels.push(steer);
        } else {
            w.position.set(x, 0.36, z);
            group.add(w);
        }
    }
    if (isEgo) window._parkFrontWheels = frontWheels;

    // 车灯（前白 / 后红）
    const headMat = new THREE.MeshStandardMaterial({
        color: 0xf8fafc, emissive: 0xffffff, emissiveIntensity: isEgo ? 0.9 : 0.25
    });
    const tailMat = new THREE.MeshStandardMaterial({
        color: 0xef4444, emissive: 0xef4444, emissiveIntensity: 0.25
    });
    const lights = { tail: [] };
    for (const sx of [-0.55, 0.55]) {
        const hl = new THREE.Mesh(new THREE.BoxGeometry(0.34, 0.14, 0.1), headMat);
        hl.position.set(sx, 0.5, 2.26);
        group.add(hl);
        const tl = new THREE.Mesh(new THREE.BoxGeometry(0.34, 0.14, 0.1), tailMat.clone());
        tl.position.set(sx, 0.5, -2.26);
        group.add(tl);
        lights.tail.push(tl);
    }
    if (isEgo) window._parkTailLights = lights.tail;

    if (isEgo) {
        // 车顶传感器灯条（示意激光雷达/域控状态灯）
        const bar = new THREE.Mesh(
            new THREE.BoxGeometry(1.3, 0.09, 0.5),
            new THREE.MeshStandardMaterial({ color: 0x00e5a0, emissive: 0x00e5a0, emissiveIntensity: 0.9 })
        );
        bar.position.set(0, 1.14, -0.25);
        group.add(bar);
        // 超声波探头（前后各 2）
        const ussMat = new THREE.MeshBasicMaterial({ color: 0x22d3ee });
        [[0.7, 2.2], [-0.7, 2.2], [0.7, -2.2], [-0.7, -2.2]].forEach(p => {
            const d = new THREE.Mesh(new THREE.SphereGeometry(0.09, 8, 8), ussMat);
            d.position.set(p[0], 0.42, p[1]);
            group.add(d);
        });
    }
    return group;
}

/* 3D 小车更新：keyframe 插值位置与朝向（车头朝向独立于运动方向），
   前轮随转向信号偏转，倒车/制动时尾灯增亮，HUD 同步刷新 */
function parkUpdate3D(t) {
    if (!window._parkCar) return;
    const p = parkSampleTrajectory(t);
    window._parkCar.position.set(p.x, 0, p.z);
    window._parkCar.rotation.y = p.h;

    // 前轮转向（信号 -30~30° → 视觉 ±0.5 rad）
    const steerDeg = PARKING_STATE.signals.steeringAngle || 0;
    const steerRad = -steerDeg * Math.PI / 180 * 0.7;
    (window._parkFrontWheels || []).forEach(g => { g.rotation.y = steerRad; });

    // 尾灯：BACKING / FINAL 阶段高亮
    const braking = PARKING_STATE.currentState === 'BACKING' || PARKING_STATE.currentState === 'FINAL';
    (window._parkTailLights || []).forEach(m => { m.material.emissiveIntensity = braking ? 1.2 : 0.25; });

    // HUD 文本
    const hud = document.getElementById('park-3d-hud');
    if (hud) {
        const st = PARKING_STATE.STATES.find(s => s.id === PARKING_STATE.currentState);
        const v = PARKING_STATE.signals.vehicleSpeed;
        hud.innerHTML =
            '<span style="color:#00e5a0;font-weight:bold;">●</span> ' + (st ? st.name : '待机') +
            ' <span style="opacity:0.55">|</span> v ' + v.toFixed(1) + ' km/h' +
            ' <span style="opacity:0.55">|</span> δ ' + steerDeg.toFixed(0) + '°';
    }
}

/* ============== 状态机 ============== */
function parkInitFSM() {
    const svg = document.getElementById('fsm-svg');
    if (!svg) return;

    const FSM = [
        { id:'IDLE',     name:'待机',      x:60  },
        { id:'SEARCH',   name:'搜索车位',  x:190 },
        { id:'ALIGN',    name:'对准车位',  x:320 },
        { id:'BACKING',  name:'倒车入位',  x:450 },
        { id:'FINAL',    name:'最终调整',  x:580 },
        { id:'COMPLETE', name:'泊车完成',  x:680 }
    ];
    window._parkFSM = FSM;
    // 画初始
    parkDrawFSM(0, null);
}

function parkDrawFSM(t, currentId) {
    const svg = document.getElementById('fsm-svg');
    if (!svg) return;
    const FSM = window._parkFSM || [];
    const doneCount = Math.floor(t * 6);
    const currentIdx = currentId ? FSM.findIndex(f => f.id === currentId) : -1;

    let html = '';
    // 连接线
    for (let i = 0; i < FSM.length - 1; i++) {
        const isActive = i < doneCount;
        const isCurrent = i === currentIdx || (i === currentIdx - 1 && currentIdx === -1);
        const color = isActive ? '#00e5a0' : '#334155';
        const width = isActive ? 2.5 : 1.5;
        html += `<line x1="${FSM[i].x+24}" y1="60" x2="${FSM[i+1].x-24}" y2="60" stroke="${color}" stroke-width="${width}" stroke-linecap="round"/>`;
    }
    // 状态圆
    FSM.forEach((s, i) => {
        const active = i < doneCount;
        const isCur = i === currentIdx;
        const r = isCur ? 26 : 22;
        const fill = isCur ? '#00e5a0' : (active ? '#0e7490' : '#1e293b');
        const stroke = isCur ? '#00e5a0' : (active ? '#06b6d4' : '#334155');
        const textColor = active || isCur ? '#ffffff' : '#64748b';
        const pulsing = isCur ? `<circle cx="${s.x}" cy="60" r="${r+6}" fill="none" stroke="#00e5a0" stroke-width="2" opacity="0.5">
            <animate attributeName="r" from="${r+4}" to="${r+16}" dur="1.2s" repeatCount="indefinite"/>
            <animate attributeName="opacity" from="0.6" to="0" dur="1.2s" repeatCount="indefinite"/>
        </circle>` : '';
        html += `
            ${pulsing}
            <circle cx="${s.x}" cy="60" r="${r}" fill="${fill}" stroke="${stroke}" stroke-width="2"/>
            <text x="${s.x}" y="58" text-anchor="middle" fill="${textColor}" font-size="10" font-weight="bold">${i}</text>
            <text x="${s.x}" y="86" text-anchor="middle" fill="${textColor}" font-size="11" font-weight="${isCur?'900':'600'}">${s.name}</text>
        `;
    });
    svg.innerHTML = html;

    // 详情文字
    const detail = document.getElementById('fsm-detail');
    if (detail && currentIdx >= 0) {
        const st = PARKING_STATE.STATES[currentIdx];
        const curElapsed = performance.now() - PARKING_STATE.startTime;
        let remain = Math.max(0, st.duration - (curElapsed % (st.duration || 1000)));
        const remainSec = (remain / 1000).toFixed(1);
        detail.innerHTML =
            '<div class="flex items-start gap-2">' +
              '<span class="text-cyan-400 font-bold">● ' + (currentIdx+1) + '/6 当前状态：</span>' +
              '<div><strong class="text-cyan-300">' + st.name + '</strong>（' + st.desc + '）' +
                '<div class="text-slate-400 text-[10px] mt-1">预计持续 ' + (st.duration/1000).toFixed(1) + 's · 剩余约 ' + remainSec + 's</div>' +
              '</div>' +
            '</div>';
    }
}

/* ============== 控制逻辑流水线 ============== */
function parkInitPipeline() {
    const el = document.getElementById('pipeline-flow');
    if (!el) return;
    el.innerHTML = '';
    parkDrawPipeline(0, null);
}
function parkDrawPipeline(t, currentId) {
    const el = document.getElementById('pipeline-flow');
    if (!el) return;
    const MODS = [
        { name:'感知',   icon:'📷', desc:'USS+AVM+Radar → OccupancyGrid',    color:'#06b6d4' },
        { name:'规划',   icon:'🧠', desc:'Hybrid A* → RefTraj (x,y,θ,κ)',  color:'#8b5cf6' },
        { name:'控制',   icon:'🎯', desc:'MPC 预测域 2s → SteeringCmd/AccelCmd', color:'#10b981' },
        { name:'执行',   icon:'⚡', desc:'CAN 0x123/0x200 → EPS/EHB ECU',   color:'#f59e0b' }
    ];
    const done = Math.floor(t * 4);
    let html = '<div class="flex items-center h-full">';
    MODS.forEach((m, i) => {
        const active = i <= done;
        const glow = active ? 'box-shadow: 0 0 16px ' + m.color + '66; border-color: ' + m.color + ';' : 'border-color: #334155;';
        const textCol = active ? '#ffffff' : '#64748b';
        const filterStr = active ? 'brightness(1.2)' : 'grayscale(0.5)';
        const activeClass = active ? 'animate-pulse' : '';
        const bgVal = active ? (m.color + '22') : '#1e293b40';
        const statusDot = (active && i === done) ? '<div class="text-[9px] mt-0.5 font-bold" style="color:' + m.color + '">● 处理中</div>' : '';
        const arrow = i < 3 ? '<div class="text-xl mx-1" style="color:' + (active ? '#00e5a0' : '#334155') + '">→</div>' : '';

        html += '<div class="flex-1' + (i < 3 ? ' mr-2' : '') + '">';
        html += '<div class="rounded-xl border-2 ' + activeClass + ' px-3 py-2 text-center h-full flex flex-col justify-center"';
        html += ' style="background:' + bgVal + '; ' + glow + '">';
        html += '<div class="text-lg mb-0.5" style="filter:' + filterStr + '">' + m.icon + '</div>';
        html += '<div class="font-black text-[13px]" style="color:' + textCol + '">' + m.name + '</div>';
        html += statusDot;
        html += '</div></div>';
        html += arrow;
    });
    html += '</div>';
    el.innerHTML = html;

    const desc = document.getElementById('pipeline-desc');
    if (desc) {
        if (done < 4) {
            const m = MODS[done];
            desc.innerHTML = '<span class="text-cyan-300">▶ ' + m.name + ' 模块</span>：' + m.desc;
        } else {
            desc.innerHTML = '<span class="text-emerald-400">✓ 完整链路执行完毕</span> · 泊车成功完成';
        }
    }
}

/* ============== 信号曲线 ============== */
const CURVE_W = 400, CURVE_H = 110;
const CURVE_POINTS = 120;
const speedData  = new Array(CURVE_POINTS).fill(0);
const steerData  = new Array(CURVE_POINTS).fill(0);
const accelData  = new Array(CURVE_POINTS).fill(0);
const parkData   = new Array(CURVE_POINTS).fill(0);

function parkInitCurves() { parkDrawCurves(); }

function parkDrawCurves() {
    drawOneCurve('sig-speed',    speedData,  'VehicleSpeed', 'km/h', 0, 10, '#06b6d4');
    drawOneCurve('sig-steer',    steerData,  'SteeringAngle', '°',  -30, 30, '#f59e0b');
    drawOneCurve('sig-accel',    accelData,  'LongAccel',   'g',   -0.6, 0.6, '#10b981');
    drawOneCurve('sig-parkstate',parkData,   'ParkingState', '',    0, 5, '#8b5cf6');
}

function parkCurveTheme() {
    const dark = document.documentElement.classList.contains('dark');
    return dark
        ? { bg: '#0a1628', grid: '#1e3a5f', axis: '#334155', label: '#64748b' }
        : { bg: '#f4f8fc', grid: '#dbe4ee', axis: '#b0bdd0', label: '#64748b' };
}

function drawOneCurve(canvasId, data, name, unit, yMin, yMax, color) {
    const c = document.getElementById(canvasId);
    if (!c) return;
    const ctx = c.getContext('2d');
    const W = c.width, H = c.height;
    const CT = parkCurveTheme();
    // 背景
    ctx.fillStyle = CT.bg;
    ctx.fillRect(0, 0, W, H);
    // 网格
    ctx.strokeStyle = CT.grid;
    ctx.lineWidth = 0.5;
    for (let i = 1; i < 4; i++) {
        const y = (H / 4) * i;
        ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke();
    }
    // 中间零轴
    if (yMin < 0 && yMax > 0) {
        const midY = H / 2;
        ctx.strokeStyle = CT.axis;
        ctx.setLineDash([3, 3]);
        ctx.beginPath(); ctx.moveTo(0, midY); ctx.lineTo(W, midY); ctx.stroke();
        ctx.setLineDash([]);
    }
    // 曲线
    ctx.beginPath();
    for (let i = 0; i < data.length; i++) {
        const x = (i / (data.length - 1)) * W;
        const v = Math.max(yMin, Math.min(yMax, data[i]));
        const y = H - ((v - yMin) / (yMax - yMin)) * H;
        if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
    }
    ctx.strokeStyle = color;
    ctx.lineWidth = 2;
    ctx.stroke();
    // 填充
    const lastY = H - ((data[data.length-1] - yMin) / (yMax - yMin)) * H;
    ctx.lineTo(W, H);
    ctx.lineTo(0, H);
    ctx.closePath();
    const grad = ctx.createLinearGradient(0, 0, 0, H);
    grad.addColorStop(0, color + '44');
    grad.addColorStop(1, color + '00');
    ctx.fillStyle = grad;
    ctx.fill();
    // 最后点
    const lastX = W;
    ctx.beginPath();
    ctx.arc(lastX, lastY, 3.5, 0, Math.PI * 2);
    ctx.fillStyle = color;
    ctx.fill();

    // Y 轴刻度
    ctx.fillStyle = CT.label;
    ctx.font = '9px monospace';
    ctx.fillText(yMax.toFixed(1), 2, 10);
    ctx.fillText(yMin.toFixed(1), 2, H - 3);
}

/* 信号生成：按泊车阶段输出对应波形 */
function parkUpdateSignals(elapsed) {
    const d = elapsed / 1000; // 秒
    let vSpeed = 0, steer = 0, accel = 0, parkState = 0;

    if (d < 1.5) {
        // IDLE
        parkState = 0; vSpeed = 0; steer = 0; accel = 0;
    } else if (d < 4.5) {
        // SEARCH：前向低速 + 偶尔小角度打角
        parkState = 1;
        vSpeed = 8 * (d - 1.5) / 3.0;
        steer = Math.sin((d - 1.5) * 2) * 5;
        accel = 0.15 * Math.cos((d - 1.5) * 2);
    } else if (d < 7.0) {
        // ALIGN：低速 + 小角度预打
        parkState = 2;
        vSpeed = 3 - (d - 4.5) * 1.0;
        steer = 12 * Math.sin((d - 4.5) * 1.2);
        accel = -0.1;
    } else if (d < 10.5) {
        // BACKING：倒车 + 大角度反向 + 负速度
        parkState = 3;
        vSpeed = -4.5;
        steer = -25 + Math.sin((d - 7.0) * 3) * 4;
        accel = -0.05;
    } else if (d < 12.5) {
        // FINAL：低速前进 + 回正
        parkState = 4;
        vSpeed = 2;
        steer = 10 * (d - 10.5) / 2.0;
        accel = 0.08;
    } else {
        // COMPLETE
        parkState = 5;
        vSpeed = 0; steer = 0; accel = 0;
    }

    speedData.push(vSpeed); speedData.shift();
    steerData.push(steer); steerData.shift();
    accelData.push(accel); accelData.shift();
    parkData.push(parkState); parkData.shift();
}

/* 状态机更新 */
function parkUpdateStateMachine(elapsed) {
    const d = elapsed / 1000;
    let state = 'IDLE';
    if (d < 1.5) state = 'IDLE';
    else if (d < 4.5) state = 'SEARCH';
    else if (d < 7.0) state = 'ALIGN';
    else if (d < 10.5) state = 'BACKING';
    else if (d < 12.5) state = 'FINAL';
    else state = 'COMPLETE';
    PARKING_STATE.currentState = state;
}

/* 状态徽章 */
function parkUpdateStatusBadge(t) {
    const badge = document.getElementById('park-status-badge');
    const dot = document.getElementById('park-status-dot');
    if (!badge || !dot) return;
    const states = ['待机','搜索车位','对准车位','倒车入位','最终调整','泊车完成'];
    const stateIdx = Math.min(Math.floor(t * 6), 5);
    badge.innerHTML = `<span class="w-2 h-2 bg-cyan-400 rounded-full ${t<1?'':'animate-pulse'}"></span>
                       ${Math.floor(t*100)}% · ${states[stateIdx]}`;
    dot.className = 'w-2 h-2 rounded-full';
    if (t >= 0.001 && t < 0.25) dot.classList.add('bg-cyan-400');
    else if (t < 0.5) dot.classList.add('bg-amber-400');
    else if (t < 0.8) dot.classList.add('bg-violet-400');
    else dot.classList.add('bg-emerald-400');
}
