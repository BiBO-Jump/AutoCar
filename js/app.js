const state = {
    currentPage: 'home',
    userData: loadUserData(),
    selectedCourseId: null,
    lessonSectionIndex: 0,
    lessonLessonIndex: 0,
    lessonExpandedSection: null,
    currentQuiz: null,
    quizAnswers: [],
    quizCurrentIndex: 0
};

/* 复制文本到剪贴板，并在触发元素上给出反馈 */
function copyText(txt, el) {
    const done = () => {
        if (!el) return;
        const hint = el.querySelector('.copy-hint');
        if (!hint) return;
        const orig = hint.textContent;
        hint.textContent = '✓ 已复制';
        hint.classList.add('text-emerald-400');
        setTimeout(() => { hint.textContent = orig; hint.classList.remove('text-emerald-400'); }, 1500);
    };
    if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(txt).then(done).catch(done);
    } else {
        const ta = document.createElement('textarea');
        ta.value = txt; ta.style.position = 'fixed'; ta.style.opacity = '0';
        document.body.appendChild(ta); ta.select();
        try { document.execCommand('copy'); } catch (e) {}
        document.body.removeChild(ta); done();
    }
}

/* ============ 新页面 ============ */

/* UDS 诊断模拟器（独立入口，复用 canoe-sim.js 的 Diagnostics Console 逻辑） */
function renderUdsSimulator() {
    // 如果 canoe-sim.js 没加载，做个优雅 fallback
    const hasUds = typeof CANOE_SIM_STATE !== 'undefined';
    document.getElementById('main-content').innerHTML = `
        <div class="fade-in">
            <button onclick="navigate('home')" class="text-cyan-400 hover:text-cyan-300 text-sm mb-4">← 返回首页</button>

            <!-- 教学模拟声明 -->
            <div class="mb-4 rounded-xl border border-cyan-500/30 bg-cyan-500/5 px-4 py-2.5 text-[11px] sm:text-xs text-cyan-300/90 leading-relaxed flex items-start gap-2">
                <span class="text-cyan-400 font-bold flex-shrink-0">💡</span>
                <div>
                    <strong>教学模拟 · 所有 UDS 响应为虚构示例</strong> 本页面仅演示 ISO 14229 诊断服务的请求/响应流程，
                    不连接真实 ECU、CANoe、CAN 总线或任何商业软件。若你有具体 ECU 的诊断协议（DID 列表、安全访问算法、刷写脚本），可以替换下方响应数据。
                </div>
            </div>

            <div class="gradient-bg sweep rounded-3xl p-5 sm:p-8 mb-6 text-white relative overflow-hidden">
                <div class="relative z-10">
                    <div class="flex items-center gap-2 mb-2">
                        <span class="text-4xl">🔌</span>
                        <div>
                            <h1 class="text-xl sm:text-2xl font-bold">UDS 诊断模拟器</h1>
                            <p class="text-xs sm:text-sm text-cyan-100 mt-1">ISO 14229 · Diagnostic Communication · 会话 + 安全访问 + DID 读写</p>
                        </div>
                    </div>
                    <div class="flex gap-2 mt-3 flex-wrap">
                        <span class="badge bg-white/20">Service 10 会话控制</span>
                        <span class="badge bg-white/20">Service 27 安全访问</span>
                        <span class="badge bg-white/20">Service 22 读 DID</span>
                        <span class="badge bg-white/20">Service 14 清 DTC</span>
                        <span class="badge bg-white/20">Service 19 读 DTC</span>
                    </div>
                </div>
            </div>

            <div class="grid lg:grid-cols-2 gap-4">
                <!-- 左：会话链操作 -->
                <div class="card p-4 sm:p-6">
                    <h3 class="font-bold text-white mb-4 flex items-center gap-2">
                        <span>📡</span> 诊断操作面板
                    </h3>
                    ${hasUds ? `
                        <div class="text-[11px] text-cyan-300 mb-3 bg-cyan-500/10 border border-cyan-500/20 rounded p-2">
                            💡 建议顺序：先 10 03 扩展会话 → 再 27 01 解锁 → 再 22 / 19 / 14 / 3E 等
                        </div>
                        <div class="space-y-3">
                            <div>
                                <div class="text-xs text-slate-400 mb-2">1️⃣ 会话控制 (Service 10)</div>
                                <div class="flex gap-1.5 flex-wrap">
                                    <button onclick="udsSend('10 01','Default Session')" class="px-3 py-2 rounded-lg bg-slate-700 hover:bg-slate-600 text-white text-xs transition-all">10 01 默认</button>
                                    <button onclick="udsSend('10 02','Programming Session')" class="px-3 py-2 rounded-lg bg-amber-600 hover:bg-amber-700 text-white text-xs transition-all">10 02 编程</button>
                                    <button onclick="udsSend('10 03','Extended Session')" class="px-3 py-2 rounded-lg bg-violet-600 hover:bg-violet-700 text-white text-xs transition-all">10 03 扩展</button>
                                </div>
                            </div>
                            <div>
                                <div class="text-xs text-slate-400 mb-2">2️⃣ 安全访问 (Service 27)</div>
                                <div class="flex gap-1.5 flex-wrap">
                                    <button onclick="udsSend('27 01','SecurityAccess L1')" class="px-3 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs transition-all">27 01 Level1</button>
                                    <button onclick="udsSend('27 02','SecurityAccess L2')" class="px-3 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs transition-all">27 02 Level2</button>
                                    <button onclick="udsSend('27 03','SecurityAccess L3')" class="px-3 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs transition-all">27 03 Level3</button>
                                </div>
                            </div>
                            <div>
                                <div class="text-xs text-slate-400 mb-2">3️⃣ 读 DID (Service 22)</div>
                                <div class="flex gap-1.5 flex-wrap">
                                    <button onclick="udsSend('22 F1 90','Read DID F190')" class="px-3 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-700 text-white text-xs transition-all">22 F1 90 硬件版本</button>
                                    <button onclick="udsSend('22 F1 80','Read DID F180')" class="px-3 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-700 text-white text-xs transition-all">22 F1 80 VIN</button>
                                    <button onclick="udsSend('22 DA 86','Read DID DA86')" class="px-3 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-700 text-white text-xs transition-all">22 DA 86 车速</button>
                                </div>
                            </div>
                            <div>
                                <div class="text-xs text-slate-400 mb-2">4️⃣ DTC 操作 + 其他</div>
                                <div class="flex gap-1.5 flex-wrap">
                                    <button onclick="udsSend('19 02','Read DTC Stored')" class="px-3 py-2 rounded-lg bg-amber-600 hover:bg-amber-700 text-white text-xs transition-all">19 02 读故障</button>
                                    <button onclick="udsSend('14 FF FF FF','Clear DTC')" class="px-3 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white text-xs transition-all">14 清故障</button>
                                    <button onclick="udsSend('3E 80','TesterPresent')" class="px-3 py-2 rounded-lg bg-slate-600 hover:bg-slate-500 text-white text-xs transition-all">3E 心跳</button>
                                    <button onclick="udsSend('11 01','ECU Reset')" class="px-3 py-2 rounded-lg bg-red-700 hover:bg-red-800 text-white text-xs transition-all">11 复位</button>
                                </div>
                            </div>
                        </div>
                    ` : '<div class="text-center py-10 text-slate-400">❌ 加载失败，请刷新页面</div>' }
                </div>

                <!-- 右：日志 + 说明 -->
                <div class="space-y-4">
                    <div class="card p-4">
                        <div class="flex items-center justify-between mb-2">
                            <div class="text-xs font-bold text-white">📋 UDS 通信日志 (ISO-TP 传输)</div>
                            <span id="uds-session-badge" class="badge badge-cyan text-[10px]">默认会话</span>
                        </div>
                        <div id="uds-sim-log" class="bg-black/60 rounded-lg p-3 h-64 overflow-y-auto font-mono text-[11px] border border-slate-700">
                            <div class="text-slate-500">// 发送 UDS 请求后，这里会显示 ISO-TP 完整帧 + 正/负响应</div>
                            <div class="text-slate-600 mt-1">// 7E0 (11bit) / 18DAF101 (29bit) → ECU 物理寻址</div>
                        </div>
                        <button onclick="document.getElementById('uds-sim-log').innerHTML=''" class="mt-2 text-[10px] text-slate-500 hover:text-slate-300">清空日志</button>
                    </div>
                    <div class="card p-4">
                        <div class="text-xs font-bold text-white mb-2">📖 核心概念速查</div>
                        <div class="space-y-1.5 text-[11px] text-slate-300">
                            <div><code class="text-cyan-300">0x7DF</code> 功能寻址（广播所有 ECU）/ <code class="text-cyan-300">0x7E0</code> 物理寻址（单 ECU）</div>
                            <div><code class="text-emerald-300">10 01</code> 默认会话（仅基础诊断）</div>
                            <div><code class="text-emerald-300">10 03</code> 扩展会话（解锁后能读写 DID）</div>
                            <div><code class="text-amber-300">27 xx</code> 安全访问（发 seed → 算 key → 发 key）</div>
                            <div><code class="text-red-300">7F 服务 NRC</code> 否定响应：12=不支持, 22=条件不满足, 33=安全锁定</div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- 诊断链图 -->
            <div class="card p-4 sm:p-6 mt-4">
                <h3 class="font-bold text-white mb-4">🔗 标准诊断会话链</h3>
                <div class="flex flex-wrap items-center gap-2 text-xs font-mono">
                    ${['10 01','→','默认会话可 22/19','→','10 03','→','扩展会话解锁','→','27 01','→','67 01 正响应','→','22 F1 90 / 2E F1 90','→','读写成功'].map((s,i)=>{
                        const arrow = ['→','→','→','→','→','→','→'][0];
                        const isArrow = s==='→';
                        return `<span class="${isArrow?'text-slate-500':(s.includes('10')?'text-cyan-400':(s.includes('27')?'text-emerald-400':(s.includes('7F')||s.includes('失败')?'text-red-400':'text-amber-400')))} px-2 py-1 ${isArrow?'':'bg-slate-800 rounded border border-slate-700'}">${s}</span>`;
                    }).join('')}
                </div>
                <div class="text-[10px] text-slate-500 mt-2">💡 UDS 完整流程 = 会话切换 → 安全访问（多轮 seed/key）→ 执行读写/清码/刷写操作</div>
            </div>
        </div>
    `;
    // 绑定独立 uds 函数（不影响 canoe-sim.js 的全局 udsSend）
    if (typeof CANOE_SIM_STATE !== 'undefined') {
        const logEl = () => document.getElementById('uds-sim-log');
        const badgeEl = () => document.getElementById('uds-session-badge');
        const UDS_MAP = {
            '10 01':  { pos:'50 01', label:'默认会话' },
            '10 02':  { pos:'50 02', label:'编程会话' },
            '10 03':  { pos:'50 03', label:'扩展会话', session:'extend' },
            '27 01':  { pos:'67 01', label:'安全访问 L1', require:'extend' },
            '27 02':  { pos:'67 02', label:'安全访问 L2', require:'extend' },
            '27 03':  { pos:'67 03', label:'安全访问 L3', require:'extend' },
            '22 F1 90': { pos:'62 F1 90 01 04 15 20', label:'读 DID F190 硬件版本', require:'extend' },
            '22 F1 80': { pos:'62 F1 80 LF 17 00', label:'读 DID F180 VIN', require:'extend' },
            '22 DA 86': { pos:'62 DA 86 00 32 00 00', label:'读 DID DA86 车速', require:'extend' },
            '19 02':  { pos:'59 02 44 45 4D 4F', label:'读已存储 DTC' },
            '14 FF FF FF': { pos:'54', label:'清除所有 DTC' },
            '3E 80':  { pos:'7E 80', label:'心跳 TesterPresent' },
            '11 01':  { pos:'51 01', label:'ECU 复位' }
        };
        let udsSession = 'default';
        window.udsSend = function(raw, name) {
            const log = logEl();
            if (!log) return;
            const entry = UDS_MAP[raw.toUpperCase()];
            const line = (cls, html) => { const d = document.createElement('div'); d.className = cls; d.innerHTML = html; log.appendChild(d); log.scrollTop = log.scrollHeight; };
            line('text-slate-400', `<span class="text-cyan-400">▶</span> 发送: 7E0 ${raw}  <span class="text-slate-500">[${name||''}]</span>`);
            setTimeout(() => {
                if (!entry) {
                    line('text-red-400', `<span class="text-red-500">✗</span> 响应: 7E8 7F ${raw.split(' ')[0]} 11  <span class="text-red-400">[NRC ServiceNotSupported]</span>`);
                    return;
                }
                if (entry.require === 'extend' && udsSession !== 'extend') {
                    line('text-red-400', `<span class="text-red-500">✗</span> 响应: 7E8 7F ${raw.split(' ')[0]} 33  <span class="text-red-400">[NRC SecurityAccessDenied - 请先 10 03]</span>`);
                    return;
                }
                const stamp = new Date().toLocaleTimeString('en-US', { hour12: false });
                line('text-emerald-400', `<span class="text-emerald-500">✓</span> ${stamp} 响应: 7E8 ${entry.pos}  <span class="text-emerald-300">[${entry.label}]</span>`);
                if (entry.session) udsSession = entry.session;
                if (badgeEl()) {
                    badgeEl().textContent = `当前: ${udsSession === 'extend' ? '扩展会话 10 03' : udsSession === 'programming' ? '编程会话 10 02' : '默认会话 10 01'}`;
                }
            }, 150);
        };
    }
}

