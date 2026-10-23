/* ==========================================================
   智驾可视化仪表盘 · 功能演示 - 九键车载学习平台
   SVG + CSS 动画（offset-path 路径动画），零 rAF / 零 Canvas
   覆盖 16 项行车/泊车功能场景与传感器依赖
   教学动画演示，不连接真实硬件
   ========================================================== */

/* ---------- 传感器元数据 ---------- */
const ADAS_SENSORS = {
    frontCamWide:   { name: '前视广角摄像头',     type: 'camera', ico: '📷' },
    frontCamTele:   { name: '前视长焦摄像头',     type: 'camera', ico: '📷' },
    rearCam:        { name: '后视摄像头',         type: 'camera', ico: '📷' },
    sideCam:        { name: '侧视摄像头 ×4',      type: 'camera', ico: '📷' },
    surroundCam:    { name: '环视鱼眼摄像头 ×4',  type: 'camera', ico: '🎥' },
    frontRadarFar:  { name: '前毫米波雷达(远场)', type: 'radar',  ico: '📡' },
    frontRadarNear: { name: '前毫米波雷达(近场)', type: 'radar',  ico: '📡' },
    cornerRadar:    { name: '角雷达 ×4',          type: 'radar',  ico: '📡' },
    lidar:          { name: '激光雷达',           type: 'lidar',  ico: '🛰️' },
    uss:            { name: '超声波雷达 ×12',     type: 'uss',    ico: '📡' },
    dms:            { name: '驾驶员监控 DMS',     type: 'dms',    ico: '👁️' }
};
const ADAS_SENSOR_COLOR = { camera: '#3aa0ff', radar: '#25c58b', lidar: '#ff5d7a', uss: '#ffb020', dms: '#b07cff' };
const ADAS_SENSOR_TYPE_CN = { camera: '摄像头', radar: '毫米波雷达', lidar: '激光雷达', uss: '超声波', dms: '舱内监测' };