/* 学习路线（技能树） */
function renderLearningPath() {
    const stages = [
        {
            phase:'第 1 阶段', title:'通用基础阶段（全域必学）',
            desc:'所有方向都必须掌握的基本功，先打地基再选域。',
            color:'from-cyan-400 to-cyan-600',
            items:['测试基础','整车 EE 架构与五大域认知','车载网络通信协议','车载测试工具链']
        },
        {
            phase:'第 2 阶段', title:'域专项阶段',
            desc:'选择一个或多个目标域深入，ADAS 方向已细化，其余域内容整理中。',
            color:'from-emerald-400 to-emerald-600',
            domains:[
                { name:'智能驾驶域（ADAS 方向）', icon:'🚘', color:'from-violet-400 to-violet-600',
                  items:['ADAS 核心功能与底层逻辑','ADAS 状态机与运行模式','ADAS 测试方法与落地执行'] },
                { name:'智能座舱域专项', icon:'🎯', color:'from-emerald-400 to-emerald-600', items:[] },
                { name:'动力域专项',     icon:'⚡', color:'from-amber-400 to-amber-600',   items:[] },
                { name:'底盘域专项',     icon:'🛞', color:'from-cyan-400 to-cyan-600',     items:[] },
                { name:'车身域专项',     icon:'🚪', color:'from-pink-400 to-pink-600',     items:[] }
            ]
        },
        {
            phase:'第 3 阶段', title:'自动化测试',
            desc:'用脚本与工具链替代手工重复操作，提升测试效率与覆盖率。',
            color:'from-violet-400 to-violet-600',
            items:['CAPL 脚本','Shell / Python 自动化','测试框架搭建','CI/CD 集成']
        },
        {
            phase:'第 4 阶段', title:'求职落地阶段',
            desc:'从学习到入职，闭环交付。',
            color:'from-pink-400 to-pink-600',
            items:['项目实战','简历投递','面试准备']
        }
    ];
    document.getElementById('main-content').innerHTML = `
        <div class="fade-in">
            <div class="gradient-bg sweep rounded-3xl p-5 sm:p-8 mb-4 text-white">
                <h1 class="text-xl sm:text-2xl md:text-3xl font-bold">🗺️ 车载测试工程师 · 学习路线</h1>
                <p class="text-cyan-100 text-xs sm:text-sm mt-2 max-w-xl">从通用基础到域专项，再到自动化与求职落地，分阶段系统成长。</p>
            </div>
            <div class="mb-6 rounded-xl border border-cyan-500/25 bg-cyan-500/5 px-4 py-2.5 text-[11px] sm:text-xs text-cyan-200/80">
                💡 按阶段推进：先打牢通用基础，再选择目标域深入，最后通过自动化与项目实战完成求职落地。各阶段知识点在「课程」中均有对应模块，建议边学边练。
            </div>
            <div class="relative pl-8 sm:pl-10">
                <div class="absolute left-3 sm:left-4 top-4 bottom-4 w-0.5 bg-gradient-to-b from-cyan-500 via-emerald-500 to-pink-500"></div>
                ${stages.map((s,i) => `
                    <div class="relative mb-6 slide-up" style="animation-delay:${i*0.05}s">
                        <div class="absolute -left-[26px] sm:-left-[30px] top-3 w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-gradient-to-br ${s.color} flex items-center justify-center text-[10px] sm:text-xs font-bold text-white shadow-lg">
                            ${i+1}
                        </div>
                        <div class="card p-4">
                            <div class="flex flex-wrap items-center gap-2 mb-2">
                                <span class="badge badge-cyan text-[10px]">${s.phase}</span>
                                <h3 class="font-bold text-white text-sm sm:text-base">${s.title}</h3>
                            </div>
                            <p class="text-xs text-slate-400 mb-3">${s.desc}</p>
                            ${s.items ? `
                                <div class="flex flex-wrap gap-1.5">
                                    ${s.items.map(it => `<span class="badge text-[11px]">${it}</span>`).join('')}
                                </div>
                            ` : ''}
                            ${s.domains ? `
                                <div class="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                                    ${s.domains.map(d => `
                                        <div class="border border-slate-700 rounded-xl p-3 hover:border-cyan-500/40 transition-colors">
                                            <div class="flex items-center gap-2 mb-2">
                                                <span class="w-8 h-8 rounded-lg bg-gradient-to-br ${d.color} flex items-center justify-center text-base flex-shrink-0">${d.icon}</span>
                                                <span class="font-semibold text-slate-200 text-sm">${d.name}</span>
                                            </div>
                                            ${d.items && d.items.length ? `
                                                <ul class="space-y-1">
                                                    ${d.items.map(it => `<li class="text-[11px] text-slate-400 flex items-start gap-1.5"><span class="text-cyan-400 mt-0.5">▸</span><span>${it}</span></li>`).join('')}
                                                </ul>
                                            ` : `<div class="text-[11px] text-slate-500 italic">专项内容整理中</div>`}
                                        </div>
                                    `).join('')}
                                </div>
                            ` : ''}
                        </div>
                    </div>
                `).join('')}
            </div>
        </div>
    `;
}

/* 方向（行业趋势 + 技术栈 + 大厂） */
function renderDirection() {
    const domains = [
        { id:'adas',       icon:'🚘', name:'智驾域',     color:'from-violet-400 to-violet-600',
          desc:`L3 规模化落地，<span class="text-cyan-300 font-semibold">无图智驾</span>、<span class="text-cyan-300 font-semibold">世界模型</span>持续迭代` },
        { id:'chassis',    icon:'🛞', name:'底盘域',     color:'from-cyan-400 to-cyan-600',
          desc:`<span class="text-cyan-300 font-semibold">EMB 线控制动</span>、<span class="text-cyan-300 font-semibold">SBW 线控转向</span>、<span class="text-cyan-300 font-semibold">主动悬架</span>量产上量，高阶智驾核心执行底座` },
        { id:'cockpit',    icon:'🎯', name:'座舱域',     color:'from-emerald-400 to-emerald-600',
          desc:`端侧大模型上车，<span class="text-cyan-300 font-semibold">AI 语音 Agent</span>、多模态交互，从指令响应转向主动场景服务` },
        { id:'body',       icon:'🚪', name:'车身域',     color:'from-pink-400 to-pink-600',
          desc:`智能车身域控、<span class="text-cyan-300 font-semibold">数字钥匙</span>、灯光与门窗集中控制、整车网络安全持续升级` },
        { id:'powertrain', icon:'⚡', name:'电池三电',   color:'from-amber-400 to-amber-600',
          desc:`<span class="text-cyan-300 font-semibold">800V 高压快充</span>、电池热管理、<span class="text-cyan-300 font-semibold">半固态电池</span>进入装车验证阶段` }
    ];
    const tags = [
        { label:'L3 测试',       act:`navigate('domain',{domain:'adas'})` },
        { label:'线控底盘',      act:`navigate('domain',{domain:'chassis'})` },
        { label:'AI 座舱语音',   act:`navigate('domain',{domain:'cockpit'})` },
        { label:'车身域',        act:`navigate('domain',{domain:'body'})` },
        { label:'电池测试',      act:`navigate('domain',{domain:'powertrain'})` },
        { label:'AUTOSAR',       act:`navigate('courses')` },
        { label:'HIL 仿真',      act:`navigate('courses')` }
    ];
    document.getElementById('main-content').innerHTML = `
        <div class="fade-in">
            <div class="gradient-bg sweep rounded-3xl p-5 sm:p-8 mb-4 text-white">
                <h1 class="text-xl sm:text-2xl md:text-3xl font-bold">🧭 行业方向 · 全域技术格局</h1>
                <p class="text-cyan-100 text-xs sm:text-sm mt-2 max-w-xl">智驾、底盘、座舱、车身、三电五大域协同演进，法规与人才机会同步升级。</p>
            </div>

            <!-- 全域技术方向 -->
            <div class="card p-4 sm:p-6 mb-6">
                <h3 class="font-bold text-white mb-4 flex items-center gap-2">🌐 全域技术方向</h3>
                <div class="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    ${domains.map(d => `
                        <button onclick="navigate('domain',{domain:'${d.id}'})" class="text-left border border-slate-700 rounded-xl p-4 hover:border-cyan-500/50 transition-all group">
                            <div class="flex items-center gap-2 mb-2">
                                <span class="w-9 h-9 rounded-lg bg-gradient-to-br ${d.color} flex items-center justify-center text-lg flex-shrink-0 group-hover:scale-110 transition-transform">${d.icon}</span>
                                <span class="font-bold text-white text-sm">${d.name}</span>
                                <span class="ml-auto text-cyan-400 text-xs">✅</span>
                            </div>
                            <p class="text-[11px] sm:text-xs text-slate-400 leading-relaxed">${d.desc}</p>
                        </button>
                    `).join('')}
                </div>
            </div>

            <!-- 法规节点 -->
            <div class="card p-4 sm:p-6 mb-6">
                <h3 class="font-bold text-white mb-4 flex items-center gap-2">⚖️ 法规节点</h3>
                <div class="grid sm:grid-cols-2 gap-3">
                    <div class="border border-amber-500/30 bg-amber-500/5 rounded-xl p-4">
                        <div class="text-amber-400 font-bold text-lg sm:text-xl tracking-wide">2027.01.01</div>
                        <div class="mt-2 text-xs sm:text-sm text-slate-300">
                            <span class="text-cyan-300 font-semibold">GB 47955-2026</span>（L2 辅助驾驶安全）<span class="text-amber-300 font-semibold"> 强制实施</span>
                        </div>
                    </div>
                    <div class="border border-amber-500/30 bg-amber-500/5 rounded-xl p-4">
                        <div class="text-amber-400 font-bold text-lg sm:text-xl tracking-wide">2027.07.01</div>
                        <div class="mt-2 text-xs sm:text-sm text-slate-300">
                            <span class="text-cyan-300 font-semibold">GB 44721-2026</span>（L3/L4 自动驾驶安全）<span class="text-amber-300 font-semibold"> 强制实施</span>
                        </div>
                    </div>
                </div>
            </div>

            <!-- 人才机会 -->
            <div class="card p-4 sm:p-6 mb-6">
                <h3 class="font-bold text-white mb-3 flex items-center gap-2">💼 人才机会</h3>
                <p class="text-xs sm:text-sm text-slate-400 leading-relaxed">
                    智驾、底盘、座舱 AI 交互、车身、三电方向的
                    <span class="text-emerald-300 font-semibold">测试、HIL、场景验证</span>
                    岗位持续放量，<span class="text-emerald-300 font-semibold">全域复合型车载验证工程师</span>溢价更高。
                </p>
            </div>

            <!-- 标签导航 -->
            <div class="card p-4 sm:p-6 mb-2">
                <h3 class="font-bold text-white mb-3 flex items-center gap-2">🏷️ 标签导航</h3>
                <div class="flex flex-wrap gap-2">
                    ${tags.map(t => `
                        <button onclick="${t.act}" class="badge text-[11px] cursor-pointer hover:scale-105 transition-transform">${t.label}</button>
                    `).join('')}
                </div>
                <p class="text-[10px] text-slate-500 mt-3">数据参考：工信部、乘联会行业报告</p>
            </div>
        </div>
    `;
}

/* 模拟器占位 */
/* Linux 终端模拟器 + 学习资源 */
function renderLinuxSimulator() {
    document.getElementById('main-content').innerHTML = `
        <div class="fade-in">
            <button onclick="navigate('home')" class="text-cyan-400 hover:text-cyan-300 text-sm mb-4">← 返回首页</button>

            <div class="gradient-bg sweep rounded-3xl p-5 sm:p-8 mb-4 text-white">
                <h1 class="text-xl sm:text-2xl md:text-3xl font-bold">🐧 Linux 命令学习与终端模拟</h1>
                <p class="text-cyan-100 text-xs sm:text-sm mt-2 max-w-2xl">内置简易终端用于熟悉常用指令，配合下方在线模拟器、文字与视频教程系统学习。</p>
            </div>

            <div class="mb-6 rounded-xl border border-amber-500/25 bg-amber-500/5 px-4 py-2.5 text-[11px] sm:text-xs text-amber-200/80">
                ⚠️ 本终端为浏览器内教学模拟，不连接真实 Linux 系统，仅支持常用指令子集，用于车载测试入门练习。
            </div>

            <!-- 内置终端模拟器 -->
            <div class="card p-3 sm:p-4 mb-6">
                <div class="flex items-center gap-1.5 mb-2">
                    <span class="w-3 h-3 rounded-full bg-red-400"></span>
                    <span class="w-3 h-3 rounded-full bg-amber-400"></span>
                    <span class="w-3 h-3 rounded-full bg-emerald-400"></span>
                    <span class="ml-2 text-xs text-slate-400">tester@car-study: ~</span>
                    <button onclick="linuxClear()" class="ml-auto text-[10px] text-slate-400 hover:text-cyan-300 px-2 py-0.5 border border-slate-700 rounded">清空</button>
                </div>
                <div id="linux-terminal" class="bg-slate-950 border border-slate-700 rounded-lg p-3 h-72 sm:h-80 overflow-y-auto font-mono text-xs text-emerald-300 leading-relaxed"></div>
                <div class="mt-2 flex items-center gap-2">
                    <span class="text-emerald-400 font-mono text-xs">$</span>
                    <input id="linux-input" type="text" autocomplete="off" autofocus
                           class="flex-1 bg-slate-950 border border-slate-700 rounded px-2 py-1.5 text-emerald-300 font-mono text-xs focus:outline-none focus:border-cyan-500"
                           placeholder="输入命令，例如 ls、cd /、cat readme.txt；输入 help 查看支持的命令"
                           onkeydown="if(event.key==='Enter'){linuxRun(this.value);this.value='';}">
                </div>
            </div>

            <!-- 在线模拟器 -->
            <div class="card p-4 sm:p-6 mb-6">
                <h3 class="font-bold text-white mb-3 flex items-center gap-2">🖥️ 在线 Linux 模拟器</h3>
                <p class="text-xs text-slate-400 mb-3">在真实 Linux 环境中练习命令，点击在新标签页打开。</p>
                <div class="grid sm:grid-cols-2 gap-3">
                    <a href="https://tools.ainexis.cn/code/linux-simulator" target="_blank" rel="noopener" class="border border-slate-700 rounded-xl p-4 hover:border-cyan-500/50 transition-all block">
                        <div class="font-semibold text-cyan-300 text-sm mb-1">ainexis · Linux Simulator</div>
                        <div class="text-[11px] text-slate-400">tools.ainexis.cn/code/linux-simulator</div>
                    </a>
                    <a href="https://onlinelinuxterminal.com/zh/" target="_blank" rel="noopener" class="border border-slate-700 rounded-xl p-4 hover:border-cyan-500/50 transition-all block">
                        <div class="font-semibold text-cyan-300 text-sm mb-1">Online Linux Terminal</div>
                        <div class="text-[11px] text-slate-400">onlinelinuxterminal.com/zh/</div>
                    </a>
                </div>
            </div>

            <!-- 文字教程 -->
            <div class="card p-4 sm:p-6 mb-6">
                <h3 class="font-bold text-white mb-3 flex items-center gap-2">📖 文字教程</h3>
                <div class="grid sm:grid-cols-2 gap-3">
                    <a href="https://www.zouht.com/4399.html" target="_blank" rel="noopener" class="border border-slate-700 rounded-xl p-4 hover:border-cyan-500/50 transition-all block">
                        <div class="font-semibold text-emerald-300 text-sm mb-1">Linux 常用命令详解</div>
                        <div class="text-[11px] text-slate-400">zouht.com/4399.html</div>
                    </a>
                    <a href="https://www.runoob.com/linux/linux-command-manual.html" target="_blank" rel="noopener" class="border border-slate-700 rounded-xl p-4 hover:border-cyan-500/50 transition-all block">
                        <div class="font-semibold text-emerald-300 text-sm mb-1">菜鸟教程 · Linux 命令大全</div>
                        <div class="text-[11px] text-slate-400">runoob.com/linux/linux-command-manual.html</div>
                    </a>
                </div>
            </div>

            <!-- 视频教程 -->
            <div class="card p-4 sm:p-6 mb-6">
                <h3 class="font-bold text-white mb-3 flex items-center gap-2">🎬 视频教程</h3>
                <a href="https://www.bilibili.com/video/BV1oTYfztEYW/?p=11" target="_blank" rel="noopener" class="border border-slate-700 rounded-xl p-4 hover:border-cyan-500/50 transition-all block flex items-center gap-3">
                    <span class="text-3xl">📺</span>
                    <div>
                        <div class="font-semibold text-pink-300 text-sm">B 站 · Linux 命令入门</div>
                        <div class="text-[11px] text-slate-400">BV1oTYfztEYW · P11</div>
                    </div>
                </a>
            </div>

            <!-- 常用命令速查 -->
            <div class="card p-4 sm:p-6 mb-2">
                <h3 class="font-bold text-white mb-3 flex items-center gap-2">📋 常用命令速查</h3>
                <div class="grid sm:grid-cols-2 gap-x-4 gap-y-1.5 text-xs">
                    ${[
                        ['ls','列出目录内容'],['cd','切换目录'],['pwd','显示当前路径'],['cat','查看文件内容'],
                        ['mkdir','创建目录'],['touch','创建空文件'],['rm','删除文件/目录'],['cp','复制文件'],
                        ['mv','移动/重命名'],['grep','文本搜索'],['echo','输出文本'],['clear','清屏']
                    ].map(c=>`<div class="flex gap-2"><code class="text-cyan-300 font-mono bg-slate-800/60 rounded px-1.5 min-w-[60px] text-center">${c[0]}</code><span class="text-slate-400">${c[1]}</span></div>`).join('')}
                </div>
            </div>
        </div>
    `;
    linuxInit();
}