/* ---------- 功能数据（基于培训材料整理） ---------- */
const ADAS_FUNCTIONS = {
    driving: [
        { name: 'ACC', en: 'Adaptive Cruise Control', c: '#3aa0ff', sens: ['frontCamWide', 'frontRadarFar', 'frontRadarNear'],
          desc: '全速域自适应巡航：无前车按设定速度巡航，有前车按设定时距跟车（0~150km/h）。', scene: 'acc' },
        { name: 'LKA / LCC', en: 'Lane Keeping / Centering Control', c: '#3aa0ff', sens: ['frontCamWide'],
          desc: '车道保持/居中：车辆无意偏离车道时施加纠偏力矩，或持续保持在车道中央。', scene: 'lka' },
        { name: 'AEB', en: 'Automatic Emergency Braking', c: '#3aa0ff', sens: ['frontCamWide', 'frontCamTele', 'frontRadarFar', 'frontRadarNear'],
          desc: '自动紧急制动：检测到前向碰撞风险（车/行人/二轮车）时自动制动，长焦摄像头提升远距识别。', scene: 'aeb' },
        { name: 'TJA', en: 'Traffic Jam Assist', c: '#3aa0ff', sens: ['frontCamWide', 'frontRadarFar', 'frontRadarNear'],
          desc: '拥堵辅助（0~60km/h）：低速跟车走走停停，有前车时跟随前车轨迹。', scene: 'tja' },
        { name: 'HWA / NOA', en: 'Highway Assist / Navigate on Autopilot', c: '#38d5e8', sens: ['frontCamWide', 'frontCamTele', 'frontRadarFar', 'frontRadarNear', 'cornerRadar', 'lidar', 'sideCam', 'rearCam'],
          desc: '高速领航：高速 ODD 内自动跟车、变道、进出匝道，需高精地图与全向感知。', scene: 'noa' },
        { name: 'DCLC / ALC', en: 'Lane Change', c: '#38d5e8', sens: ['frontCamWide', 'rearCam', 'cornerRadar', 'sideCam'],
          desc: '指令/主动变道：驾驶员打灯或系统主动判断安全时机，自动完成换道并居中。', scene: 'alc' },
        { name: 'LDW / FCW', en: 'Warning Functions', c: '#3aa0ff', sens: ['frontCamWide', 'frontRadarFar', 'frontRadarNear'],
          desc: '车道偏离预警 + 前向碰撞预警：仅报警、不干预，提醒驾驶员。', scene: null },
        { name: 'TSR / IHC', en: 'Traffic Sign / High Beam', c: '#3aa0ff', sens: ['frontCamWide'],
          desc: '交通标志识别 + 智能远光灯控制：识别限速牌并按当前车道汇报；夜间自动切换远近光。', scene: null },
        { name: 'ELK', en: 'Emergency Lane Keeping', c: '#3aa0ff', sens: ['frontCamWide', 'rearCam', 'cornerRadar'],
          desc: '紧急车道保持：车辆可能冲出实线/路缘或与对向、超车车辆碰撞时主动纠偏。', scene: null },
        { name: 'TJP / HWP', en: 'Traffic Jam / Highway Pilot (L3)', c: '#25c58b', sens: ['frontCamWide', 'frontCamTele', 'frontRadarFar', 'frontRadarNear', 'cornerRadar', 'rearCam', 'lidar', 'dms'],
          desc: 'L3 代驾：ODD 内系统独立驾驶，检测异常/驶离 ODD 时请求接管，超时不接管则本车道停车。', scene: null }
    ],
    parking: [
        { name: 'AVM', en: 'Around View Monitor', c: '#ffb020', sens: ['surroundCam'],
          desc: '360° 环视影像：4 路鱼眼摄像头（前/后保险杠 + 左右后视镜尖角）拼接出车周全景鸟瞰图。', scene: 'avm' },
        { name: 'APA', en: 'Automated Parking Assist', c: '#ffb020', sens: ['surroundCam', 'uss'],
          desc: '自动泊车：环视 + 超声波识别车位（线车位/空间车位），自动完成泊入。', scene: 'apa' },
        { name: 'RPA', en: 'Remote Parking Assist', c: '#ffb020', sens: ['surroundCam', 'uss'],
          desc: '遥控泊车：驾驶员在车外通过手机遥控车辆泊入/泊出狭窄车位。', scene: 'rpa' },
        { name: 'AVP', en: 'Automated Valet Parking', c: '#ff5d7a', sens: ['surroundCam', 'uss', 'lidar'],
          desc: '代客泊车：驾驶员下车后，车辆自主导航驶入停车场并寻找车位泊入（L4 场景）。', scene: 'avp' },
        { name: 'HPP', en: 'Home-Zone Parking Pilot', c: '#ffb020', sens: ['surroundCam', 'uss'],
          desc: '记忆泊车：学习驾驶员常用泊车路线，之后可自动从车库口行驶到车位。', scene: null },
        { name: 'PAW', en: 'Parking Assist Warning', c: '#ffb020', sens: ['surroundCam', 'uss'],
          desc: '泊车碰撞预警：行驶/泊入过程中对车周障碍物实时报警。', scene: null }
    ]
};

/* ---------- 车辆图形（俯视轮廓） ---------- */
function adasCar(w, l, stroke) {
    const s = stroke || '#00d4ff';
    return `<g>
        <rect x="${-w / 2}" y="${-l / 2}" width="${w}" height="${l}" rx="${Math.min(7, w * 0.14)}" fill="none" stroke="${s}" stroke-width="1.4"/>
        <rect x="${-w / 2 + 3}" y="${-l / 2 + l * 0.18}" width="${w - 6}" height="${l * 0.18}" rx="3" fill="none" stroke="${s}" stroke-width=".8" opacity=".5"/>
        <rect x="${-w / 2 + 3}" y="${-l / 2 + l * 0.46}" width="${w - 6}" height="${l * 0.36}" rx="3" fill="none" stroke="${s}" stroke-width=".8" opacity=".3"/>
    </g>`;
}

/* ---------- 场景 SVG 定义（纯 CSS 动画，主题色由 CSS 变量驱动） ---------- */
function adasSceneSVG(name) {
    const common = `<defs><style>
        .road{fill:var(--scn-road)}
        .lane{stroke:var(--scn-lane);stroke-width:2;stroke-dasharray:10 12}
        .tx{font-family:"Microsoft YaHei",sans-serif;fill:var(--scn-text);font-size:12px}
        .lbl{font-family:"Microsoft YaHei",sans-serif;fill:var(--scn-label);font-size:13px;font-weight:700}
        .warn{fill:#ff5d7a}
        .park{fill:var(--scn-park);stroke:var(--scn-parkline);stroke-width:1.4}
        .pbg{fill:var(--scn-parkbg)}
        .pth{fill:none;stroke:#00d4ff;stroke-width:2.2;stroke-dasharray:6 5;opacity:.85}
        .anim{transform-box:fill-box;transform-origin:center}
    </style></defs>`;
    switch (name) {
        case 'acc': return `<svg viewBox="0 0 480 300">${common}
            <rect class="road" width="480" height="300"/>
            <line class="lane" x1="150" y1="0" x2="150" y2="300"/>
            <line class="lane" x1="330" y1="0" x2="330" y2="300"/>
            <text class="tx" x="18" y="26">ACC · 按设定时距跟车（前车减速→同步降速）</text>
            <g class="acc-gap"><line x1="240" y1="92" x2="240" y2="132" stroke="#00e5a0" stroke-width="2" stroke-dasharray="4 4"/><text class="tx" x="248" y="114">2.0s 时距</text></g>
            <g class="anim acc-lead">${adasCar(38, 66, '#94a3b8')}</g>
            <g class="anim acc-ego">${adasCar(38, 66)}</g>
            <style>
                .acc-lead{offset-path:path("M240,40 L240,-40");offset-rotate:auto 90deg;animation:accL 4s ease-in-out infinite}
                .acc-ego{offset-path:path("M240,200 L240,120");offset-rotate:auto 90deg;animation:accE 4s ease-in-out infinite}
                .acc-gap{animation:accG 2s ease-in-out infinite}
                @keyframes accL{0%{offset-distance:0%}100%{offset-distance:100%}}
                @keyframes accE{0%{offset-distance:0%}100%{offset-distance:100%}}
                @keyframes accG{0%,100%{opacity:.25}50%{opacity:1}}
            </style>
        </svg>`;
        case 'aeb': return `<svg viewBox="0 0 480 300">${common}
            <rect class="road" width="480" height="300"/>
            <line class="lane" x1="150" y1="0" x2="150" y2="300"/>
            <line class="lane" x1="330" y1="0" x2="330" y2="300"/>
            <text class="tx" x="18" y="26">AEB · 前方静止车辆 → 自动紧急制动</text>
            <g class="aeb-target"><rect x="222" y="22" width="36" height="60" rx="6" fill="var(--scn-park)" stroke="#ef4444" stroke-width="1.4"/><text class="tx" x="240" y="96" text-anchor="middle">前车（静止）</text></g>
            <g class="aeb-warn"><polygon class="warn" points="240,150 222,180 258,180"/><text x="240" y="173" text-anchor="middle" fill="#fff" font-size="15" font-weight="800">!</text></g>
            <line x1="120" y1="196" x2="360" y2="196" stroke="#ff5d7a" stroke-width="1.5" stroke-dasharray="5 5" opacity=".6"/>
            <g class="anim aeb-ego">${adasCar(38, 66)}</g>
            <text class="tx" x="248" y="272">刹停间距</text>
            <style>
                .aeb-ego{offset-path:path("M240,270 L240,216");offset-rotate:auto 90deg;animation:aebE 4s cubic-bezier(.55,.06,.68,.19) infinite}
                .aeb-warn{animation:aebW .45s steps(1) 10;animation-fill-mode:forwards;opacity:0}
                @keyframes aebE{0%{offset-distance:0%}100%{offset-distance:100%}}
                @keyframes aebW{0%,100%{opacity:0}50%{opacity:1}}
            </style>
        </svg>`;
        case 'lka': return `<svg viewBox="0 0 480 300">${common}
            <rect class="road" width="480" height="300"/>
            <line x1="140" y1="0" x2="140" y2="300" stroke="#fbbf24" stroke-width="3"/>
            <line x1="340" y1="0" x2="340" y2="300" stroke="#fbbf24" stroke-width="3"/>
            <text class="tx" x="18" y="26">LKA / LCC · 车道偏离 → 系统施加纠偏力矩回中</text>
            <g class="anim lka-car">${adasCar(38, 66)}</g>
            <g class="lka-torque"><path d="M150,70 l-26,14 M150,70 l-2,30" stroke="#00e5a0" stroke-width="3" fill="none" opacity=".9"/><text class="tx" x="96" y="66">纠偏力矩</text></g>
            <style>
                .lka-car{offset-path:path("M240,240 C200,180 200,100 240,40");offset-rotate:auto 90deg;animation:lka 5s ease-in-out infinite}
                .lka-torque{animation:lkaT 5s ease-in-out infinite}
                @keyframes lka{0%{offset-distance:0%}100%{offset-distance:100%}}
                @keyframes lkaT{0%,18%{opacity:0}30%,60%{opacity:1}80%,100%{opacity:0}}
            </style>
        </svg>`;
        case 'tja': return `<svg viewBox="0 0 480 300">${common}
            <rect class="road" width="480" height="300"/>
            <line class="lane" x1="150" y1="0" x2="150" y2="300"/>
            <line class="lane" x1="330" y1="0" x2="330" y2="300"/>
            <text class="tx" x="18" y="26">TJA · 拥堵路况 走走停停（0~60km/h）</text>
            <g class="anim tja-a">${adasCar(36, 60, '#94a3b8')}</g>
            <g class="anim tja-b">${adasCar(36, 60, '#94a3b8')}</g>
            <g class="anim tja-c">${adasCar(36, 60, '#94a3b8')}</g>
            <g class="anim tja-ego">${adasCar(38, 66)}</g>
            <text class="tx" x="248" y="270">本车（拥堵跟随）</text>
            <style>
                .tja-a{offset-path:path("M240,24 L240,58");offset-rotate:auto 90deg;animation:tja 3.4s ease-in-out infinite}
                .tja-b{offset-path:path("M240,58 L240,92");offset-rotate:auto 90deg;animation:tja 3.4s ease-in-out .12s infinite}
                .tja-c{offset-path:path("M240,92 L240,126");offset-rotate:auto 90deg;animation:tja 3.4s ease-in-out .24s infinite}
                .tja-ego{offset-path:path("M240,210 L240,244");offset-rotate:auto 90deg;animation:tja 3.4s ease-in-out infinite}
                @keyframes tja{0%{offset-distance:0%}30%{offset-distance:100%}60%{offset-distance:100%}100%{offset-distance:0%}}
            </style>
        </svg>`;
        case 'noa': return `<svg viewBox="0 0 480 300">${common}
            <rect class="road" width="480" height="300"/>
            <line class="lane" x1="80" y1="0" x2="80" y2="300"/>
            <line class="lane" x1="240" y1="0" x2="240" y2="300"/>
            <line class="lane" x1="400" y1="0" x2="400" y2="300"/>
            <rect x="430" y="60" width="36" height="62" rx="6" fill="var(--scn-park)" stroke="#94a3b8" stroke-width="1.4"/>
            <text class="tx" x="18" y="26">NOA · 高速领航：自动变道 → 出匝道</text>
            <path class="pth" d="M140,260 C140,200 140,170 240,150 S330,90 330,50"/>
            <g class="anim noa-ego">${adasCar(38, 66)}</g>
            <style>
                .noa-ego{offset-path:path("M140,262 C140,200 150,170 240,148 S330,90 330,50");offset-rotate:auto 90deg;animation:noa 6s cubic-bezier(.4,.05,.6,1) infinite}
                @keyframes noa{0%{offset-distance:0%}100%{offset-distance:100%}}
            </style>
        </svg>`;
        case 'alc': return `<svg viewBox="0 0 480 300">${common}
            <rect class="road" width="480" height="300"/>
            <line class="lane" x1="120" y1="0" x2="120" y2="300"/>
            <line class="lane" x1="240" y1="0" x2="240" y2="300"/>
            <line class="lane" x1="360" y1="0" x2="360" y2="300"/>
            <g class="anim alc-p">${adasCar(36, 60, '#94a3b8')}</g>
            <path class="pth" d="M180,250 C180,180 230,170 280,150 C300,140 300,90 300,60"/>
            <g class="anim alc-ego">${adasCar(38, 66)}</g>
            <text class="tx" x="18" y="26">ALC · 主动变道超车（角雷达确认安全）</text>
            <style>
                .alc-p{offset-path:path("M180,40 L180,-40");offset-rotate:auto 90deg;animation:alcP 5.5s linear infinite}
                .alc-ego{offset-path:path("M180,252 C180,185 230,175 280,155 S300,90 300,52");offset-rotate:auto 90deg;animation:alcE 5.5s ease-in-out infinite}
                @keyframes alcP{0%{offset-distance:0%}100%{offset-distance:100%}}
                @keyframes alcE{0%{offset-distance:0%}100%{offset-distance:100%}}
            </style>
        </svg>`;
        case 'avm': return `<svg viewBox="0 0 480 300">${common}
            <rect class="pbg" width="480" height="300"/>
            <ellipse cx="240" cy="150" rx="165" ry="118" fill="var(--scn-park)" stroke="var(--scn-parkline)"/>
            <g class="anim" style="transform:translate(240px,150px)"><g>${adasCar(52, 92)}</g></g>
            <g class="avm-cam"><polygon points="150,150 206,104 206,196" fill="#00d4ff" opacity=".28"/></g>
            <g class="avm-cam2"><polygon points="330,150 274,104 274,196" fill="#00d4ff" opacity=".28"/></g>
            <g class="avm-cam3"><polygon points="240,40 190,86 290,86" fill="#00d4ff" opacity=".28"/></g>
            <g class="avm-cam4"><polygon points="240,260 190,214 290,214" fill="#00d4ff" opacity=".28"/></g>
            <text class="lbl" x="240" y="286" text-anchor="middle">AVM · 前/后保险杠 + 左右后视镜尖角 4 路鱼眼拼接 360°</text>
            <style>
                .avm-cam{animation:avmP 2.4s ease-in-out infinite}
                .avm-cam2{animation:avmP 2.4s ease-in-out .3s infinite}
                .avm-cam3{animation:avmP 2.4s ease-in-out .6s infinite}
                .avm-cam4{animation:avmP 2.4s ease-in-out .9s infinite}
                @keyframes avmP{0%,100%{opacity:.14}50%{opacity:.4}}
            </style>
        </svg>`;
        case 'apa': return `<svg viewBox="0 0 480 300">${common}
            <rect class="pbg" width="480" height="300"/>
            <rect class="park" x="340" y="40" width="46" height="72"/>
            <text class="lbl" x="363" y="130" text-anchor="middle">目标车位</text>
            <g class="anim apa-ego">${adasCar(34, 60)}</g>
            <path class="pth" d="M160,180 L240,180 Q280,180 300,160 L340,125 Q355,100 363,100 L363,82"/>
            <style>
                .apa-ego{offset-path:path("M160,180 L240,180 Q280,180 300,160 L340,125 Q355,100 363,100 L363,82");offset-rotate:auto 90deg;animation:apaE 5.5s ease-in-out infinite}
                @keyframes apaE{0%{offset-distance:0%}100%{offset-distance:100%}}
            </style>
        </svg>`;
        case 'rpa': return `<svg viewBox="0 0 480 300">${common}
            <rect class="pbg" width="480" height="300"/>
            <rect class="park" x="340" y="40" width="46" height="72"/>
            <g class="anim rpa-ego">${adasCar(34, 60)}</g>
            <circle cx="118" cy="252" r="16" fill="#fbbf24"/>
            <text class="tx" x="112" y="290" text-anchor="middle">驾驶员（车外手机遥控）</text>
            <path class="rpa-wave" d="M148,240 q9,-13 0,-26 M158,240 q13,-19 0,-38" fill="none" stroke="#00e5a0" stroke-width="2"/>
            <text class="lbl" x="363" y="130" text-anchor="middle">目标车位</text>
            <style>
                .rpa-ego{offset-path:path("M160,180 L240,180 Q280,180 300,160 L340,125 Q355,100 363,100 L363,82");offset-rotate:auto 90deg;animation:rpaE 5.5s ease-in-out infinite}
                .rpa-wave{animation:rpaW .9s ease-in-out infinite}
                @keyframes rpaE{0%{offset-distance:0%}100%{offset-distance:100%}}
                @keyframes rpaW{0%,100%{opacity:.2}50%{opacity:1}}
            </style>
        </svg>`;
        case 'avp': return `<svg viewBox="0 0 480 300">${common}
            <rect class="pbg" width="480" height="300"/>
            <g stroke="var(--scn-lane)" stroke-width="1" opacity=".5">
                <line x1="0" y1="90" x2="480" y2="90"/><line x1="0" y1="150" x2="480" y2="150"/>
                <line x1="0" y1="210" x2="480" y2="210"/>
            </g>
            <g fill="none" stroke="var(--scn-parkline)" stroke-width="1.4">
                <rect x="60" y="40" width="70" height="46"/><rect x="150" y="40" width="70" height="46"/><rect x="360" y="40" width="70" height="46"/>
                <rect x="60" y="94" width="70" height="46"/><rect x="360" y="94" width="70" height="46"/>
                <rect x="60" y="158" width="70" height="46"/><rect x="150" y="158" width="70" height="46"/>
            </g>
            <rect x="360" y="158" width="70" height="46" fill="rgba(0,229,160,.18)" stroke="#00e5a0" stroke-width="1.4"/>
            <text class="tx" x="395" y="216" text-anchor="middle">目标车位</text>
            <path class="pth" d="M90,272 L90,130 Q90,100 110,100 L280,100 Q300,100 300,120 L300,150 Q300,180 330,180 L360,180 Q380,180 395,190 L395,200"/>
            <g class="anim avp-ego">${adasCar(36, 62)}</g>
            <text class="lbl" x="18" y="26">AVP · 代客泊车：自主导航、转弯、泊入目标车位</text>
            <style>
                .avp-ego{offset-path:path("M90,272 L90,130 Q90,100 110,100 L280,100 Q300,100 300,120 L300,150 Q300,180 330,180 L360,180 Q380,180 395,190 L395,200");offset-rotate:auto 90deg;animation:avp 8s linear infinite}
                @keyframes avp{0%{offset-distance:0%}100%{offset-distance:100%}}
            </style>
        </svg>`;
        default: return '';
    }
}