/* Linux 终端逻辑 */
let _linuxFS, _linuxCwd, _linuxHistory;
function linuxInit() {
    _linuxCwd = ['home','tester'];
    _linuxHistory = [];
    _linuxFS = {
        name:'/', type:'dir', children:{
            home:{ name:'home', type:'dir', children:{
                tester:{ name:'tester', type:'dir', children:{
                    'readme.txt':{ name:'readme.txt', type:'file', content:'欢迎使用车载学习平台 Linux 模拟器。\n输入 help 查看支持的命令，尝试 ls、cd、cat 等指令。' },
                    projects:{ name:'projects', type:'dir', children:{
                        'canoe.capl':{ name:'canoe.capl', type:'file', content:'// CAPL 示例脚本\non message 0x123 { write("收到报文"); }' },
                        'test.py':{ name:'test.py', type:'file', content:'# Python 测试脚本\nprint("hello linux")' }
                    }}
                }}
            }},
            etc:{ name:'etc', type:'dir', children:{
                'hostname':{ name:'hostname', type:'file', content:'car-study' }
            }},
            bin:{ name:'bin', type:'dir', children:{} }
        }
    };
    linuxPrint('Linux 5.15.0-car-study x86_64  (教学模拟环境)');
    linuxPrint('输入 help 查看可用命令。');
    document.getElementById('linux-input').focus();
}
function linuxPathStr() { return '/' + _linuxCwd.join('/'); }
function linuxGetNode(pathArr) {
    let node = _linuxFS;
    for (const p of pathArr) {
        if (!node.children || !node.children[p]) return null;
        node = node.children[p];
    }
    return node;
}
function linuxResolve(arg) {
    if (!arg) return _linuxCwd.slice();
    if (arg.startsWith('/')) return arg.split('/').filter(Boolean);
    const arr = _linuxCwd.slice();
    for (const p of arg.split('/')) {
        if (p === '' || p === '.') continue;
        if (p === '..') { if (arr.length) arr.pop(); }
        else arr.push(p);
    }
    return arr;
}
function linuxPrint(text) {
    const term = document.getElementById('linux-terminal');
    if (!term) return;
    const line = document.createElement('div');
    line.textContent = text;
    line.className = 'whitespace-pre-wrap break-all';
    term.appendChild(line);
    term.scrollTop = term.scrollHeight;
}
function linuxClear() {
    const term = document.getElementById('linux-terminal');
    if (term) term.innerHTML = '';
}
function linuxRun(raw) {
    const cmd = (raw || '').trim();
    linuxPrint('tester@car-study:' + linuxPathStr() + '$ ' + raw);
    if (!cmd) return;
    _linuxHistory.push(cmd);
    const parts = cmd.split(/\s+/);
    const c = parts[0];
    const args = parts.slice(1);
    switch (c) {
        case 'help':
            linuxPrint('支持命令: help ls cd pwd cat echo mkdir touch rm cp mv grep tree clear whoami date uname history');
            break;
        case 'ls': {
            const target = args.find(a=>!a.startsWith('-'));
            const node = target ? linuxGetNode(linuxResolve(target)) : linuxGetNode(_linuxCwd);
            if (!node) { linuxPrint('ls: 无法访问: 没有那个文件或目录'); break; }
            if (node.type === 'file') { linuxPrint(node.name); break; }
            const names = Object.keys(node.children || {});
            linuxPrint(names.length ? names.join('  ') : '');
            break;
        }
        case 'cd': {
            if (!args[0]) { _linuxCwd = ['home','tester']; break; }
            const node = linuxGetNode(linuxResolve(args[0]));
            if (!node || node.type !== 'dir') { linuxPrint('cd: 没有那个目录: ' + args[0]); break; }
            _linuxCwd = linuxResolve(args[0]);
            break;
        }
        case 'pwd': linuxPrint(linuxPathStr()); break;
        case 'cat': {
            if (!args[0]) { linuxPrint('cat: 缺少文件参数'); break; }
            const node = linuxGetNode(linuxResolve(args[0]));
            if (!node) { linuxPrint('cat: ' + args[0] + ': 没有那个文件'); break; }
            if (node.type === 'dir') { linuxPrint('cat: ' + args[0] + ': 是一个目录'); break; }
            linuxPrint(node.content || '');
            break;
        }
        case 'echo': linuxPrint(args.join(' ')); break;
        case 'mkdir': {
            if (!args[0]) { linuxPrint('mkdir: 缺少目录名'); break; }
            const parent = linuxGetNode(_linuxCwd);
            if (parent.children[args[0]]) { linuxPrint('mkdir: 目录已存在'); break; }
            parent.children[args[0]] = { name:args[0], type:'dir', children:{} };
            break;
        }
        case 'touch': {
            if (!args[0]) break;
            const parent = linuxGetNode(_linuxCwd);
            if (!parent.children[args[0]]) parent.children[args[0]] = { name:args[0], type:'file', content:'' };
            break;
        }
        case 'rm': {
            if (!args[0]) { linuxPrint('rm: 缺少参数'); break; }
            const parent = linuxGetNode(_linuxCwd);
            if (!parent.children[args[0]]) { linuxPrint('rm: 无法删除: 没有那个文件或目录'); break; }
            delete parent.children[args[0]];
            break;
        }
        case 'tree': linuxPrint(_linuxTreeStr(linuxGetNode(_linuxCwd), 0, true)); break;
        case 'whoami': linuxPrint('tester'); break;
        case 'date': linuxPrint(new Date().toString()); break;
        case 'uname': linuxPrint(args.includes('-a') ? 'Linux car-study 5.15.0 #1 x86_64 GNU/Linux' : 'Linux'); break;
        case 'grep': {
            if (args.length < 2) { linuxPrint('用法: grep <关键词> <文件>'); break; }
            const node = linuxGetNode(linuxResolve(args[1]));
            if (!node || node.type !== 'file') { linuxPrint('grep: ' + args[1] + ': 没有那个文件'); break; }
            const kw = args[0];
            const lines = (node.content || '').split('\n').filter(l => l.includes(kw));
            linuxPrint(lines.length ? lines.join('\n') : '');
            break;
        }
        case 'history': linuxPrint(_linuxHistory.map((h,i)=>'  '+(i+1)+'  '+h).join('\n')); break;
        case 'clear': linuxClear(); break;
        default: linuxPrint(c + ': 命令未找到，输入 help 查看支持的命令');
    }
}
function _linuxTreeStr(node, depth, isRoot) {
    let out = isRoot ? '.\n' : '';
    const names = Object.keys(node.children || {});
    names.forEach((n, i) => {
        const child = node.children[n];
        const last = i === names.length - 1;
        out += '  '.repeat(depth) + (last ? '└── ' : '├── ') + (child.type === 'dir' ? n + '/' : n) + '\n';
        if (child.type === 'dir') out += _linuxTreeStr(child, depth + 1, false);
    });
    return out;
}

function renderToolkitPlaceholder(kind) {
    const map = {
        linux: { name:'Linux 命令模拟器', icon:'🐧', desc:'模拟终端 + 指令练习题', color:'from-amber-400 to-amber-600',
                 items:['ls / cd / pwd / cat','grep / awk / sed','shell 脚本基础','练习题：输入对应命令'] },
        zlg:   { name:'周立功 USBCAN',    icon:'🎛️', desc:'USBCAN-II / USBCAN-2A / 周立功 ZCANPRO 模拟', color:'from-red-400 to-red-600',
                 items:['驱动安装 + 设备识别','波特率 / 滤波器配置','USBCAN 收发报文','ZCANPRO Trace 分析'] }
    };
    const c = map[kind];
    document.getElementById('main-content').innerHTML = `
        <div class="fade-in">
            <button onclick="navigate('home')" class="text-cyan-400 hover:text-cyan-300 text-sm mb-4">← 返回首页</button>
            <div class="card p-6 sm:p-10 text-center relative overflow-hidden">
                <div class="absolute top-0 right-0 w-64 h-64 bg-cyan-500/5 rounded-full -translate-y-1/2 translate-x-1/2"></div>
                <div class="relative z-10">
                    <div class="text-6xl mb-4 pop-in">${c.icon}</div>
                    <h1 class="text-xl sm:text-2xl font-bold text-white mb-2">${c.name}</h1>
                    <p class="text-sm text-slate-400 mb-4">${c.desc}</p>
                    <div class="inline-flex items-center gap-2 bg-cyan-500/10 border border-cyan-500/30 rounded-full px-4 py-2 text-xs text-cyan-400 mb-6">
                        <span class="w-2 h-2 bg-cyan-400 rounded-full animate-pulse"></span>
                        功能开发中 · 即将上线
                    </div>
                    <div class="text-left max-w-md mx-auto">
                        <div class="text-xs text-slate-400 mb-2">📋 已规划的学习内容：</div>
                        <div class="flex flex-wrap gap-1.5">
                            ${c.items.map(i => `<span class="badge">${i}</span>`).join('')}
                        </div>
                    </div>
                    <div class="mt-6 text-[10px] text-slate-500">
                        💡 先用 CANoe 模拟器和 UDS 诊断练手，Linux / 周立功的核心概念和 CANoe 是相通的
                    </div>
                </div>
            </div>
        </div>
    `;
}

function init() {
    renderNavbar();
    renderFooter();
    navigate('home');
}

function renderNavbar() {
    const nav = document.getElementById('navbar');
    const navItems = [
        { page: 'home',           label: '首页',      icon: '🏠' },
        { page: 'courses',        label: '课程',      icon: '📚' },
        { page: 'toolkit-group',  label: '软件模拟器', icon: '🛠️', group: true, children: [
            { page: 'canoe-simulator',   label: 'CANoe',        icon: '🖥️' },
            { page: 'uds-simulator',     label: 'UDS 诊断',     icon: '🔌' },
            { page: 'parking-simulator', label: '泊车控制',     icon: '🅿️' },
            { page: 'linux-simulator',   label: 'Linux 命令',   icon: '🐧' },
            { page: 'zlg-simulator',     label: '周立功 PCAN',  icon: '🎛️' }
        ]},
        { page: 'adas-viz',       label: '智驾可视化', icon: '🚘' },
        { page: 'quiz',           label: '考试练习',   icon: '📝' },
        { page: 'knowledge',      label: '知识库',     icon: '📖' },
        { page: 'learning-path',  label: '学习路线',   icon: '🗺️' },
        { page: 'direction',      label: '方向',       icon: '🧭' },
        { page: 'profile',        label: '个人',       icon: '👤' }
    ];

    const flatItems = navItems.filter(i => !i.group);
    // 把 toolkit 子项也摊平用于移动端
    const mobileItems = [
        ...flatItems.slice(0, 2),
        { page: 'toolkit-group', label: '软件模拟器 ▾', icon: '🛠️', isGroup: true },
        { page: 'canoe-simulator',   label: '  · CANoe', icon: '🖥️', isChild: true },
        { page: 'uds-simulator',     label: '  · UDS 诊断', icon: '🔌', isChild: true },
        { page: 'parking-simulator', label: '  · 泊车控制', icon: '🅿️', isChild: true },
        { page: 'linux-simulator',   label: '  · Linux 命令', icon: '🐧', isChild: true },
        { page: 'zlg-simulator',     label: '  · 周立功 PCAN', icon: '🎛️', isChild: true },
        ...flatItems.slice(2)
    ];

    const isToolkitActive = ['canoe-simulator','uds-simulator','parking-simulator','linux-simulator','zlg-simulator'].includes(state.currentPage);

    nav.innerHTML = `
        <div class="max-w-6xl mx-auto px-4">
            <div class="flex items-center justify-between h-16">
                <div class="flex items-center gap-2 sm:gap-3 cursor-pointer" onclick="navigate('home')">
                    <div class="w-9 h-9 sm:w-10 sm:h-10 bg-gradient-to-br from-cyan-400 to-emerald-500 rounded-xl flex items-center justify-center text-white text-base sm:text-xl font-bold shadow-lg flex-shrink-0 sweep">
                        🚗
                    </div>
                    <div class="overflow-hidden">
                        <div class="font-bold text-white dark:text-white text-slate-900 text-base sm:text-lg whitespace-nowrap">九键车载</div>
                        <div class="text-[10px] sm:text-xs text-cyan-300 dark:text-cyan-300 text-slate-500 whitespace-nowrap">智驾 · 新能源 · 车载测试</div>
                    </div>
                </div>

                <!-- 桌面导航 -->
                <div class="hidden lg:flex items-center gap-1">
                    ${flatItems.map(item => `
                        <button onclick="navigate('${item.page}')"
                                class="nav-btn ${state.currentPage === item.page ? 'active' : ''}">
                            ${item.icon} <span class="hidden xl:inline">${item.label}</span>
                        </button>
                    `).join('')}
                    <!-- 模拟器下拉 -->
                    <div class="relative group">
                        <button class="nav-btn ${isToolkitActive ? 'active' : ''}">
                            🛠️ <span class="hidden xl:inline">模拟器</span> ▾
                        </button>
                        <div class="absolute top-full left-0 mt-1 bg-slate-900 dark:bg-slate-900 bg-white border border-cyan-500/20 dark:border-cyan-500/20 border-slate-200 rounded-xl shadow-2xl py-1 min-w-[160px] opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50">
                            ${navItems.find(i => i.group).children.map(c => `
                                <button onclick="navigate('${c.page}')"
                                        class="block w-full text-left px-4 py-2 text-sm text-slate-300 hover:text-cyan-400 hover:bg-cyan-500/5 transition-all dark:text-slate-300 text-slate-600 hover:text-cyan-600">
                                    ${c.icon} ${c.label}
                                </button>
                            `).join('')}
                        </div>
                    </div>

                    <!-- 主题切换 -->
                    <button onclick="toggleTheme()" id="theme-btn"
                            title="切换日间 / 夜间模式"
                            class="theme-toggle ml-1">
                        <span id="theme-icon">🌙</span>
                    </button>
                </div>

                <!-- 移动端：主题 + 汉堡 -->
                <div class="flex items-center gap-1 lg:hidden">
                    <button onclick="toggleTheme()" class="theme-toggle" title="切换主题">
                        <span id="theme-icon-mobile">🌙</span>
                    </button>
                    <button onclick="document.getElementById('mobile-menu').classList.toggle('open')"
                            class="p-2 rounded-lg text-slate-300 hover:bg-white/10 dark:text-slate-300 dark:hover:bg-white/10 text-slate-500 hover:bg-slate-200">
                        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"/>
                        </svg>
                    </button>
                </div>
            </div>

            <!-- 移动端菜单 -->
            <div id="mobile-menu" class="mobile-menu lg:hidden">
                <div class="py-2 border-t border-white/10 dark:border-white/10 border-slate-200 flex flex-col gap-0.5">
                    ${mobileItems.map(item => `
                        <button onclick="document.getElementById('mobile-menu').classList.remove('open');navigate('${item.page}')"
                                class="${item.isChild?'pl-8':''} text-left px-3 py-2 rounded-lg text-sm transition-all
                                       ${item.isChild?'text-slate-400 dark:text-slate-400 text-slate-500':'text-slate-200 dark:text-slate-200 text-slate-700'}
                                       ${state.currentPage === item.page || (item.isGroup && isToolkitActive) ? 'bg-cyan-500/15 text-cyan-500 dark:text-cyan-300' : 'hover:bg-white/5 dark:hover:bg-white/5 hover:bg-slate-100'}">
                            ${item.icon} ${item.label}
                        </button>
                    `).join('')}
                </div>
            </div>
        </div>
    `;

    // 滚动阴影
    window._navbarOnScroll = () => {
        nav.classList.toggle('scrolled', window.scrollY > 10);
    };
    window.addEventListener('scroll', window._navbarOnScroll, { passive: true });

    // 同步主题切换按钮图标
    const isDark = document.documentElement.classList.contains('dark');
    document.getElementById('theme-icon').textContent = isDark ? '🌙' : '☀️';
    document.getElementById('theme-icon-mobile').textContent = isDark ? '🌙' : '☀️';
}

/* ============ 主题切换 ============ */
window.toggleTheme = function() {
    const root = document.documentElement;
    const body = document.body;
    const isDark = root.classList.contains('dark');  // 当前是否 dark
    // 切换：dark→light（移除 dark 加 light）；light→dark（加 dark 移除 light）
    root.classList.toggle('dark', !isDark);
    root.classList.toggle('light', isDark);
    body.classList.toggle('theme-dark', !isDark);
    body.classList.toggle('theme-light', isDark);
    body.style.background = isDark ? '#e9eef4' : '#050d18';
    localStorage.setItem('theme', isDark ? 'light' : 'dark');
    // 更新按钮图标
    const icon = isDark ? '☀️' : '🌙';
    const icon1 = document.getElementById('theme-icon');
    const icon2 = document.getElementById('theme-icon-mobile');
    if (icon1) icon1.textContent = icon;
    if (icon2) icon2.textContent = icon;
    // 通知各模拟器重绘主题相关画面（3D 场景 / canvas 曲线等）
    (window._themeHooks || []).forEach(fn => { try { fn(); } catch (e) { console.warn('theme hook error', e); } });
};

function toggleMobileMenu() {
    document.getElementById('mobile-menu').classList.toggle('open');
}

function renderFooter() {
    document.getElementById('footer').innerHTML = `
        <div class="max-w-6xl mx-auto px-4">
            <div class="grid sm:grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
                <div>
                    <div class="flex items-center space-x-2 mb-3 sm:mb-4">
                        <span class="text-xl sm:text-2xl">🚗</span>
                        <span class="text-base sm:text-xl font-bold bg-gradient-to-r from-cyan-400 to-emerald-400 bg-clip-text text-transparent">九键车载学习平台</span>
                    </div>
                    <p class="text-slate-400 text-xs sm:text-sm">聚焦智能驾驶与新能源汽车技术，提供专业的车载测试、ADAS 验证、三电测试学习资源。</p>
                </div>
                <div>
                    <h4 class="font-semibold mb-2 sm:mb-3 text-cyan-300 text-sm sm:text-base">学习资源</h4>
                    <ul class="text-slate-400 text-xs sm:text-sm space-y-1.5 sm:space-y-2">
                        <li><a href="https://space.bilibili.com/455178810" target="_blank" rel="noopener" class="hover:text-cyan-300 transition-colors">B站 · 维克多汽车技术</a></li>
                        <li><a href="https://blog.csdn.net/m0_72165397/article/details/154819474" target="_blank" rel="noopener" class="hover:text-cyan-300 transition-colors">CSDN · ADAS测试专栏</a></li>
                    </ul>
                </div>
                <div>
                    <h4 class="font-semibold mb-2 sm:mb-3 text-emerald-300 text-sm sm:text-base">官方链接</h4>
                    <ul class="text-slate-400 text-xs sm:text-sm space-y-1.5 sm:space-y-2">
                        <li><a href="https://www.vector.com/cn/zh/" target="_blank" rel="noopener" class="hover:text-cyan-300 transition-colors">Vector 官网</a></li>
                        <li><a href="https://www.autosar.org" target="_blank" rel="noopener" class="hover:text-cyan-300 transition-colors">AUTOSAR</a></li>
                    </ul>
                </div>
                <div>
                    <h4 class="font-semibold mb-2 sm:mb-3 text-emerald-300 text-sm sm:text-base">行业平台</h4>
                    <ul class="text-slate-400 text-xs sm:text-sm space-y-1.5 sm:space-y-2">
                        <li><a href="https://apollo.baidu.com" target="_blank" rel="noopener" class="hover:text-emerald-300 transition-colors">Apollo 自动驾驶</a></li>
                        <li><a href="https://www.caeri.com.cn" target="_blank" rel="noopener" class="hover:text-emerald-300 transition-colors">中国汽研 CAERI</a></li>
                        <li><a href="https://www.catarc.org.cn" target="_blank" rel="noopener" class="hover:text-emerald-300 transition-colors">中汽中心 CATARC</a></li>
                        <li><a href="https://www.c-ncap.org.cn" target="_blank" rel="noopener" class="hover:text-emerald-300 transition-colors">C-NCAP</a></li>
                    </ul>
                </div>
            </div>
            <div class="border-t border-slate-700 mt-6 sm:mt-8 pt-4 sm:pt-6 text-center text-slate-500 text-xs sm:text-sm">
                © 2024 九键车载学习平台 · 让智能驾驶与新能源技术学习更专业
            </div>
        </div>
    `;
}

function renderContentPlaceholder({ title, icon, sub, bullets }) {
    document.getElementById('main-content').innerHTML = `
        <div class="fade-in">
            <button onclick="navigate('home')" class="text-cyan-400 hover:text-cyan-300 text-sm mb-4">← 返回首页</button>
            <div class="card p-6 sm:p-10 text-center max-w-2xl mx-auto">
                <div class="text-5xl mb-4 pop-in">${icon}</div>
                <h1 class="text-xl sm:text-2xl font-bold text-white mb-2">${title}</h1>
                <p class="text-xs sm:text-sm text-slate-400 mb-4">${sub}</p>
                <div class="inline-flex items-center gap-2 bg-cyan-500/10 border border-cyan-500/30 rounded-full px-4 py-2 text-xs text-cyan-400 mb-6">
                    <span class="w-2 h-2 bg-cyan-400 rounded-full animate-pulse"></span>
                    模块入口已搭建 · 内容素材待补充
                </div>
                <div class="text-left max-w-md mx-auto bg-slate-800/60 border border-slate-700 rounded-lg p-4">
                    <div class="text-xs text-cyan-400 font-semibold mb-2">📋 本页需要你提供的素材：</div>
                    <ul class="space-y-1 text-[11px] sm:text-xs text-slate-300">
                        ${bullets.map(b => `<li class="flex items-start gap-2"><span class="text-cyan-400 mt-0.5">▸</span><span>${b}</span></li>`).join('')}
                    </ul>
                </div>
            </div>
        </div>
    `;
}