/* ---------- 功能卡片 ---------- */
function adasFnCard(f) {
    const tags = f.sens.map(id => {
        const s = ADAS_SENSORS[id];
        if (!s) return '';
        const cc = ADAS_SENSOR_COLOR[s.type];
        return `<span class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium" style="color:${cc};border:1px solid ${cc}59;background:${cc}14" title="${ADAS_SENSOR_TYPE_CN[s.type]}">${s.ico} ${s.name}</span>`;
    }).join('');
    const scene = f.scene ? `
        <div class="adas-scene relative rounded-xl overflow-hidden mt-3" style="border:1px solid var(--border)">
            ${adasSceneSVG(f.scene)}
            <div class="absolute bottom-2 right-2 flex gap-1.5">
                <button class="scn-btn" data-adas-act="play" title="播放">▶</button>
                <button class="scn-btn" data-adas-act="pause" title="暂停">⏸</button>
                <button class="scn-btn" data-adas-act="reset" title="重播">⟲</button>
            </div>
        </div>` : `
        <div class="mt-3 rounded-xl px-3 py-2.5 text-[11px] text-slate-400 flex items-center gap-2" style="border:1px dashed var(--border)">
            <span>📋</span><span>预警 / 策略类功能，无运动学场景，以上方说明为准</span>
        </div>`;
    return `<div class="card p-4 sm:p-5 flex flex-col">
        <div class="flex items-baseline gap-2 flex-wrap">
            <span class="text-base sm:text-lg font-extrabold tracking-wide" style="color:${f.c}">${f.name}</span>
            <span class="text-[11px] text-slate-400">${f.en}</span>
        </div>
        <p class="text-xs sm:text-sm text-slate-300 mt-2 leading-relaxed">${f.desc}</p>
        ${scene}
        <div class="mt-auto pt-3">
            <div class="text-[10px] text-slate-500 mb-1.5 font-semibold tracking-wider">依赖传感器</div>
            <div class="flex flex-wrap gap-1.5">${tags}</div>
        </div>
    </div>`;
}