function navigate(page, params = {}) {
    state.currentPage = page;
    Object.assign(state, params);
    renderNavbar();
    const content = document.getElementById('main-content');
    content.className = 'container mx-auto px-4 py-6 max-w-6xl fade-in';
    
    switch(page) {
        case 'home':              renderHome(); break;
        case 'courses':           renderCourses(); break;
        case 'course-detail':     renderCourseDetail(); break;
        case 'lesson':            renderLessonPage(); break;
        case 'canoe-simulator':   renderCanoeSimulator(); break;
        case 'uds-simulator':     renderUdsSimulator(); break;
        case 'linux-simulator':   renderLinuxSimulator(); break;
        case 'zlg-simulator':     renderToolkitPlaceholder('zlg'); break;
        case 'adas-viz':          renderAdasViz(); break;
        case 'domain':            renderDomainPage(); break;
        case 'parking-simulator': if(typeof renderParkingSimulator==='function') renderParkingSimulator(); else renderAdasViz(); break;
        case 'quiz':              renderQuizList(); break;
        case 'quiz-taking':       renderQuizTaking(); break;
        case 'quiz-result':       renderQuizResult(); break;
        case 'knowledge':         renderKnowledge(); break;
        case 'learning-path':     renderLearningPath(); break;
        case 'direction':         renderDirection(); break;
        case 'profile':           renderProfile(); break;
        default: renderHome();
    }
    
    document.getElementById('mobile-menu').classList.remove('open');
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function renderHome() {
    document.getElementById('main-content').innerHTML = `
        <div class="stagger">

            <!-- Hero -->
            <div class="gradient-bg rounded-3xl p-5 sm:p-8 md:p-12 mb-6 relative overflow-hidden pop-in">
                <div class="absolute top-0 right-0 text-[160px] sm:text-[260px] leading-none text-white/5 select-none pointer-events-none">🚗⚡</div>
                <div class="relative z-10">
                    <h1 class="text-2xl sm:text-3xl md:text-5xl font-bold mb-3 leading-tight">
                        <span class="bg-gradient-to-r from-cyan-200 via-white to-emerald-200 bg-clip-text text-transparent">
                            九键车载学习平台
                        </span>
                    </h1>
                    <div class="flex flex-wrap gap-1.5 mb-4">
                        <span class="badge badge-cyan">智驾</span>
                        <span class="badge badge-emerald">新能源</span>
                        <span class="badge badge-violet">车载测试</span>
                        <span class="badge badge-amber">工具链</span>
                    </div>
                    <p class="text-slate-300 text-sm sm:text-base max-w-xl leading-relaxed mb-5">
                        聚焦智能驾驶 ADAS 与新能源三电测试 —— 从 CANoe 硬件连接到 ADAS 可视化，
                        从 UDS 诊断到泊车场景验证，一套完整的车载测试工程师成长体系。
                    </p>
                    <div class="flex gap-2 sm:gap-3 flex-wrap">
                        <button onclick="navigate('courses')" class="btn-glow">📚 开始学习</button>
                        <button onclick="navigate('canoe-simulator')"
                                class="px-5 py-3 rounded-xl font-bold text-sm sm:text-base text-cyan-400 border border-cyan-400/40 hover:bg-cyan-500/10 transition-all">
                            🖥️ CANoe 模拟器
                        </button>
                    </div>
                </div>
            </div>

            <!-- 五大域 -->
            <div class="mb-6">
                <div class="flex items-center gap-2 mb-3">
                    <h3 class="font-bold text-white text-base sm:text-lg flex items-center gap-2">
                        <span class="w-1 h-5 bg-gradient-to-b from-cyan-400 to-emerald-500 rounded"></span>
                        🏗️ 整车域控架构 · 五大域
                    </h3>
                    <span class="text-[10px] text-slate-500 hidden sm:inline">车载测试工程师必须理解的基础结构</span>
                </div>
                <div class="grid grid-cols-2 md:grid-cols-5 gap-3 stagger">
                    ${[
                        { id:'body',       icon:'🚘', name:'车身域控', en:'Body',
                          desc:'车窗 / 门锁 / 空调 / 灯光 / 座椅',
                          test:'功能测试 · CANoe Trace · UDS 读写',
                          color:'from-cyan-400 to-cyan-600' },
                        { id:'powertrain', icon:'⚡', name:'动力域控', en:'Powertrain',
                          desc:'电机 / 变速箱 / BMS / 高压系统',
                          test:'高压安全 · OBC 刷写 · SOC 测试',
                          color:'from-amber-400 to-amber-600' },
                        { id:'chassis',    icon:'🛞', name:'底盘域控', en:'Chassis',
                          desc:'ABS/ESC · EPS 转向 · 悬挂 · 制动',
                          test:'总线通信 · 横纵向控制 · HIL 仿真',
                          color:'from-red-400 to-red-600' },
                        { id:'adas',       icon:'🤖', name:'智驾域控', en:'ADAS',
                          desc:'感知 · 规划 · 控制 · HAD · APA',
                          test:'场景验证 · 算法联调 · 传感器标定',
                          color:'from-violet-400 to-violet-600' },
                        { id:'cockpit',    icon:'🎯', name:'座舱域控', en:'Cockpit',
                          desc:'仪表 · 中控 · HUD · T-BOX · IVI',
                          test:'UI 测试 · 语音交互 · 车联网联调',
                          color:'from-emerald-400 to-emerald-600' }
                    ].map(d => `
                        <button onclick="navigate('domain', {domain:'${d.id}'})" class="card p-4 text-left group h-full">
                            <div class="flex items-start gap-2 mb-2">
                                <div class="w-9 h-9 rounded-lg bg-gradient-to-br ${d.color} flex items-center justify-center text-lg flex-shrink-0 group-hover:scale-110 transition-transform shadow-lg">${d.icon}</div>
                                <div class="overflow-hidden">
                                    <div class="font-bold text-white text-sm leading-tight">${d.name}</div>
                                    <div class="text-[9px] text-slate-500 font-mono">${d.en}</div>
                                </div>
                            </div>
                            <div class="text-[11px] text-slate-300 mb-1.5 leading-snug">${d.desc}</div>
                            <div class="text-[10px] text-cyan-400/80 font-semibold">${d.test}</div>
                        </button>
                    `).join('')}
                </div>
            </div>

            <!-- 四大核心 -->
            <div class="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 mb-6 stagger">
                ${[
                    { icon:'📚', title:'课程模块',   sub:'6 大模块 · 41 课时', page:'courses' },
                    { icon:'🖥️', title:'软件模拟器', sub:'CANoe / UDS',   page:'canoe-simulator' },
                    { icon:'🚘', title:'智驾可视化', sub:'16 项功能动画演示', page:'adas-viz' },
                    { icon:'🗺️', title:'学习路线',   sub:'四大阶段体系',  page:'learning-path' }
                ].map(c => `
                    <button onclick="navigate('${c.page}')" class="card p-4 text-left group">
                        <div class="text-3xl mb-2 group-hover:scale-110 transition-transform">${c.icon}</div>
                        <div class="font-bold text-white text-sm">${c.title}</div>
                        <div class="text-[10px] text-slate-400 mt-0.5">${c.sub}</div>
                    </button>
                `).join('')}
            </div>

            <!-- 软件模拟器 -->
            <div class="card p-4 sm:p-6 mb-6 slide-up">
                <div class="flex items-center gap-2 mb-4">
                    <h3 class="font-bold text-white text-base sm:text-lg">🛠️ 软件工具模拟器</h3>
                    <span class="badge badge-violet">交互式</span>
                </div>
                <div class="grid sm:grid-cols-2 lg:grid-cols-4 gap-3 stagger">
                    ${[
                        { id:'canoe-simulator', name:'CANoe',    icon:'🖥️', desc:'VN1610 连接 + Trace + Graphics', status:'live' },
                        { id:'uds-simulator',   name:'UDS 诊断', icon:'🔌',  desc:'Service 10/27/22 · ISO 14229',     status:'live' },
                        { id:'parking-simulator', name:'泊车控制', icon:'🅿️', desc:'3D 动画 + 状态机 + 信号曲线',   status:'live' },
                        { id:'adas-viz',        name:'智驾可视化', icon:'🚘', desc:'行车/泊车 16 项功能动画演示',    status:'live' },
                        { id:'linux-simulator', name:'Linux',    icon:'🐧',  desc:'终端模拟 · 在线学习资源',          status:'live' },
                        { id:'zlg-simulator',   name:'周立功',   icon:'🎛️', desc:'USBCAN 配置 · 报文收发',             status:'soon' }
                    ].map(c => `
                        <button onclick="navigate('${c.id}')"
                                class="text-left bg-slate-800/60 border border-cyan-500/10 hover:border-cyan-500/50 rounded-xl p-4 transition-all group relative overflow-hidden">
                            <div class="text-2xl mb-2">${c.icon}</div>
                            <div class="font-bold text-white text-sm flex items-center gap-2">
                                ${c.name}
                                ${c.status==='live'  ? '<span class="badge badge-green text-[10px]">● 在线</span>' : ''}
                                ${c.status==='soon'  ? '<span class="text-[10px] text-slate-500">敬请期待</span>' : ''}
                            </div>
                            <div class="text-[11px] text-slate-400 mt-1">${c.desc}</div>
                            <div class="text-[10px] text-cyan-400 mt-2 opacity-0 group-hover:opacity-100 transition-all">进入 →</div>
                        </button>
                    `).join('')}
                </div>
            </div>

            <!-- 车型 3D 拆解 -->
            <div class="card p-4 sm:p-6 mb-6 slide-up">
                <div class="flex items-center gap-2 mb-4">
                    <h3 class="font-bold text-white text-base sm:text-lg">🏎️ 车型 3D 拆解</h3>
                    <span class="badge badge-violet">交互式 3D</span>
                </div>
                <a href="yangwang-u9/index.html" target="_blank" rel="noopener"
                   class="car-3d-card block bg-gradient-to-br from-slate-800/80 to-slate-900/80 border border-orange-500/20 hover:border-orange-400/60 rounded-2xl p-5 sm:p-6 transition-all group">
                    <div class="flex flex-col sm:flex-row sm:items-center gap-4">
                        <div class="text-5xl flex-shrink-0">🏎️</div>
                        <div class="flex-1 min-w-0">
                            <div class="flex items-center gap-2 mb-1.5">
                                <span class="font-bold text-white text-lg sm:text-xl">仰望 U9 · 3D 拆解可视化</span>
                                <span class="badge badge-amber text-[10px]">纯电超跑</span>
                            </div>
                            <p class="text-xs sm:text-sm text-slate-400 leading-relaxed mb-3">
                                易四方四电机独立驱动 · 云辇-X 智能车身控制 · 刀片电池 · 碳纤维底盘。
                                点击部件可单独高亮/拆解，查看结构参数与技术说明，对应五大域的真实工程映射。
                            </p>
                            <div class="flex flex-wrap gap-1.5">
                                <span class="badge text-[10px]">四电机 e⁴</span>
                                <span class="badge text-[10px]">80 kWh 刀片电池</span>
                                <span class="badge text-[10px]">云辇-X</span>
                                <span class="badge text-[10px]">碳纤维单体壳</span>
                                <span class="badge text-[10px]">蝴蝶门</span>
                            </div>
                        </div>
                        <div class="text-orange-400 font-semibold text-sm whitespace-nowrap flex items-center gap-1 group-hover:gap-2 transition-all">
                            进入 3D 拆解 →
                        </div>
                    </div>
                </a>
            </div>

            <!-- 学习社群 & 内容平台 -->
            <div class="card p-4 sm:p-6 mb-6 slide-up">
                <div class="grid sm:grid-cols-2 gap-5 sm:gap-6 items-center">
                    <div>
                        <div class="flex items-center gap-2 mb-2">
                            <h3 class="font-bold text-white text-base sm:text-lg">💬 学习社群 & 内容平台</h3>
                        </div>
                        <p class="text-xs sm:text-sm text-slate-400 mb-4 leading-relaxed">
                            加入 QQ 交流群，与车载测试同行讨论 CANoe / UDS / 智驾场景问题、分享求职经验；
                            B站与抖音持续更新工具实操演示与行业解读，配套笔记与脚本同步开源于 GitHub。
                        </p>
                        <div class="grid grid-cols-2 gap-2">
                            <a href="https://space.bilibili.com/33514452" target="_blank" rel="noopener"
                               class="flex items-center gap-2.5 bg-slate-800/60 border border-pink-500/20 hover:border-pink-400/60 rounded-xl px-3 py-2.5 transition-all group">
                                <span class="w-8 h-8 rounded-lg bg-gradient-to-br from-pink-400 to-rose-500 flex items-center justify-center text-base flex-shrink-0 group-hover:scale-110 transition-transform">📺</span>
                                <div class="overflow-hidden">
                                    <div class="text-xs font-bold text-white">B站主页</div>
                                    <div class="text-[10px] text-slate-500 truncate">UID 33514452</div>
                                </div>
                            </a>
                            <button onclick="copyText('jiujian90', this)"
                               class="flex items-center gap-2.5 bg-slate-800/60 border border-cyan-500/20 hover:border-cyan-400/60 rounded-xl px-3 py-2.5 transition-all group text-left">
                                <span class="w-8 h-8 rounded-lg bg-gradient-to-br from-slate-700 to-slate-900 border border-cyan-400/30 flex items-center justify-center text-base flex-shrink-0 group-hover:scale-110 transition-transform">🎵</span>
                                <div class="overflow-hidden">
                                    <div class="text-xs font-bold text-white">抖音号</div>
                                    <div class="text-[10px] text-slate-500 truncate copy-hint">jiujian90 · 点击复制</div>
                                </div>
                            </button>
                            <button onclick="copyText('1095930411', this)"
                               class="flex items-center gap-2.5 bg-slate-800/60 border border-sky-500/20 hover:border-sky-400/60 rounded-xl px-3 py-2.5 transition-all group text-left">
                                <span class="w-8 h-8 rounded-lg bg-gradient-to-br from-sky-400 to-blue-600 flex items-center justify-center text-base flex-shrink-0 group-hover:scale-110 transition-transform">🐧</span>
                                <div class="overflow-hidden">
                                    <div class="text-xs font-bold text-white">QQ 交流群</div>
                                    <div class="text-[10px] text-slate-500 truncate copy-hint">1095930411 · 点击复制</div>
                                </div>
                            </button>
                            <a href="https://github.com/BiBO-Jump" target="_blank" rel="noopener"
                               class="flex items-center gap-2.5 bg-slate-800/60 border border-emerald-500/20 hover:border-emerald-400/60 rounded-xl px-3 py-2.5 transition-all group">
                                <span class="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-400 to-teal-600 flex items-center justify-center text-base flex-shrink-0 group-hover:scale-110 transition-transform">🐙</span>
                                <div class="overflow-hidden">
                                    <div class="text-xs font-bold text-white">GitHub</div>
                                    <div class="text-[10px] text-slate-500 truncate">BiBO-Jump</div>
                                </div>
                            </a>
                        </div>
                    </div>
                    <div class="flex gap-4 justify-center">
                        <div class="text-center">
                            <div class="bg-white rounded-xl p-2 shadow-lg border border-slate-600/30">
                                <img src="img/qq-group.jpg" alt="QQ 交流群二维码" class="w-28 h-28 sm:w-32 sm:h-32 object-contain rounded-lg" loading="lazy">
                            </div>
                            <div class="text-[10px] text-cyan-400 mt-2 font-semibold tracking-wider">QQ 群 · 扫码加入</div>
                        </div>
                        <div class="text-center">
                            <div class="bg-white rounded-xl p-2 shadow-lg border border-slate-600/30">
                                <img src="img/douyin.png" alt="抖音二维码" class="w-28 h-28 sm:w-32 sm:h-32 object-contain rounded-lg" loading="lazy">
                            </div>
                            <div class="text-[10px] text-cyan-400 mt-2 font-semibold tracking-wider">抖音 · 扫码关注</div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- 行业前沿 -->
            <div class="gradient-bg industry-banner rounded-2xl p-4 sm:p-6 mb-8 slide-up border-0">
                <div class="text-base sm:text-lg font-black text-white mb-2 tracking-wide">🚀 行业前沿</div>
                <p class="text-xs sm:text-sm text-white/90 mb-3 leading-relaxed max-w-3xl font-medium">
                    L3 智驾加速量产，线控底盘、智能车身、AI 座舱多模态语音 Agent、高压电池 / 半固态电池同步突破；舱驾融合、全域 SOA、AUTOSAR 普及。<span class="text-white font-semibold">2027 年多项智驾强制国标落地</span>，智驾、底盘、座舱、车身、三电五大域测试验证岗位需求同步扩容。
                </p>
                <div class="flex gap-1.5 flex-wrap">
                    <span class="badge bg-white/20 border-white/35 text-white text-[10px] font-semibold">L3 智驾</span>
                    <span class="badge bg-white/20 border-white/35 text-white text-[10px] font-semibold">线控底盘</span>
                    <span class="badge bg-white/20 border-white/35 text-white text-[10px] font-semibold">AI 座舱语音</span>
                    <span class="badge bg-white/20 border-white/35 text-white text-[10px] font-semibold">车身域控</span>
                    <span class="badge bg-white/20 border-white/35 text-white text-[10px] font-semibold">电池热管理</span>
                    <span class="badge bg-white/20 border-white/35 text-white text-[10px] font-semibold">HIL 仿真</span>
                </div>
            </div>

        </div>
    `;
}

function renderStatCard(icon, label, value, bgClass) {
    return `
        <div class="stat-card">
            <div class="${bgClass} w-10 h-10 rounded-xl flex items-center justify-center text-xl mb-3">${icon}</div>
            <div class="text-2xl font-bold text-slate-100">${value}</div>
            <div class="text-sm text-slate-400 mt-1">${label}</div>
        </div>
    `;
}

function renderCourseCard(course) {
    const progress = state.userData.courseProgress[course.id] || 0;
    return `
        <div class="course-card" onclick="navigate('course-detail', {selectedCourseId: ${course.id}})">
            <div class="bg-gradient-to-br ${course.color} p-6 relative">
                <div class="text-4xl mb-2">${course.icon}</div>
                <span class="absolute top-4 right-4 bg-white/20 backdrop-blur-sm text-white text-xs px-2 py-1 rounded-full">
                    ${course.level}
                </span>
            </div>
            <div class="p-4">
                <h3 class="font-bold text-slate-100 mb-1 line-clamp-2">${course.title}</h3>
                <div class="flex items-center text-xs text-slate-400 mb-3">
                    <span class="mr-3">📖 ${course.lessons}课时</span>
                    <span>⏱️ ${course.duration}</span>
                </div>
                <div class="w-full bg-slate-700/50 rounded-full h-2">
                    <div class="bg-cyan-500 h-2 rounded-full transition-all" style="width: ${progress}%"></div>
                </div>
                <div class="text-xs text-slate-500 mt-2">进度 ${progress}%</div>
            </div>
        </div>
    `;
}

function renderContinueCard(course) {
    const progress = state.userData.courseProgress[course.id] || 0;
    return `
        <div class="course-card border-2 border-cyan-500/30" onclick="navigate('course-detail', {selectedCourseId: ${course.id}})">
            <div class="bg-gradient-to-r ${course.color} h-2"></div>
            <div class="p-5">
                <div class="flex items-center mb-2">
                    <span class="text-2xl mr-3">${course.icon}</span>
                    <div>
                        <h3 class="font-bold text-slate-100">${course.title}</h3>
                        <span class="text-xs text-slate-400">${course.category}</span>
                    </div>
                </div>
                <div class="w-full bg-slate-700/50 rounded-full h-2 mb-2">
                    <div class="bg-cyan-500 h-2 rounded-full transition-all" style="width: ${progress}%"></div>
                </div>
                <div class="flex justify-between items-center text-sm">
                    <span class="text-slate-400">已完成 ${progress}%</span>
                    <span class="text-cyan-400 font-medium">继续 →</span>
                </div>
            </div>
        </div>
    `;
}

function calculateOverallProgress() {
    let total = 0;
    COURSES.forEach(c => {
        total += state.userData.courseProgress[c.id] || 0;
    });
    return Math.round(total / COURSES.length);
}

function renderCourses() {
    let filteredCourses = COURSES;
    let currentCategory = '全部';
    let searchQuery = '';
    
    document.getElementById('main-content').innerHTML = `
        <div class="fade-in">
            <h1 class="text-2xl md:text-3xl font-bold text-slate-100 mb-6">📚 课程中心</h1>

            <div class="card p-4 mb-6">
                <div class="flex flex-col md:flex-row gap-4">
                    <div class="flex-1 relative">
                        <input type="text" id="course-search" placeholder="搜索课程..."
                               class="w-full pl-10 pr-4 py-2 bg-slate-800/60 border border-slate-700 text-slate-200 rounded-xl focus:outline-none focus:border-cyan-500"
                               oninput="filterCourses()">
                        <span class="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500">🔍</span>
                    </div>
                    <div class="flex gap-2 overflow-x-auto scrollbar-hide">
                        ${CATEGORIES.map(cat => `
                            <button onclick="setCategory('${cat}')"
                                    class="category-btn px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${cat === currentCategory ? 'bg-cyan-600 text-white' : 'bg-slate-800/60 text-slate-300 hover:bg-slate-700/60 border border-slate-700'}">
                                ${cat}
                            </button>
                        `).join('')}
                    </div>
                </div>
            </div>

            <div id="course-grid" class="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                ${renderFilteredCourses(filteredCourses)}
            </div>
        </div>
    `;

    window.setCategory = function(cat) {
        currentCategory = cat;
        document.querySelectorAll('.category-btn').forEach((btn, i) => {
            if (CATEGORIES[i] === cat) {
                btn.className = 'category-btn px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap bg-cyan-600 text-white';
            } else {
                btn.className = 'category-btn px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap bg-slate-800/60 text-slate-300 hover:bg-slate-700/60 border border-slate-700';
            }
        });
        applyFilters();
    };
    
    window.filterCourses = function() {
        searchQuery = document.getElementById('course-search').value.toLowerCase();
        applyFilters();
    };
    
    window.applyFilters = function() {
        let result = COURSES;
        if (currentCategory !== '全部') {
            result = result.filter(c => c.category === currentCategory);
        }
        if (searchQuery) {
            result = result.filter(c => 
                c.title.toLowerCase().includes(searchQuery) || 
                c.description.toLowerCase().includes(searchQuery) ||
                c.tags.some(t => t.toLowerCase().includes(searchQuery))
            );
        }
        document.getElementById('course-grid').innerHTML = renderFilteredCourses(result);
    };
}

function renderFilteredCourses(courses) {
    if (courses.length === 0) {
        return `<div class="col-span-full text-center py-12 text-slate-400">
            <div class="text-5xl mb-3">🔍</div>
            <p>未找到符合条件的课程</p>
        </div>`;
    }
    return courses.map(c => renderCourseCard(c)).join('');
}

function renderCourseDetail() {
    const course = COURSES.find(c => c.id === state.selectedCourseId);
    if (!course) { navigate('courses'); return; }
    const progress = state.userData.courseProgress[course.id] || 0;
    
    document.getElementById('main-content').innerHTML = `
        <div class="fade-in">
            <button onclick="navigate('courses')" class="text-cyan-400 hover:text-cyan-300 mb-4 flex items-center text-sm">
                ← 返回课程列表
            </button>

            <div class="card overflow-hidden mb-6">
                <div class="bg-gradient-to-br ${course.color} p-4 sm:p-6 md:p-8 text-white">
                    <div class="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                        <div>
                            <span class="bg-white/20 backdrop-blur-sm text-white text-xs px-3 py-1 rounded-full">${course.category}</span>
                            <h1 class="text-xl sm:text-2xl md:text-3xl font-bold mt-2 sm:mt-3 mb-2">${course.title}</h1>
                            <p class="text-white/80 text-sm sm:text-base max-w-2xl">${course.description}</p>
                        </div>
                        <div class="text-4xl sm:text-5xl md:text-6xl flex-shrink-0">${course.icon}</div>
                    </div>
                    <div class="flex gap-2 sm:gap-3 mt-4 sm:mt-6 flex-wrap">
                        <div class="bg-white/20 backdrop-blur-sm rounded-xl px-3 sm:px-4 py-2 text-center">
                            <div class="text-[10px] sm:text-xs text-white/70">课程等级</div>
                            <div class="text-sm sm:text-base font-semibold">${course.level}</div>
                        </div>
                        <div class="bg-white/20 backdrop-blur-sm rounded-xl px-3 sm:px-4 py-2 text-center">
                            <div class="text-[10px] sm:text-xs text-white/70">预计时长</div>
                            <div class="text-sm sm:text-base font-semibold">${course.duration}</div>
                        </div>
                        <div class="bg-white/20 backdrop-blur-sm rounded-xl px-3 sm:px-4 py-2 text-center">
                            <div class="text-[10px] sm:text-xs text-white/70">总课时</div>
                            <div class="text-sm sm:text-base font-semibold">${course.lessons}节</div>
                        </div>
                    </div>
                </div>

                <div class="p-6 border-b border-slate-700">
                    <div class="flex items-center justify-between mb-2">
                        <span class="text-sm text-slate-400">学习进度</span>
                        <span class="text-sm font-semibold text-cyan-400">${progress}%</span>
                    </div>
                    <div class="w-full bg-slate-700/50 rounded-full h-3">
                        <div class="bg-gradient-to-r from-cyan-500 to-emerald-500 h-3 rounded-full transition-all" style="width: ${progress}%"></div>
                    </div>
                </div>

                <div class="p-6">
                    <h2 class="text-lg font-bold text-slate-100 mb-4">课程章节</h2>
                    <div class="space-y-4">
                        ${course.sections.map((section, si) => `
                            <div class="border border-slate-700 rounded-xl overflow-hidden">
                                <div class="bg-slate-800/60 px-5 py-3 flex items-center justify-between">
                                    <div class="flex items-center">
                                        <span class="w-8 h-8 bg-cyan-500/15 text-cyan-400 rounded-lg flex items-center justify-center font-semibold text-sm mr-3">${si + 1}</span>
                                        <span class="font-medium text-slate-200">${section.title}</span>
                                    </div>
                                    <span class="text-sm text-slate-500">${section.lessons.length}节课</span>
                                </div>
                                <div class="divide-y divide-slate-700/50">
                                    ${section.lessons.map((lesson, li) => `
                                        <div class="px-5 py-3 flex items-center justify-between hover:bg-slate-800/40 cursor-pointer transition-colors" onclick="startLesson(${course.id}, ${si}, ${li})">
                                            <div class="flex items-center">
                                                <span class="w-6 h-6 rounded-full border-2 border-slate-600 mr-3 flex items-center justify-center text-xs ${Math.round((si * 3 + li) * 100 / course.lessons) < progress ? 'bg-emerald-500 border-emerald-500 text-white' : 'text-slate-400'}">
                                                    ${Math.round((si * 3 + li) * 100 / course.lessons) < progress ? '✓' : si * 3 + li + 1}
                                                </span>
                                                <span class="text-slate-300">${lesson}</span>
                                            </div>
                                            <span class="text-cyan-400 text-sm">开始学习 →</span>
                                        </div>
                                    `).join('')}
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </div>

                <div class="p-6 bg-slate-800/40">
                    <h3 class="font-semibold text-slate-200 mb-3">🏷️ 课程标签</h3>
                    <div class="flex gap-2 flex-wrap">
                        ${course.tags.map(tag => `<span class="badge">${tag}</span>`).join('')}
                    </div>
                </div>

                <div class="p-6 border-t border-slate-700">
                    <h3 class="font-semibold text-slate-200 mb-3">📝 相关考试</h3>
                    ${QUIZZES.filter(q => q.courseId === course.id).map(q => `
                        <div class="flex items-center justify-between bg-cyan-500/5 border border-cyan-500/20 rounded-xl p-4">
                            <div>
                                <div class="font-medium text-slate-200">${q.title}</div>
                                <div class="text-sm text-slate-500">${q.questions.length}道题目</div>
                            </div>
                            <button onclick="startQuiz(${q.id})" class="btn-primary text-sm">开始考试</button>
                        </div>
                    `).join('') || '<p class="text-slate-500 text-sm">暂无相关考试</p>'}
                </div>
            </div>
        </div>
    `;
}

function updateCourseProgress(courseId, newProgress) {
    const userData = state.userData;
    const current = userData.courseProgress[courseId] || 0;
    if (newProgress > current) {
        userData.courseProgress[courseId] = newProgress;
        if (newProgress >= 100 && current < 100) {
            userData.stats.completedCourses++;
            showToast('🎉 恭喜完成课程！');
        }
        saveUserData(userData);
        state.userData = userData;
        navigate('course-detail', {selectedCourseId: courseId});
    }
}

function renderQuizList() {
    document.getElementById('main-content').innerHTML = `
        <div class="fade-in">
            <h1 class="text-2xl md:text-3xl font-bold text-slate-100 mb-6">📝 考试中心</h1>

            <div class="gradient-bg industry-banner rounded-2xl p-6 mb-6 text-white border-0">
                <div class="flex items-center justify-between">
                    <div>
                        <h3 class="font-bold text-lg mb-1">模拟考试系统</h3>
                        <p class="text-sm text-white/85">检验你的车载测试知识掌握程度</p>
                    </div>
                    <div class="text-5xl">🎯</div>
                </div>
                <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                    <div class="bg-white/15 backdrop-blur rounded-xl p-3 text-center">
                        <div class="text-xl font-bold">${QUIZZES.length}</div>
                        <div class="text-xs text-white/80">套考试</div>
                    </div>
                    <div class="bg-white/15 backdrop-blur rounded-xl p-3 text-center">
                        <div class="text-xl font-bold">${QUIZZES.reduce((s,q)=>s+q.questions.length,0)}</div>
                        <div class="text-xs text-white/80">道题目</div>
                    </div>
                    <div class="bg-white/15 backdrop-blur rounded-xl p-3 text-center">
                        <div class="text-xl font-bold">${state.userData.stats.quizPassed}</div>
                        <div class="text-xs text-white/80">已通过</div>
                    </div>
                    <div class="bg-white/15 backdrop-blur rounded-xl p-3 text-center">
                        <div class="text-xl font-bold">${state.userData.quizHistory.length}</div>
                        <div class="text-xs text-white/80">已参考</div>
                    </div>
                </div>
            </div>

            <div class="grid md:grid-cols-2 gap-4">
                ${QUIZZES.map(q => {
                    const course = COURSES.find(c => c.id === q.courseId);
                    const history = state.userData.quizHistory.find(h => h.quizId === q.id);
                    return `
                        <div class="card p-6">
                            <div class="flex items-start justify-between mb-4">
                                <div class="flex items-center">
                                    <div class="w-12 h-12 rounded-xl bg-gradient-to-br ${course?.color || 'from-slate-500 to-slate-700'} flex items-center justify-center text-2xl mr-4">
                                        ${course?.icon || '📝'}
                                    </div>
                                    <div>
                                        <h3 class="font-bold text-slate-100">${q.title}</h3>
                                        <p class="text-sm text-slate-400">${course?.title || ''}</p>
                                    </div>
                                </div>
                                ${history ? (history.passed ?
                                    '<span class="badge badge-green">✓ 已通过</span>' :
                                    '<span class="badge badge-red">✗ 未通过</span>') :
                                    '<span class="badge badge-slate">新考试</span>'}
                            </div>
                            <div class="flex items-center justify-between">
                                <div class="text-sm text-slate-400">
                                    <span class="mr-3">📋 ${q.questions.length}题</span>
                                    ${history ? `<span>上次: ${history.score}分</span>` : ''}
                                </div>
                                <button onclick="startQuiz(${q.id})" class="btn-primary text-sm">
                                    ${history ? '重新考试' : '开始考试'}
                                </button>
                            </div>
                        </div>
                    `;
                }).join('')}
            </div>
        </div>
    `;
}

function startQuiz(quizId) {
    const quiz = QUIZZES.find(q => q.id === quizId);
    if (!quiz) return;
    state.currentQuiz = quiz;
    state.quizAnswers = new Array(quiz.questions.length).fill(-1);
    state.quizCurrentIndex = 0;
    navigate('quiz-taking');
}

function renderQuizTaking() {
    const quiz = state.currentQuiz;
    if (!quiz) { navigate('quiz'); return; }
    const current = quiz.questions[state.quizCurrentIndex];
    const answeredCount = state.quizAnswers.filter(a => a !== -1).length;
    const progress = ((state.quizCurrentIndex + 1) / quiz.questions.length) * 100;
    
    document.getElementById('main-content').innerHTML = `
        <div class="fade-in max-w-3xl mx-auto">
            <div class="card overflow-hidden">
                <div class="bg-gradient-to-r from-cyan-600 to-cyan-700 p-6 text-white">
                    <div class="flex items-center justify-between mb-4">
                        <h2 class="text-lg font-bold">${quiz.title}</h2>
                        <span class="text-sm opacity-80">第 ${state.quizCurrentIndex + 1} / ${quiz.questions.length} 题</span>
                    </div>
                    <div class="w-full bg-white/20 rounded-full h-2">
                        <div class="bg-white h-2 rounded-full transition-all duration-300" style="width: ${progress}%"></div>
                    </div>
                    <div class="flex justify-between text-xs mt-2 opacity-80">
                        <span>已答 ${answeredCount} 题</span>
                        <span>剩余 ${quiz.questions.length - answeredCount} 题</span>
                    </div>
                </div>

                <div class="p-6">
                    <div class="mb-6">
                        <span class="badge mb-3">单选题</span>
                        <h3 class="text-xl font-semibold text-slate-100">${current.q}</h3>
                    </div>

                    <div class="space-y-3">
                        ${current.options.map((opt, i) => `
                            <div class="quiz-option ${state.quizAnswers[state.quizCurrentIndex] === i ? 'selected' : ''}"
                                 onclick="selectAnswer(${i})">
                                <div class="flex items-center">
                                    <span class="w-8 h-8 rounded-full border-2 mr-4 flex items-center justify-center font-semibold text-sm ${state.quizAnswers[state.quizCurrentIndex] === i ? 'border-cyan-500 bg-cyan-500 text-white' : 'border-slate-600 text-slate-400'}">
                                        ${String.fromCharCode(65 + i)}
                                    </span>
                                    <span class="text-slate-300">${opt}</span>
                                </div>
                            </div>
                        `).join('')}
                    </div>

                    <div class="mt-6 pt-4 border-t border-slate-700">
                        <div class="flex flex-wrap gap-1.5 sm:gap-2 mb-4">
                            ${quiz.questions.map((_, i) => `
                                <button onclick="jumpToQuestion(${i})"
                                        class="w-8 h-8 sm:w-10 sm:h-10 rounded-lg text-xs sm:text-sm font-medium transition-all ${
                                            i === state.quizCurrentIndex ? 'bg-cyan-500 text-white' :
                                            state.quizAnswers[i] !== -1 ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' :
                                            'bg-slate-800/60 text-slate-400 hover:bg-slate-700/60 border border-slate-700'
                                        }">
                                    ${i + 1}
                                </button>
                            `).join('')}
                        </div>
                        <div class="flex flex-col sm:flex-row sm:justify-between gap-2 sm:gap-3">
                            <button onclick="prevQuestion()"
                                    ${state.quizCurrentIndex === 0 ? 'disabled' : ''}
                                    class="btn-secondary ${state.quizCurrentIndex === 0 ? 'opacity-50 cursor-not-allowed' : ''}">
                                ← 上一题
                            </button>
                            ${state.quizCurrentIndex === quiz.questions.length - 1 ?
                                `<button onclick="submitQuiz()" class="bg-emerald-600 hover:bg-emerald-500 text-white font-semibold py-2 px-6 rounded-lg transition-all shadow-md">提交考试 ✅</button>` :
                                `<button onclick="nextQuestion()" class="btn-primary">下一题 →</button>`
                            }
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
}

function selectAnswer(index) {
    state.quizAnswers[state.quizCurrentIndex] = index;
    renderQuizTaking();
}

function nextQuestion() {
    if (state.quizCurrentIndex < state.currentQuiz.questions.length - 1) {
        state.quizCurrentIndex++;
        renderQuizTaking();
    }
}

function prevQuestion() {
    if (state.quizCurrentIndex > 0) {
        state.quizCurrentIndex--;
        renderQuizTaking();
    }
}

function jumpToQuestion(index) {
    state.quizCurrentIndex = index;
    renderQuizTaking();
}

function submitQuiz() {
    const quiz = state.currentQuiz;
    let correctCount = 0;
    const results = quiz.questions.map((q, i) => {
        const userAnswer = state.quizAnswers[i];
        const isCorrect = userAnswer === q.answer;
        if (isCorrect) correctCount++;
        return {
            question: q.q,
            userAnswer,
            correctAnswer: q.answer,
            isCorrect,
            explain: q.explain,
            options: q.options
        };
    });
    
    const score = Math.round((correctCount / quiz.questions.length) * 100);
    const passed = score >= 60;
    
    const userData = state.userData;
    const existingIndex = userData.quizHistory.findIndex(h => h.quizId === quiz.id);
    const record = {
        quizId: quiz.id,
        quizTitle: quiz.title,
        score,
        passed,
        correctCount,
        totalCount: quiz.questions.length,
        date: new Date().toISOString().split('T')[0]
    };
    
    if (existingIndex >= 0) {
        const prevPassed = userData.quizHistory[existingIndex].passed;
        userData.quizHistory[existingIndex] = record;
        if (!prevPassed && passed) {
            userData.stats.quizPassed++;
        }
    } else {
        userData.quizHistory.push(record);
        if (passed) userData.stats.quizPassed++;
    }
    
    saveUserData(userData);
    state.userData = userData;
    
    state.quizResult = { score, passed, correctCount, totalCount: quiz.questions.length, results, quizTitle: quiz.title };
    navigate('quiz-result');
}

function renderQuizResult() {
    const r = state.quizResult;
    if (!r) { navigate('quiz'); return; }
    
    const scoreColor = r.score >= 90 ? 'text-emerald-400' : r.score >= 60 ? 'text-cyan-400' : 'text-red-400';
    const scoreEmoji = r.score >= 90 ? '🏆' : r.score >= 60 ? '🎉' : '💪';
    const bgGradient = r.score >= 60 ? 'from-emerald-600 to-teal-700' : 'from-red-600 to-rose-700';

    document.getElementById('main-content').innerHTML = `
        <div class="fade-in max-w-3xl mx-auto">
            <div class="card overflow-hidden">
                <div class="bg-gradient-to-r ${bgGradient} p-8 text-white text-center">
                    <div class="text-6xl mb-3">${scoreEmoji}</div>
                    <h2 class="text-2xl font-bold mb-2">${r.passed ? '考试通过！' : '需要继续努力'}</h2>
                    <p class="text-white/80 mb-4">${r.quizTitle}</p>
                    <div class="text-6xl font-bold">${r.score}<span class="text-2xl">分</span></div>
                    <div class="mt-4 flex justify-center gap-6 text-sm">
                        <div>正确: <span class="font-bold">${r.correctCount}</span></div>
                        <div>错误: <span class="font-bold">${r.totalCount - r.correctCount}</span></div>
                        <div>正确率: <span class="font-bold">${Math.round(r.correctCount / r.totalCount * 100)}%</span></div>
                    </div>
                </div>

                <div class="p-6">
                    <h3 class="font-bold text-slate-100 mb-4">📋 答题详情</h3>
                    <div class="space-y-4">
                        ${r.results.map((item, i) => `
                            <div class="border rounded-xl p-4 ${item.isCorrect ? 'border-emerald-500/30 bg-emerald-500/5' : 'border-red-500/30 bg-red-500/5'}">
                                <div class="flex items-start mb-3">
                                    <span class="w-7 h-7 rounded-full ${item.isCorrect ? 'bg-emerald-500' : 'bg-red-500'} text-white flex items-center justify-center text-sm mr-3 flex-shrink-0">
                                        ${item.isCorrect ? '✓' : '✗'}
                                    </span>
                                    <div class="flex-1">
                                        <div class="font-medium text-slate-100 mb-2">${i + 1}. ${item.question}</div>
                                        <div class="space-y-1 text-sm">
                                            ${item.options.map((opt, oi) => {
                                                let optClass = 'text-slate-400';
                                                let prefix = '';
                                                if (oi === item.correctAnswer) {
                                                    optClass = 'text-emerald-400 font-medium';
                                                    prefix = '✓ ';
                                                }
                                                if (oi === item.userAnswer && oi !== item.correctAnswer) {
                                                    optClass = 'text-red-400 font-medium';
                                                    prefix = '✗ ';
                                                }
                                                return `<div class="${optClass}">${prefix}${String.fromCharCode(65 + oi)}. ${opt}</div>`;
                                            }).join('')}
                                        </div>
                                        ${item.explain ? `<div class="mt-3 bg-slate-800/60 rounded-lg p-3 text-sm text-slate-300 border-l-4 border-cyan-500">
                                            <span class="font-semibold text-cyan-400">💡 解析: </span>${item.explain}
                                        </div>` : ''}
                                    </div>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </div>

                <div class="p-6 bg-slate-800/40 border-t border-slate-700 flex justify-center gap-4">
                    <button onclick="navigate('quiz')" class="btn-secondary">返回考试列表</button>
                    <button onclick="startQuiz(state.currentQuiz.id)" class="btn-primary">再考一次</button>
                </div>
            </div>
        </div>
    `;
}

function renderKnowledge() {
    let currentCategory = '全部';
    let expandedId = null;
    
    document.getElementById('main-content').innerHTML = `
        <div class="fade-in">
            <h1 class="text-2xl md:text-3xl font-bold text-slate-100 mb-2">💡 知识库</h1>
            <p class="text-slate-400 mb-6">精选车载测试专业知识，随时查阅学习</p>

            <div class="flex gap-2 overflow-x-auto scrollbar-hide mb-6 pb-2">
                ${['全部', ...new Set(KNOWLEDGE_BASE.map(k => k.category))].map(cat => `
                    <button onclick="setKBCategory('${cat}')"
                            class="kb-cat-btn px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${cat === currentCategory ? 'bg-cyan-600 text-white' : 'bg-slate-800/60 text-slate-300 hover:bg-slate-700/60 border border-slate-700'}">
                        ${cat}
                    </button>
                `).join('')}
            </div>

            <div id="kb-list" class="space-y-4">
                ${renderKnowledgeList(KNOWLEDGE_BASE, expandedId)}
            </div>
        </div>
    `;

    window.setKBCategory = function(cat) {
        currentCategory = cat;
        document.querySelectorAll('.kb-cat-btn').forEach((btn, i) => {
            if ((['全部', ...new Set(KNOWLEDGE_BASE.map(k => k.category))])[i] === cat) {
                btn.className = 'kb-cat-btn px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap bg-cyan-600 text-white';
            } else {
                btn.className = 'kb-cat-btn px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap bg-slate-800/60 text-slate-300 hover:bg-slate-700/60 border border-slate-700';
            }
        });
        const filtered = cat === '全部' ? KNOWLEDGE_BASE : KNOWLEDGE_BASE.filter(k => k.category === cat);
        document.getElementById('kb-list').innerHTML = renderKnowledgeList(filtered, null);
    };
    
    window.toggleKB = function(id) {
        if (expandedId === id) expandedId = null;
        else expandedId = id;
        const filtered = currentCategory === '全部' ? KNOWLEDGE_BASE : KNOWLEDGE_BASE.filter(k => k.category === currentCategory);
        document.getElementById('kb-list').innerHTML = renderKnowledgeList(filtered, expandedId);
    };
}

function renderKnowledgeList(items, expandedId) {
    return items.map(item => `
        <div class="knowledge-card" id="kb-${item.id}">
            <div class="flex items-start justify-between cursor-pointer" onclick="toggleKB('${item.id}')">
                <div class="flex-1">
                    <span class="badge mb-2">${item.category}</span>
                    <h3 class="font-bold text-slate-100 text-lg">${item.title}</h3>
                </div>
                <span class="text-2xl text-slate-400 transition-transform ${expandedId === item.id ? 'rotate-180' : ''}">▾</span>
            </div>
            <div class="overflow-hidden transition-all duration-300" style="max-height: ${expandedId === item.id ? '1000px' : '0'}">
                <div class="mt-4 pt-4 border-t border-slate-700 whitespace-pre-wrap text-slate-300 text-sm leading-relaxed">
                    ${item.content}
                </div>
            </div>
        </div>
    `).join('');
}

function renderProfile() {
    const userData = state.userData;
    const progressPercent = calculateOverallProgress();
    
    document.getElementById('main-content').innerHTML = `
        <div class="fade-in">
            <div class="card overflow-hidden mb-6">
                <div class="gradient-bg industry-banner p-8 text-white relative border-0" style="border-radius:0">
                    <div class="flex items-center">
                        <div class="w-20 h-20 bg-white/20 backdrop-blur rounded-full flex items-center justify-center text-4xl mr-6">
                            ${userData.avatar}
                        </div>
                        <div>
                            <h1 class="text-2xl font-bold text-white">${userData.name}</h1>
                            <div class="flex items-center gap-2 mt-2">
                                <span class="badge bg-white/20 border-white/35 text-white">${userData.level}</span>
                                <span class="text-sm text-white/80">加入于 ${userData.joinDate}</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="p-6 grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div class="text-center">
                        <div class="text-3xl font-bold text-cyan-400">${progressPercent}%</div>
                        <div class="text-sm text-slate-400 mt-1">总体进度</div>
                    </div>
                    <div class="text-center">
                        <div class="text-3xl font-bold text-emerald-400">${userData.stats.completedCourses}</div>
                        <div class="text-sm text-slate-400 mt-1">完成课程</div>
                    </div>
                    <div class="text-center">
                        <div class="text-3xl font-bold text-violet-400">${userData.stats.quizPassed}</div>
                        <div class="text-sm text-slate-400 mt-1">通过考试</div>
                    </div>
                    <div class="text-center">
                        <div class="text-3xl font-bold text-amber-400">${userData.stats.streakDays}</div>
                        <div class="text-sm text-slate-400 mt-1">连续天数</div>
                    </div>
                </div>
            </div>

            <div class="grid md:grid-cols-2 gap-6">
                <div class="card p-6">
                    <h2 class="font-bold text-slate-100 mb-4 flex items-center">
                        <span class="w-1 h-6 bg-cyan-500 rounded mr-3"></span>
                        学习中的课程
                    </h2>
                    <div class="space-y-4">
                        ${COURSES.filter(c => (userData.courseProgress[c.id] || 0) > 0).map(c => {
                            const p = userData.courseProgress[c.id] || 0;
                            return `
                                <div class="cursor-pointer" onclick="navigate('course-detail', {selectedCourseId: ${c.id}})">
                                    <div class="flex items-center justify-between mb-2">
                                        <div class="flex items-center">
                                            <span class="text-xl mr-2">${c.icon}</span>
                                            <span class="text-sm font-medium text-slate-200">${c.title}</span>
                                        </div>
                                        <span class="text-xs text-slate-400">${p}%</span>
                                    </div>
                                    <div class="w-full bg-slate-700/50 rounded-full h-2">
                                        <div class="bg-gradient-to-r ${c.color} h-2 rounded-full" style="width: ${p}%"></div>
                                    </div>
                                </div>
                            `;
                        }).join('') || '<p class="text-slate-500 text-sm text-center py-4">还没有开始任何课程</p>'}
                    </div>
                </div>

                <div class="card p-6">
                    <h2 class="font-bold text-slate-100 mb-4 flex items-center">
                        <span class="w-1 h-6 bg-cyan-500 rounded mr-3"></span>
                        考试历史
                    </h2>
                    <div class="space-y-3">
                        ${userData.quizHistory.length > 0 ? userData.quizHistory.map(h => `
                            <div class="flex items-center justify-between py-2 border-b border-slate-700/50 last:border-0">
                                <div>
                                    <div class="font-medium text-sm text-slate-200">${h.quizTitle}</div>
                                    <div class="text-xs text-slate-500">${h.date}</div>
                                </div>
                                <div class="text-right">
                                    <div class="font-bold ${h.passed ? 'text-emerald-400' : 'text-red-400'}">${h.score}分</div>
                                    <div class="text-xs ${h.passed ? 'text-emerald-500' : 'text-red-500'}">${h.passed ? '通过' : '未通过'}</div>
                                </div>
                            </div>
                        `).join('') : '<p class="text-slate-500 text-sm text-center py-4">暂无考试记录</p>'}
                    </div>
                </div>
            </div>

            <div class="mt-6 card p-6">
                <h2 class="font-bold text-slate-100 mb-4 flex items-center">
                    <span class="w-1 h-6 bg-cyan-500 rounded mr-3"></span>
                    🎖️ 成就徽章
                </h2>
                <div class="grid grid-cols-3 md:grid-cols-6 gap-4">
                    ${[
                        { icon: '🚀', name: '启程', cond: true },
                        { icon: '📚', name: '学者', cond: userData.stats.completedCourses >= 1 },
                        { icon: '🏆', name: '考试达人', cond: userData.stats.quizPassed >= 1 },
                        { icon: '🌟', name: '优秀学员', cond: userData.stats.quizPassed >= 3 },
                        { icon: '💎', name: '专家', cond: userData.stats.completedCourses >= 5 },
                        { icon: '🔥', name: '坚持', cond: userData.stats.streakDays >= 7 }
                    ].map(b => `
                        <div class="text-center p-4 rounded-xl ${b.cond ? 'bg-amber-500/10 border border-amber-500/30' : 'bg-slate-800/40 border border-slate-700/50 opacity-40'}">
                            <div class="text-3xl mb-2">${b.icon}</div>
                            <div class="text-xs font-medium text-slate-200">${b.name}</div>
                            ${b.cond ? '<div class="text-xs text-emerald-400 mt-1">✓ 已获得</div>' : '<div class="text-xs text-slate-500 mt-1">未解锁</div>'}
                        </div>
                    `).join('')}
                </div>
            </div>

            <div class="mt-6 flex justify-center">
                <button onclick="resetData()" class="text-red-400 text-sm hover:text-red-300">🔄 重置学习数据</button>
            </div>
        </div>
    `;
}

function resetData() {
    if (confirm('确定要重置所有学习数据吗？此操作不可恢复！')) {
        localStorage.removeItem('carStudyUserData');
        state.userData = loadUserData();
        navigate('profile');
        showToast('数据已重置');
    }
}

function showToast(message) {
    const existing = document.getElementById('toast');
    if (existing) existing.remove();
    
    const toast = document.createElement('div');
    toast.id = 'toast';
    toast.className = 'fixed top-20 left-1/2 -translate-x-1/2 bg-gray-800 text-white px-6 py-3 rounded-xl shadow-2xl z-50 animate-bounce';
    toast.textContent = message;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 2500);
}

function startLesson(courseId, sectionIndex, lessonIndex) {
    state.lessonSectionIndex = sectionIndex;
    state.lessonLessonIndex = lessonIndex;
    state.lessonExpandedSection = sectionIndex;
    navigate('lesson');
}

function goToLesson(sectionIndex, lessonIndex) {
    state.lessonSectionIndex = sectionIndex;
    state.lessonLessonIndex = lessonIndex;
    state.lessonExpandedSection = sectionIndex;
    renderLessonPage();
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function toggleLessonSection(si) {
    state.lessonExpandedSection = state.lessonExpandedSection === si ? null : si;
    renderLessonPage();
}

function markLessonComplete() {
    const course = COURSES.find(c => c.id === state.selectedCourseId);
    const totalLessons = getTotalLessons(course);
    const currentFlatIndex = getFlatIndex(course, state.lessonSectionIndex, state.lessonLessonIndex);
    const newProgress = Math.round((currentFlatIndex + 1) / totalLessons * 100);
    
    const userData = state.userData;
    const currentProgress = userData.courseProgress[course.id] || 0;
    if (newProgress > currentProgress) {
        userData.courseProgress[course.id] = newProgress;
        if (newProgress >= 100 && currentProgress < 100) {
            userData.stats.completedCourses++;
            showToast('🎉 恭喜完成全部课程！');
        } else {
            showToast('✓ 已标记完成');
        }
        saveUserData(userData);
        state.userData = userData;
    }
    
    if (currentFlatIndex < totalLessons - 1) {
        const flatLessons = getAllLessonsFlat(course);
        const next = flatLessons[currentFlatIndex + 1];
        goToLesson(next.sectionIndex, next.lessonIndex);
    } else {
        renderLessonPage();
    }
}

function getFlatIndex(course, sectionIndex, lessonIndex) {
    let index = 0;
    for (let i = 0; i < sectionIndex; i++) {
        index += course.sections[i].lessons.length;
    }
    index += lessonIndex;
    return index;
}

function parseContentToHTML(content) {
    let html = content;
    html = html.replace(/## (.+)/g, '<h2 class="text-2xl font-bold text-slate-100 mt-8 mb-4 pb-2 border-b-2 border-cyan-500/20">$1</h2>');
    html = html.replace(/### (.+)/g, '<h3 class="text-xl font-semibold text-slate-200 mt-6 mb-3">$1</h3>');
    html = html.replace(/\*\*(.+?)\*\*/g, '<strong class="text-cyan-300">$1</strong>');

    // 先处理代码块（避免行内代码正则消耗围栏反引号）
    html = html.replace(/```[\s\S]*?```/g, match => {
        const code = match.replace(/```\w*\n?|```/g, '');
        return `<pre class="bg-slate-950 text-emerald-300 border border-slate-800 p-4 rounded-lg overflow-x-auto my-4 text-sm font-mono leading-relaxed">${code.trim()}</pre>`;
    });

    html = html.replace(/`([^`]+)`/g, '<code class="bg-slate-800 text-emerald-300 px-2 py-0.5 rounded text-sm font-mono">$1</code>');

    const tableRegex = /(\|.+\|\n)+/g;
    html = html.replace(tableRegex, match => {
        const lines = match.trim().split('\n');
        let isNew = true;
        let thead = '';
        let tbody = '';
        lines.forEach(line => {
            if (line.includes('---')) return;
            const cells = line.split('|').filter(c => c.trim() !== '');
            if (isNew) {
                isNew = false;
                thead = `<tr>${cells.map(c => `<th class="px-4 py-3 text-left font-semibold text-cyan-300 border border-slate-700">${c.trim()}</th>`).join('')}</tr>`;
            } else {
                tbody += `<tr class="hover:bg-slate-800/40">${cells.map(c => `<td class="px-4 py-3 border border-slate-700 text-slate-300">${c.trim()}</td>`).join('')}</tr>`;
            }
        });
        return `<div class="overflow-x-auto my-4"><table class="w-full text-sm border-collapse bg-slate-800/40 rounded-lg overflow-hidden"><thead class="bg-cyan-500/10">${thead}</thead><tbody>${tbody}</tbody></table></div>`;
    });

    html = html.replace(/^- (.+)$/gm, '<li class="ml-6 list-disc text-slate-300">$1</li>');
    html = html.replace(/^(\d+)\. (.+)$/gm, '<li class="ml-6 list-decimal text-slate-300">$2</li>');

    html = html.replace(/(?<!\n)\n/g, '<br>');

    return html;
}

function renderLessonPage() {
    const course = COURSES.find(c => c.id === state.selectedCourseId);
    if (!course) { navigate('courses'); return; }
    
    const sectionIndex = state.lessonSectionIndex;
    const lessonIndex = state.lessonLessonIndex;
    const content = getLessonContent(course.id, sectionIndex, lessonIndex);
    const totalLessons = getTotalLessons(course);
    const currentFlatIndex = getFlatIndex(course, sectionIndex, lessonIndex);
    const progress = state.userData.courseProgress[course.id] || 0;
    const isCompleted = currentFlatIndex < Math.round(progress / 100 * totalLessons);
    
    const prevLesson = currentFlatIndex > 0 ? getAllLessonsFlat(course)[currentFlatIndex - 1] : null;
    const nextLesson = currentFlatIndex < totalLessons - 1 ? getAllLessonsFlat(course)[currentFlatIndex + 1] : null;
    
    document.getElementById('main-content').innerHTML = `
        <div class="fade-in">
            <button onclick="navigate('course-detail', {selectedCourseId: ${course.id}})" class="text-cyan-400 hover:text-cyan-300 mb-4 flex items-center text-sm">
                ← 返回课程详情
            </button>

            <div class="grid lg:grid-cols-4 gap-6">
                <div class="lg:col-span-1 order-2 lg:order-1">
                    <div class="card sticky top-24 overflow-hidden">
                        <div class="bg-gradient-to-br ${course.color} p-4 text-white">
                            <div class="flex items-center mb-1">
                                <span class="text-2xl mr-2">${course.icon}</span>
                                <h3 class="font-bold text-sm">${course.title}</h3>
                            </div>
                            <div class="text-xs opacity-80">进度 ${progress}% · ${currentFlatIndex + 1}/${totalLessons}</div>
                        </div>
                        <div class="max-h-[60vh] overflow-y-auto">
                            ${course.sections.map((section, si) => {
                                const sectionLessons = section.lessons;
                                const expanded = state.lessonExpandedSection === si;
                                return `
                                    <div class="border-b border-slate-700/50 last:border-b-0">
                                        <div class="px-4 py-3 flex items-center justify-between bg-slate-800/60 hover:bg-slate-800 cursor-pointer transition-colors" onclick="toggleLessonSection(${si})">
                                            <div class="flex items-center">
                                                <span class="w-6 h-6 bg-cyan-500/15 text-cyan-400 rounded flex items-center justify-center text-xs font-semibold mr-2">${si + 1}</span>
                                                <span class="font-medium text-sm text-slate-200">${section.title}</span>
                                            </div>
                                            <span class="text-slate-500 text-xs transition-transform ${expanded ? 'rotate-180' : ''}">▾</span>
                                        </div>
                                        <div class="overflow-hidden transition-all duration-300" style="max-height: ${expanded ? sectionLessons.length * 48 + 20 + 'px' : '0'}">
                                            <div class="pb-2">
                                                ${sectionLessons.map((lesson, li) => {
                                                    const lessonContent = getLessonContent(course.id, si, li);
                                                    const hasContent = lessonContent !== null;
                                                    const isActive = si === sectionIndex && li === lessonIndex;
                                                    const lessonFlatIdx = getFlatIndex(course, si, li);
                                                    const lessonDone = lessonFlatIdx < Math.round(progress / 100 * totalLessons);
                                                    return `
                                                        <div onclick="${hasContent ? `goToLesson(${si}, ${li})` : ''}"
                                                             class="px-4 py-2.5 flex items-center text-sm transition-all cursor-pointer ${isActive ? 'bg-cyan-500/10 text-cyan-300 border-l-4 border-cyan-500 font-medium' : 'text-slate-400 hover:bg-slate-800/40'} ${!hasContent ? 'opacity-40 cursor-not-allowed' : ''}">
                                                            <span class="w-5 h-5 rounded-full mr-2 flex items-center justify-center text-xs ${
                                                                lessonDone ? 'bg-emerald-500 text-white' :
                                                                isActive ? 'bg-cyan-500 text-white' :
                                                                'bg-slate-700 text-slate-400'
                                                            }">${lessonDone ? '✓' : lessonFlatIdx + 1}</span>
                                                            <span class="flex-1 truncate">${lesson}</span>
                                                            ${!hasContent ? '<span class="text-xs text-slate-500">🔒</span>' : ''}
                                                        </div>
                                                    `;
                                                }).join('')}
                                            </div>
                                        </div>
                                    </div>
                                `;
                            }).join('')}
                        </div>
                    </div>
                </div>

                <div class="lg:col-span-3 order-1 lg:order-2">
                    <div class="card overflow-hidden">
                        ${content ? `
                            <div class="bg-gradient-to-r ${course.color} p-6 text-white">
                                <div class="text-sm opacity-80 mb-1">${course.sections[sectionIndex].title} · 第${lessonIndex + 1}课</div>
                                <h1 class="text-2xl md:text-3xl font-bold">${content.title}</h1>
                                <div class="mt-3 flex items-center gap-3 text-sm opacity-80">
                                    <span>📖 共${totalLessons}课</span>
                                    <span>·</span>
                                    <span>当前第${currentFlatIndex + 1}课</span>
                                </div>
                            </div>

                            <div class="p-6 md:p-8 leading-relaxed text-slate-300">
                                ${parseContentToHTML(content.content)}

                                ${content.keyPoints && content.keyPoints.length > 0 ? `
                                    <div class="mt-8 p-5 bg-cyan-500/5 rounded-xl border-l-4 border-cyan-500">
                                        <h4 class="font-bold text-cyan-300 mb-3 flex items-center">
                                            <span class="mr-2">📌</span> 本节重点
                                        </h4>
                                        <ul class="space-y-2">
                                            ${content.keyPoints.map(kp => `
                                                <li class="flex items-start text-slate-300">
                                                    <span class="w-2 h-2 bg-cyan-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                                                    <span>${kp}</span>
                                                </li>
                                            `).join('')}
                                        </ul>
                                    </div>
                                ` : ''}

                                ${content.quizCheck ? `
                                    <div class="mt-6 p-5 bg-amber-500/5 rounded-xl border-l-4 border-amber-500">
                                        <h4 class="font-bold text-amber-300 mb-2 flex items-center">
                                            <span class="mr-2">🤔</span> 思考一下
                                        </h4>
                                        <p class="text-slate-300">${content.quizCheck}</p>
                                    </div>
                                ` : ''}
                            </div>
                        ` : `
                            <div class="p-12 text-center">
                                <div class="text-6xl mb-4">🔒</div>
                                <h3 class="text-xl font-bold text-slate-100 mb-2">该课程内容即将上线</h3>
                                <p class="text-slate-400">当前课时「${course.sections[sectionIndex].lessons[lessonIndex]}」的详细内容正在整理中，请先学习其他已有内容的课时。</p>
                            </div>
                        `}

                        <div class="border-t border-slate-700 bg-slate-800/40 p-6 flex flex-wrap items-center justify-between gap-4">
                            <div class="flex gap-3">
                                ${prevLesson ? `
                                    <button onclick="goToLesson(${prevLesson.sectionIndex}, ${prevLesson.lessonIndex})" class="btn-secondary text-sm">← 上一课</button>
                                ` : '<div class="text-sm text-slate-500">已到第一课</div>'}
                            </div>

                            <button onclick="markLessonComplete()" class="btn-primary text-sm flex items-center gap-2">
                                ${nextLesson ? '标记完成并继续 →' : '✓ 标记完成'}
                            </button>

                            <div class="flex gap-3">
                                ${nextLesson ? `
                                    <button onclick="goToLesson(${nextLesson.sectionIndex}, ${nextLesson.lessonIndex})" class="btn-secondary text-sm">下一课 →</button>
                                ` : '<div class="text-sm text-emerald-400 font-medium">🎉 已到最后一课</div>'}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
}

document.addEventListener('DOMContentLoaded', init);

function renderResources() {
    let currentTab = 'platforms';
    
    document.getElementById('main-content').innerHTML = `
        <div class="fade-in">
            <div class="gradient-bg rounded-3xl p-4 sm:p-8 md:p-12 mb-6 sm:mb-8 text-white relative overflow-hidden">
                <div class="absolute top-0 right-0 w-64 h-64 bg-cyan-400/10 rounded-full -translate-y-1/2 translate-x-1/2"></div>
                <div class="absolute bottom-0 left-0 w-48 h-48 bg-emerald-400/15 rounded-full translate-y-1/2 -translate-x-1/2"></div>
                <div class="relative z-10">
                    <div class="text-4xl sm:text-5xl mb-3 sm:mb-4">🌟</div>
                    <h1 class="text-xl sm:text-3xl md:text-4xl font-bold mb-2 sm:mb-3">学习推荐中心</h1>
                    <p class="text-cyan-100 text-sm sm:text-base mb-4 sm:mb-6 max-w-2xl">精选行业官方平台、国际标准、开源项目与学习方法，助你系统掌握智能驾驶与新能源汽车技术。</p>
                    <div class="flex gap-2 sm:gap-3 flex-wrap">
                        <span class="badge bg-white/20 backdrop-blur-sm text-xs sm:text-sm">📋 ${RESOURCES.length} 大类标准资源</span>
                        <span class="badge bg-white/20 backdrop-blur-sm text-xs sm:text-sm">🔗 ${RESOURCES.reduce((s,r)=>s+r.items.length,0)}+ 官方链接</span>
                        <span class="badge bg-white/20 backdrop-blur-sm text-xs sm:text-sm">🎯 ${LEARNING_METHODS.length} 种学习路径</span>
                    </div>
                </div>
            </div>

            <div class="card p-2 mb-6 flex flex-col sm:flex-row gap-2">
                <button onclick="setTab('platforms')" id="tab-platforms" class="tab-btn flex-1 py-3 px-3 sm:px-4 rounded-xl font-semibold transition-all bg-gradient-to-r from-cyan-500 to-emerald-500 text-white shadow-md text-sm sm:text-base">
                    🔗 官方平台与标准
                </button>
                <button onclick="setTab('methods')" id="tab-methods" class="tab-btn flex-1 py-3 px-3 sm:px-4 rounded-xl font-semibold transition-all text-slate-300 hover:bg-slate-700/50 text-sm sm:text-base">
                    🎯 学习方法与路径
                </button>
            </div>

            <div id="resources-content"></div>
        </div>
    `;

    window.setTab = function(tab) {
        currentTab = tab;
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.className = 'tab-btn flex-1 py-3 px-4 rounded-xl font-semibold transition-all text-slate-300 hover:bg-slate-700/50';
        });
        document.getElementById('tab-' + tab).className = 'tab-btn flex-1 py-3 px-4 rounded-xl font-semibold transition-all bg-gradient-to-r from-cyan-500 to-emerald-500 text-white shadow-md';
        document.getElementById('resources-content').innerHTML = tab === 'platforms' ? renderPlatforms() : renderMethods();
    };
    
    document.getElementById('resources-content').innerHTML = renderPlatforms();
}

function renderPlatforms() {
    return RESOURCES.map(category => `
        <div class="card p-4 sm:p-6 mb-6">
            <div class="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-5">
                <span class="text-2xl sm:text-3xl">${category.icon}</span>
                <h2 class="text-lg sm:text-xl font-bold text-slate-100">${category.category}</h2>
                <span class="badge text-xs">${category.items.length} 项</span>
            </div>
            <div class="grid md:grid-cols-2 gap-2 sm:gap-3">
                ${category.items.map(item => `
                    <a href="${item.url}" target="_blank" rel="noopener noreferrer"
                       class="group flex items-center gap-3 p-3 sm:p-4 rounded-xl border border-slate-700/60 hover:border-cyan-500/50 hover:bg-cyan-500/5 transition-all">
                        <div class="w-9 h-9 sm:w-10 sm:h-10 bg-gradient-to-br from-cyan-500/20 to-emerald-500/20 rounded-xl flex items-center justify-center text-base sm:text-lg flex-shrink-0 group-hover:from-cyan-500/30 group-hover:to-emerald-500/30 transition-all">
                            🔗
                        </div>
                        <div class="flex-1 min-w-0">
                            <h3 class="font-semibold text-slate-200 text-sm group-hover:text-cyan-400 transition-colors truncate">${item.name}</h3>
                            <p class="text-xs text-slate-500 mt-0.5 truncate">${item.desc}</p>
                        </div>
                        <span class="text-cyan-400 opacity-0 group-hover:opacity-100 transition-opacity text-xl flex-shrink-0">→</span>
                    </a>
                `).join('')}
            </div>
        </div>
    `).join('');
}

function renderMethods() {
    return `
        <div class="card p-4 sm:p-6 mb-6">
            <div class="mb-3 sm:mb-4">
                <h2 class="text-lg sm:text-xl font-bold text-slate-100">🎯 学习路径总览</h2>
                <p class="text-xs sm:text-sm text-slate-400 mt-1">六步法打造专业车载工程师</p>
            </div>
            <div class="grid grid-cols-3 sm:grid-cols-6 gap-2">
                ${['理论筑基','工具实战','项目驱动','专项深耕','社区交流','证书加持'].map((s,i) => `
                    <div class="text-center">
                        <div class="w-12 h-12 mx-auto sm:w-full sm:h-auto sm:aspect-square rounded-full ${i < 3 ? 'bg-gradient-to-br from-cyan-400 to-cyan-500' : i < 5 ? 'bg-gradient-to-br from-emerald-400 to-emerald-500' : 'bg-gradient-to-br from-violet-400 to-violet-500'} flex items-center justify-center text-white font-bold shadow-md text-sm">
                            ${i+1}
                        </div>
                        <div class="text-xs text-slate-400 mt-1 sm:mt-2 font-medium leading-tight">${s}</div>
                    </div>
                `).join('')}
            </div>
        </div>
        ${LEARNING_METHODS.map((m, i) => `
            <div class="card p-4 sm:p-6 mb-4">
                <div class="flex flex-col sm:flex-row items-start gap-3 sm:gap-4">
                    <div class="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-br ${i < 3 ? 'from-cyan-400 to-cyan-600' : 'from-emerald-400 to-emerald-600'} flex items-center justify-center text-white font-bold shadow-md flex-shrink-0">
                        ${i + 1}
                    </div>
                    <div class="flex-1 min-w-0">
                        <h3 class="text-base sm:text-lg font-bold text-slate-100 mb-1 sm:mb-2">${m.title}</h3>
                        <p class="text-slate-300 leading-relaxed text-sm mb-2 sm:mb-3">${m.desc}</p>
                        <div class="flex flex-wrap gap-1.5 sm:gap-2">
                            ${m.tips.map(t => `<span class="badge badge-slate text-xs">✓ ${t}</span>`).join('')}
                        </div>
                    </div>
                </div>
            </div>
        `).join('')}
        <div class="bg-gradient-to-r from-cyan-600 to-emerald-600 rounded-2xl p-4 sm:p-6 text-white">
            <h3 class="font-bold text-base sm:text-lg mb-2 sm:mb-3">💡 学习建议</h3>
            <p class="text-sm opacity-90 leading-relaxed">车载行业正在经历前所未有的变革——智能驾驶从 L2 向 L4 演进，新能源汽车渗透率持续攀升。抓住这个窗口期，系统学习协议标准 + 熟练工具链 + 参与真实项目，逐步成为领域专家。九键车载学习平台的课程体系正是按照这个路径设计的，从 CAN 基础到 ADAS 测试，一步步带你成长。</p>
        </div>
    `;
}