/* ---------- 入口 ---------- */
function renderAdasViz() {
    const content = document.getElementById('main-content');
    content.className = 'container mx-auto px-4 py-6 max-w-6xl fade-in';
    const drivingCount = ADAS_FUNCTIONS.driving.length;
    const parkingCount = ADAS_FUNCTIONS.parking.length;
    content.innerHTML = `
        <div class="fade-in">
            <button onclick="navigate('domain',{domain:'adas'})" class="text-cyan-400 hover:text-cyan-300 mb-4 flex items-center text-sm">← 返回智能驾驶域</button>

            <!-- 教学模拟声明 -->
            <div class="mb-4 rounded-xl border border-cyan-500/30 bg-cyan-500/5 px-4 py-2.5 text-[11px] sm:text-xs text-cyan-300/90 leading-relaxed flex items-start gap-2">
                <span class="text-cyan-400 font-bold flex-shrink-0">💡</span>
                <div><strong>教学演示 · 非真实控制器</strong> 本页 ${drivingCount + parkingCount} 项功能均为 SVG 动画示意，用于理解功能定义、场景行为与传感器配置，不连接真实车辆。<button onclick="event.stopPropagation();navigate('domain',{domain:'adas'})" class="underline decoration-cyan-400/50 underline-offset-2 hover:text-cyan-200 font-semibold">智驾市场格局资料 →</button></div>
            </div>

            <div class="gradient-bg rounded-3xl p-5 sm:p-8 mb-6 text-white relative overflow-hidden">
                <div class="absolute -top-20 -right-20 w-60 h-60 bg-cyan-400/10 rounded-full"></div>
                <div class="absolute -bottom-16 -left-16 w-52 h-52 bg-emerald-400/10 rounded-full"></div>
                <div class="relative z-10">
                    <div class="flex items-center gap-3 mb-2">
                        <div class="w-12 h-12 bg-white/20 backdrop-blur rounded-xl flex items-center justify-center text-2xl">🚘</div>
                        <div>
                            <h1 class="text-xl sm:text-2xl md:text-3xl font-bold">智驾可视化仪表盘</h1>
                            <p class="text-cyan-100 text-xs sm:text-sm mt-1">ACC 自适应巡航 · LKA/LCC 车道保持 · AEB 紧急制动 · NOA 领航 · APA/RPA/AVP 泊车</p>
                        </div>
                    </div>
                </div>
            </div>

            <!-- 行车功能组 -->
            <div class="flex items-center gap-2.5 mb-4">
                <span class="text-xl">🛣️</span>
                <h2 class="text-lg sm:text-xl font-bold text-white">行车功能</h2>
                <span class="badge">${drivingCount} 项</span>
                <span class="hidden sm:inline text-[11px] text-slate-500 ml-1">纵向 / 横向控制 · 预警 · 领航辅助</span>
            </div>
            <div class="grid md:grid-cols-2 gap-4 mb-8">
                ${ADAS_FUNCTIONS.driving.map(adasFnCard).join('')}
            </div>

            <!-- 泊车功能组 -->
            <div class="flex items-center gap-2.5 mb-4">
                <span class="text-xl">🅿️</span>
                <h2 class="text-lg sm:text-xl font-bold text-white">泊车功能</h2>
                <span class="badge">${parkingCount} 项</span>
                <span class="hidden sm:inline text-[11px] text-slate-500 ml-1">环视影像 · 自动泊入 · 代客泊车</span>
            </div>
            <div class="grid md:grid-cols-2 gap-4 mb-6">
                ${ADAS_FUNCTIONS.parking.map(adasFnCard).join('')}
            </div>

            <!-- 传感器图例 -->
            <div class="card p-4 sm:p-5 mb-6">
                <div class="text-sm font-bold text-white mb-3">🏷️ 传感器图例</div>
                <div class="flex flex-wrap gap-2">
                    ${Object.keys(ADAS_SENSOR_COLOR).map(t => `
                        <span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium" style="color:${ADAS_SENSOR_COLOR[t]};border:1px solid ${ADAS_SENSOR_COLOR[t]}59;background:${ADAS_SENSOR_COLOR[t]}14">
                            <span class="w-1.5 h-1.5 rounded-full" style="background:${ADAS_SENSOR_COLOR[t]}"></span>${ADAS_SENSOR_TYPE_CN[t]}
                        </span>`).join('')}
                </div>
            </div>

            <div class="text-center">
                <button onclick="navigate('domain',{domain:'adas'})" class="px-6 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-emerald-500 text-white font-semibold text-sm shadow-md hover:opacity-90 transition-all">查看智能驾驶市场格局 →</button>
            </div>
        </div>
    `;

    /* 场景播放控制（事件委托，只绑定一次） */
    if (!window.__adasSceneBound) {
        window.__adasSceneBound = true;
        document.addEventListener('click', function (e) {
            const btn = e.target.closest('[data-adas-act]');
            if (!btn) return;
            const sc = btn.closest('.adas-scene');
            if (!sc) return;
            const act = btn.getAttribute('data-adas-act');
            if (act === 'play') {
                sc.classList.remove('paused');
            } else if (act === 'pause') {
                sc.classList.add('paused');
            } else if (act === 'reset') {
                sc.classList.add('paused');
                const svg = sc.querySelector('svg');
                if (svg) svg.replaceWith(svg.cloneNode(true));
                setTimeout(function () { sc.classList.remove('paused'); }, 50);
            }
        });
    }
}
