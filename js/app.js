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

function init() {
    renderNavbar();
    renderFooter();
    navigate('home');
}

function renderNavbar() {
    const nav = document.getElementById('navbar');
    const navItems = [
        { page: 'home', label: '首页', icon: '🏠' },
        { page: 'courses', label: '课程', icon: '📚' },
        { page: 'canoe-simulator', label: 'CANoe模拟器', icon: '🖥️' },
        { page: 'adas-viz', label: '智驾可视化', icon: '🚘' },
        { page: 'resources', label: '学习推荐', icon: '🌟' },
        { page: 'knowledge', label: '知识库', icon: '💡' },
        { page: 'quiz', label: '考试', icon: '📝' },
        { page: 'profile', label: '我的', icon: '👤' }
    ];
    
    nav.innerHTML = `
        <div class="max-w-6xl mx-auto px-4">
            <div class="flex items-center justify-between h-16">
                <div class="flex items-center space-x-2 sm:space-x-3 cursor-pointer" onclick="navigate('home')">
                    <div class="w-9 h-9 sm:w-10 sm:h-10 bg-gradient-to-br from-cyan-400 to-emerald-500 rounded-xl flex items-center justify-center text-white text-base sm:text-xl font-bold shadow-lg flex-shrink-0">
                        🚗
                    </div>
                    <div class="overflow-hidden">
                        <div class="font-bold text-white text-base sm:text-lg whitespace-nowrap">九键车载</div>
                        <div class="text-[10px] sm:text-xs text-cyan-300 whitespace-nowrap">智驾 · 新能源</div>
                    </div>
                </div>
                <div class="hidden md:flex items-center space-x-1">
                    ${navItems.map(item => `
                        <button onclick="navigate('${item.page}')" 
                                class="nav-item px-4 py-2 rounded-lg text-sm font-medium transition-all ${state.currentPage === item.page ? 'bg-cyan-500/20 text-cyan-300' : 'text-slate-300 hover:bg-white/10 hover:text-white'}">
                            <span class="mr-1">${item.icon}</span>${item.label}
                        </button>
                    `).join('')}
                </div>
                <button onclick="toggleMobileMenu()" class="md:hidden p-2 rounded-lg hover:bg-white/10 text-slate-300">
                    <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"></path>
                    </svg>
                </button>
            </div>
            <div id="mobile-menu" class="hidden md:hidden pb-4 border-t border-slate-700">
                ${navItems.map(item => `
                    <button onclick="navigate('${item.page}')" 
                            class="block w-full text-left px-4 py-3 rounded-lg text-sm font-medium transition-all ${state.currentPage === item.page ? 'bg-cyan-500/20 text-cyan-300' : 'text-slate-300 hover:bg-white/10'}">
                        <span class="mr-2">${item.icon}</span>${item.label}
                    </button>
                `).join('')}
            </div>
        </div>
    `;
}

function toggleMobileMenu() {
    const menu = document.getElementById('mobile-menu');
    menu.classList.toggle('hidden');
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
                        <li>📚 课程中心</li>
                        <li>🎯 学习推荐</li>
                        <li>📝 模拟考试</li>
                        <li>💡 行业知识库</li>
                    </ul>
                </div>
                <div>
                    <h4 class="font-semibold mb-2 sm:mb-3 text-emerald-300 text-sm sm:text-base">官方链接</h4>
                    <ul class="text-slate-400 text-xs sm:text-sm space-y-1.5 sm:space-y-2">
                        <li><a href="https://www.vector.com/" target="_blank" class="hover:text-cyan-300 transition-colors">Vector 官网</a></li>
                        <li><a href="https://www.sae.org/" target="_blank" class="hover:text-cyan-300 transition-colors">SAE International</a></li>
                        <li><a href="https://www.iso.org/" target="_blank" class="hover:text-cyan-300 transition-colors">ISO 标准库</a></li>
                        <li><a href="https://www.autosar.org/" target="_blank" class="hover:text-cyan-300 transition-colors">AUTOSAR</a></li>
                    </ul>
                </div>
                <div>
                    <h4 class="font-semibold mb-2 sm:mb-3 text-emerald-300 text-sm sm:text-base">行业平台</h4>
                    <ul class="text-slate-400 text-xs sm:text-sm space-y-1.5 sm:space-y-2">
                        <li><a href="https://apollo.auto/" target="_blank" class="hover:text-emerald-300 transition-colors">Apollo 自动驾驶</a></li>
                        <li><a href="https://www.nvidia.com/en-us/autonomous-driving/" target="_blank" class="hover:text-emerald-300 transition-colors">NVIDIA DRIVE</a></li>
                        <li><a href="http://www.catarc.ac.cn/" target="_blank" class="hover:text-emerald-300 transition-colors">中汽研 CATARC</a></li>
                        <li><a href="https://www.c-ncap.org/" target="_blank" class="hover:text-emerald-300 transition-colors">C-NCAP</a></li>
                    </ul>
                </div>
            </div>
            <div class="border-t border-slate-700 mt-6 sm:mt-8 pt-4 sm:pt-6 text-center text-slate-500 text-xs sm:text-sm">
                © 2024 九键车载学习平台 · 让智能驾驶与新能源技术学习更专业
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
        case 'home': renderHome(); break;
        case 'courses': renderCourses(); break;
        case 'course-detail': renderCourseDetail(); break;
        case 'resources': renderResources(); break;
        case 'canoe-simulator': renderCanoeSimulator(); break;
        case 'adas-viz': renderAdasViz(); break;
        case 'quiz': renderQuizList(); break;
        case 'quiz-taking': renderQuizTaking(); break;
        case 'quiz-result': renderQuizResult(); break;
        case 'lesson': renderLessonPage(); break;
        case 'knowledge': renderKnowledge(); break;
        case 'profile': renderProfile(); break;
        default: renderHome();
    }
    
    document.getElementById('mobile-menu').classList.add('hidden');
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function renderHome() {
    const progressPercent = calculateOverallProgress();
    const recentCourses = COURSES.filter(c => (state.userData.courseProgress[c.id] || 0) > 0).slice(0, 3);
    const recommendedCourses = COURSES.slice(0, 4);
    
    document.getElementById('main-content').innerHTML = `
        <div class="slide-up">
            <div class="gradient-bg rounded-3xl p-4 sm:p-8 md:p-12 mb-6 sm:mb-8 text-white relative overflow-hidden">
                <div class="absolute top-0 right-0 w-64 h-64 bg-cyan-400/15 rounded-full -translate-y-1/2 translate-x-1/2"></div>
                <div class="absolute bottom-0 left-0 w-48 h-48 bg-emerald-400/15 rounded-full translate-y-1/2 -translate-x-1/2"></div>
                <div class="relative z-10">
                    <div class="text-4xl sm:text-5xl mb-3 sm:mb-4">🚗⚡</div>
                    <h1 class="text-xl sm:text-3xl md:text-4xl font-bold mb-2 sm:mb-3">欢迎来到九键车载学习平台, ${state.userData.name}!</h1>
                    <p class="text-cyan-100 text-sm sm:text-base mb-4 sm:mb-6 max-w-lg">聚焦智能驾驶 ADAS 与新能源三电测试，从 CAN 总线到 AUTOSAR，从 HIL 仿真到场景库验证，系统掌握下一代汽车电子技术。</p>
                    <div class="flex flex-wrap gap-2 sm:gap-4">
                        <button onclick="navigate('courses')" class="bg-white text-car-dark font-semibold py-2.5 sm:py-3 px-4 sm:px-6 rounded-xl hover:shadow-xl transition-all text-sm sm:text-base">
                            📚 开始学习
                        </button>
                        <button onclick="navigate('resources')" class="bg-gradient-to-r from-cyan-400 to-emerald-400 text-car-dark font-semibold py-2.5 sm:py-3 px-4 sm:px-6 rounded-xl hover:shadow-xl transition-all text-sm sm:text-base">
                            🌟 学习推荐
                        </button>
                    </div>
                </div>
            </div>
            
            <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                ${renderStatCard('📚', '已学课程', `${state.userData.stats.completedCourses}/${COURSES.length}`, 'bg-blue-50 text-blue-600')}
                ${renderStatCard('⏱️', '学习时长', `${state.userData.stats.totalStudyHours}h`, 'bg-green-50 text-green-600')}
                ${renderStatCard('✅', '通过考试', state.userData.stats.quizPassed, 'bg-purple-50 text-purple-600')}
                ${renderStatCard('🔥', '连续学习', `${state.userData.stats.streakDays}天`, 'bg-orange-50 text-orange-600')}
            </div>
            
            ${recentCourses.length > 0 ? `
                <div class="mb-8">
                    <h2 class="text-xl font-bold text-gray-800 mb-4 flex items-center">
                        <span class="w-1 h-6 bg-primary-500 rounded mr-3"></span>
                        继续学习
                    </h2>
                    <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                        ${recentCourses.map(c => renderContinueCard(c)).join('')}
                    </div>
                </div>
            ` : ''}
            
            <div class="mb-8">
                <div class="flex items-center justify-between mb-4">
                    <h2 class="text-xl font-bold text-gray-800 flex items-center">
                        <span class="w-1 h-6 bg-primary-500 rounded mr-3"></span>
                        推荐课程
                    </h2>
                    <button onclick="navigate('courses')" class="text-primary-600 text-sm font-medium hover:underline">
                        查看全部 →
                    </button>
                </div>
                <div class="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                    ${recommendedCourses.map(c => renderCourseCard(c)).join('')}
                </div>
            </div>
            
            <div class="bg-gradient-to-r from-cyan-500 to-emerald-500 rounded-2xl p-4 sm:p-6 text-white mb-6 sm:mb-8">
                <h3 class="text-base sm:text-lg font-bold mb-2">🚀 行业前沿</h3>
                <p class="text-xs sm:text-sm opacity-90 mb-3 sm:mb-4">智能驾驶 L2/L3 加速落地，新能源车渗透率已超 40%。车载测试工程师需求爆发式增长——CANoe 熟练、懂 AUTOSAR、会 ADAS 场景验证的工程师年薪可达 30-50 万。抓住窗口，从现在开始系统学习！</p>
                <div class="flex gap-2 flex-wrap">
                    <span class="badge bg-white/20 text-xs sm:text-sm">CANoe</span>
                    <span class="badge bg-white/20 text-xs sm:text-sm">AUTOSAR</span>
                    <span class="badge bg-white/20 text-xs sm:text-sm">ADAS 场景</span>
                    <span class="badge bg-white/20 text-xs sm:text-sm">新能源三电</span>
                    <span class="badge bg-white/20 text-xs sm:text-sm">HIL 仿真</span>
                    <span class="badge bg-white/20 text-xs sm:text-sm">SOA 架构</span>
                </div>
            </div>
        </div>
    `;
}

function renderStatCard(icon, label, value, bgClass) {
    return `
        <div class="stat-card">
            <div class="${bgClass} w-10 h-10 rounded-xl flex items-center justify-center text-xl mb-3">${icon}</div>
            <div class="text-2xl font-bold text-gray-800">${value}</div>
            <div class="text-sm text-gray-500 mt-1">${label}</div>
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
                <h3 class="font-semibold text-gray-800 mb-1 line-clamp-2">${course.title}</h3>
                <div class="flex items-center text-xs text-gray-500 mb-3">
                    <span class="mr-3">📖 ${course.lessons}课时</span>
                    <span>⏱️ ${course.duration}</span>
                </div>
                <div class="w-full bg-gray-100 rounded-full h-2">
                    <div class="bg-primary-500 h-2 rounded-full transition-all" style="width: ${progress}%"></div>
                </div>
                <div class="text-xs text-gray-500 mt-2">进度 ${progress}%</div>
            </div>
        </div>
    `;
}

function renderContinueCard(course) {
    const progress = state.userData.courseProgress[course.id] || 0;
    return `
        <div class="course-card border-2 border-primary-100" onclick="navigate('course-detail', {selectedCourseId: ${course.id}})">
            <div class="bg-gradient-to-r ${course.color} h-2"></div>
            <div class="p-5">
                <div class="flex items-center mb-2">
                    <span class="text-2xl mr-3">${course.icon}</span>
                    <div>
                        <h3 class="font-semibold text-gray-800">${course.title}</h3>
                        <span class="text-xs text-gray-500">${course.category}</span>
                    </div>
                </div>
                <div class="w-full bg-gray-100 rounded-full h-2 mb-2">
                    <div class="bg-primary-500 h-2 rounded-full transition-all" style="width: ${progress}%"></div>
                </div>
                <div class="flex justify-between items-center text-sm">
                    <span class="text-gray-500">已完成 ${progress}%</span>
                    <span class="text-primary-600 font-medium">继续 →</span>
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
            <h1 class="text-2xl md:text-3xl font-bold text-gray-800 mb-6">📚 课程中心</h1>
            
            <div class="bg-white rounded-2xl p-4 mb-6 shadow-sm">
                <div class="flex flex-col md:flex-row gap-4">
                    <div class="flex-1 relative">
                        <input type="text" id="course-search" placeholder="搜索课程..." 
                               class="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:border-primary-500"
                               oninput="filterCourses()">
                        <span class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">🔍</span>
                    </div>
                    <div class="flex gap-2 overflow-x-auto scrollbar-hide">
                        ${CATEGORIES.map(cat => `
                            <button onclick="setCategory('${cat}')" 
                                    class="category-btn px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${cat === currentCategory ? 'bg-primary-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}">
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
                btn.className = 'category-btn px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap bg-primary-600 text-white';
            } else {
                btn.className = 'category-btn px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap bg-gray-100 text-gray-600 hover:bg-gray-200';
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
        return `<div class="col-span-full text-center py-12 text-gray-500">
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
            <button onclick="navigate('courses')" class="text-primary-600 hover:underline mb-4 flex items-center text-sm">
                ← 返回课程列表
            </button>
            
            <div class="bg-white rounded-2xl overflow-hidden shadow-lg mb-6">
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
                
                <div class="p-6 border-b">
                    <div class="flex items-center justify-between mb-2">
                        <span class="text-sm text-gray-600">学习进度</span>
                        <span class="text-sm font-semibold text-primary-600">${progress}%</span>
                    </div>
                    <div class="w-full bg-gray-100 rounded-full h-3">
                        <div class="bg-gradient-to-r from-primary-500 to-primary-700 h-3 rounded-full transition-all" style="width: ${progress}%"></div>
                    </div>
                </div>
                
                <div class="p-6">
                    <h2 class="text-lg font-bold text-gray-800 mb-4">课程章节</h2>
                    <div class="space-y-4">
                        ${course.sections.map((section, si) => `
                            <div class="border border-gray-100 rounded-xl overflow-hidden">
                                <div class="bg-gray-50 px-5 py-3 flex items-center justify-between">
                                    <div class="flex items-center">
                                        <span class="w-8 h-8 bg-primary-100 text-primary-600 rounded-lg flex items-center justify-center font-semibold text-sm mr-3">${si + 1}</span>
                                        <span class="font-medium text-gray-800">${section.title}</span>
                                    </div>
                                    <span class="text-sm text-gray-500">${section.lessons.length}节课</span>
                                </div>
                                <div class="divide-y">
                                    ${section.lessons.map((lesson, li) => `
                                        <div class="px-5 py-3 flex items-center justify-between hover:bg-gray-50 cursor-pointer" onclick="startLesson(${course.id}, ${si}, ${li})">
                                            <div class="flex items-center">
                                                <span class="w-6 h-6 rounded-full border-2 border-gray-300 mr-3 flex items-center justify-center text-xs ${Math.round((si * 3 + li) * 100 / course.lessons) < progress ? 'bg-green-500 border-green-500 text-white' : ''}">
                                                    ${Math.round((si * 3 + li) * 100 / course.lessons) < progress ? '✓' : si * 3 + li + 1}
                                                </span>
                                                <span class="text-gray-700">${lesson}</span>
                                            </div>
                                            <span class="text-primary-500 text-sm">开始学习 →</span>
                                        </div>
                                    `).join('')}
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </div>
                
                <div class="p-6 bg-gray-50">
                    <h3 class="font-semibold text-gray-800 mb-3">🏷️ 课程标签</h3>
                    <div class="flex gap-2 flex-wrap">
                        ${course.tags.map(tag => `<span class="badge bg-primary-100 text-primary-700">${tag}</span>`).join('')}
                    </div>
                </div>
                
                <div class="p-6 border-t">
                    <h3 class="font-semibold text-gray-800 mb-3">📝 相关考试</h3>
                    ${QUIZZES.filter(q => q.courseId === course.id).map(q => `
                        <div class="flex items-center justify-between bg-primary-50 rounded-xl p-4">
                            <div>
                                <div class="font-medium text-gray-800">${q.title}</div>
                                <div class="text-sm text-gray-500">${q.questions.length}道题目</div>
                            </div>
                            <button onclick="startQuiz(${q.id})" class="btn-primary text-sm">开始考试</button>
                        </div>
                    `).join('') || '<p class="text-gray-500 text-sm">暂无相关考试</p>'}
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
            <h1 class="text-2xl md:text-3xl font-bold text-gray-800 mb-6">📝 考试中心</h1>
            
            <div class="bg-gradient-to-r from-car-blue to-car-accent rounded-2xl p-6 mb-6 text-white">
                <div class="flex items-center justify-between">
                    <div>
                        <h3 class="font-bold text-lg mb-1">模拟考试系统</h3>
                        <p class="text-sm text-blue-100">检验你的车载测试知识掌握程度</p>
                    </div>
                    <div class="text-5xl">🎯</div>
                </div>
                <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                    <div class="bg-white/10 backdrop-blur rounded-xl p-3 text-center">
                        <div class="text-xl font-bold">${QUIZZES.length}</div>
                        <div class="text-xs text-blue-100">套考试</div>
                    </div>
                    <div class="bg-white/10 backdrop-blur rounded-xl p-3 text-center">
                        <div class="text-xl font-bold">${QUIZZES.reduce((s,q)=>s+q.questions.length,0)}</div>
                        <div class="text-xs text-blue-100">道题目</div>
                    </div>
                    <div class="bg-white/10 backdrop-blur rounded-xl p-3 text-center">
                        <div class="text-xl font-bold">${state.userData.stats.quizPassed}</div>
                        <div class="text-xs text-blue-100">已通过</div>
                    </div>
                    <div class="bg-white/10 backdrop-blur rounded-xl p-3 text-center">
                        <div class="text-xl font-bold">${state.userData.quizHistory.length}</div>
                        <div class="text-xs text-blue-100">已参考</div>
                    </div>
                </div>
            </div>
            
            <div class="grid md:grid-cols-2 gap-4">
                ${QUIZZES.map(q => {
                    const course = COURSES.find(c => c.id === q.courseId);
                    const history = state.userData.quizHistory.find(h => h.quizId === q.id);
                    return `
                        <div class="bg-white rounded-2xl p-6 shadow-sm card-hover">
                            <div class="flex items-start justify-between mb-4">
                                <div class="flex items-center">
                                    <div class="w-12 h-12 rounded-xl bg-gradient-to-br ${course?.color || 'from-gray-400 to-gray-600'} flex items-center justify-center text-2xl mr-4">
                                        ${course?.icon || '📝'}
                                    </div>
                                    <div>
                                        <h3 class="font-bold text-gray-800">${q.title}</h3>
                                        <p class="text-sm text-gray-500">${course?.title || ''}</p>
                                    </div>
                                </div>
                                ${history ? (history.passed ? 
                                    '<span class="badge bg-green-100 text-green-700">✓ 已通过</span>' : 
                                    '<span class="badge bg-red-100 text-red-700">✗ 未通过</span>') : 
                                    '<span class="badge bg-gray-100 text-gray-600">新考试</span>'}
                            </div>
                            <div class="flex items-center justify-between">
                                <div class="text-sm text-gray-500">
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
            <div class="bg-white rounded-2xl shadow-lg overflow-hidden">
                <div class="bg-gradient-to-r from-primary-600 to-primary-700 p-6 text-white">
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
                        <span class="badge bg-primary-100 text-primary-700 mb-3">单选题</span>
                        <h3 class="text-xl font-semibold text-gray-800">${current.q}</h3>
                    </div>
                    
                    <div class="space-y-3">
                        ${current.options.map((opt, i) => `
                            <div class="quiz-option ${state.quizAnswers[state.quizCurrentIndex] === i ? 'selected' : ''}" 
                                 onclick="selectAnswer(${i})">
                                <div class="flex items-center">
                                    <span class="w-8 h-8 rounded-full border-2 mr-4 flex items-center justify-center font-semibold text-sm ${state.quizAnswers[state.quizCurrentIndex] === i ? 'border-primary-600 bg-primary-600 text-white' : 'border-gray-300 text-gray-500'}">
                                        ${String.fromCharCode(65 + i)}
                                    </span>
                                    <span class="text-gray-700">${opt}</span>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                    
                    <div class="mt-6 pt-4 border-t">
                        <div class="flex flex-wrap gap-1.5 sm:gap-2 mb-4">
                            ${quiz.questions.map((_, i) => `
                                <button onclick="jumpToQuestion(${i})" 
                                        class="w-8 h-8 sm:w-10 sm:h-10 rounded-lg text-xs sm:text-sm font-medium transition-all ${
                                            i === state.quizCurrentIndex ? 'bg-cyan-500 text-white' : 
                                            state.quizAnswers[i] !== -1 ? 'bg-green-100 text-green-700' : 
                                            'bg-gray-100 text-gray-600 hover:bg-gray-200'
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
                                `<button onclick="submitQuiz()" class="bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-6 rounded-lg transition-all shadow-md">提交考试 ✅</button>` :
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
    
    const scoreColor = r.score >= 90 ? 'text-green-500' : r.score >= 60 ? 'text-primary-500' : 'text-red-500';
    const scoreEmoji = r.score >= 90 ? '🏆' : r.score >= 60 ? '🎉' : '💪';
    const bgGradient = r.score >= 60 ? 'from-green-500 to-emerald-600' : 'from-red-500 to-rose-600';
    
    document.getElementById('main-content').innerHTML = `
        <div class="fade-in max-w-3xl mx-auto">
            <div class="bg-white rounded-2xl shadow-lg overflow-hidden">
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
                    <h3 class="font-bold text-gray-800 mb-4">📋 答题详情</h3>
                    <div class="space-y-4">
                        ${r.results.map((item, i) => `
                            <div class="border rounded-xl p-4 ${item.isCorrect ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}">
                                <div class="flex items-start mb-3">
                                    <span class="w-7 h-7 rounded-full ${item.isCorrect ? 'bg-green-500' : 'bg-red-500'} text-white flex items-center justify-center text-sm mr-3 flex-shrink-0">
                                        ${item.isCorrect ? '✓' : '✗'}
                                    </span>
                                    <div class="flex-1">
                                        <div class="font-medium text-gray-800 mb-2">${i + 1}. ${item.question}</div>
                                        <div class="space-y-1 text-sm">
                                            ${item.options.map((opt, oi) => {
                                                let optClass = 'text-gray-600';
                                                let prefix = '';
                                                if (oi === item.correctAnswer) {
                                                    optClass = 'text-green-700 font-medium';
                                                    prefix = '✓ ';
                                                }
                                                if (oi === item.userAnswer && oi !== item.correctAnswer) {
                                                    optClass = 'text-red-700 font-medium';
                                                    prefix = '✗ ';
                                                }
                                                return `<div class="${optClass}">${prefix}${String.fromCharCode(65 + oi)}. ${opt}</div>`;
                                            }).join('')}
                                        </div>
                                        ${item.explain ? `<div class="mt-3 bg-white rounded-lg p-3 text-sm text-gray-600 border-l-4 border-primary-400">
                                            <span class="font-semibold text-primary-600">💡 解析: </span>${item.explain}
                                        </div>` : ''}
                                    </div>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </div>
                
                <div class="p-6 bg-gray-50 border-t flex justify-center gap-4">
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
            <h1 class="text-2xl md:text-3xl font-bold text-gray-800 mb-6">💡 知识库</h1>
            <p class="text-gray-500 mb-6">精选车载测试专业知识，随时查阅学习</p>
            
            <div class="flex gap-2 overflow-x-auto scrollbar-hide mb-6 pb-2">
                ${['全部', ...new Set(KNOWLEDGE_BASE.map(k => k.category))].map(cat => `
                    <button onclick="setKBCategory('${cat}')" 
                            class="kb-cat-btn px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${cat === currentCategory ? 'bg-primary-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'}">
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
                btn.className = 'kb-cat-btn px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap bg-primary-600 text-white';
            } else {
                btn.className = 'kb-cat-btn px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap bg-white text-gray-600 hover:bg-gray-100 border border-gray-200';
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
                    <span class="badge bg-primary-100 text-primary-700 mb-2">${item.category}</span>
                    <h3 class="font-bold text-gray-800 text-lg">${item.title}</h3>
                </div>
                <span class="text-2xl transition-transform ${expandedId === item.id ? 'rotate-180' : ''}">▾</span>
            </div>
            <div class="overflow-hidden transition-all duration-300" style="max-height: ${expandedId === item.id ? '1000px' : '0'}">
                <div class="mt-4 pt-4 border-t border-gray-100 whitespace-pre-wrap text-gray-700 text-sm leading-relaxed">
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
            <div class="bg-white rounded-2xl shadow-lg overflow-hidden mb-6">
                <div class="gradient-bg p-8 text-white relative">
                    <div class="flex items-center">
                        <div class="w-20 h-20 bg-white/20 backdrop-blur rounded-full flex items-center justify-center text-4xl mr-6">
                            ${userData.avatar}
                        </div>
                        <div>
                            <h1 class="text-2xl font-bold">${userData.name}</h1>
                            <div class="flex items-center gap-2 mt-2">
                                <span class="badge bg-car-highlight">${userData.level}</span>
                                <span class="text-sm text-blue-200">加入于 ${userData.joinDate}</span>
                            </div>
                        </div>
                    </div>
                </div>
                
                <div class="p-6 grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div class="text-center">
                        <div class="text-3xl font-bold text-primary-600">${progressPercent}%</div>
                        <div class="text-sm text-gray-500 mt-1">总体进度</div>
                    </div>
                    <div class="text-center">
                        <div class="text-3xl font-bold text-green-600">${userData.stats.completedCourses}</div>
                        <div class="text-sm text-gray-500 mt-1">完成课程</div>
                    </div>
                    <div class="text-center">
                        <div class="text-3xl font-bold text-purple-600">${userData.stats.quizPassed}</div>
                        <div class="text-sm text-gray-500 mt-1">通过考试</div>
                    </div>
                    <div class="text-center">
                        <div class="text-3xl font-bold text-orange-500">${userData.stats.streakDays}</div>
                        <div class="text-sm text-gray-500 mt-1">连续天数</div>
                    </div>
                </div>
            </div>
            
            <div class="grid md:grid-cols-2 gap-6">
                <div class="bg-white rounded-2xl shadow-sm p-6">
                    <h2 class="font-bold text-gray-800 mb-4 flex items-center">
                        <span class="w-1 h-6 bg-primary-500 rounded mr-3"></span>
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
                                            <span class="text-sm font-medium text-gray-700">${c.title}</span>
                                        </div>
                                        <span class="text-xs text-gray-500">${p}%</span>
                                    </div>
                                    <div class="w-full bg-gray-100 rounded-full h-2">
                                        <div class="bg-gradient-to-r ${c.color} h-2 rounded-full" style="width: ${p}%"></div>
                                    </div>
                                </div>
                            `;
                        }).join('') || '<p class="text-gray-500 text-sm text-center py-4">还没有开始任何课程</p>'}
                    </div>
                </div>
                
                <div class="bg-white rounded-2xl shadow-sm p-6">
                    <h2 class="font-bold text-gray-800 mb-4 flex items-center">
                        <span class="w-1 h-6 bg-primary-500 rounded mr-3"></span>
                        考试历史
                    </h2>
                    <div class="space-y-3">
                        ${userData.quizHistory.length > 0 ? userData.quizHistory.map(h => `
                            <div class="flex items-center justify-between py-2 border-b last:border-0">
                                <div>
                                    <div class="font-medium text-sm text-gray-700">${h.quizTitle}</div>
                                    <div class="text-xs text-gray-500">${h.date}</div>
                                </div>
                                <div class="text-right">
                                    <div class="font-bold ${h.passed ? 'text-green-600' : 'text-red-600'}">${h.score}分</div>
                                    <div class="text-xs ${h.passed ? 'text-green-500' : 'text-red-500'}">${h.passed ? '通过' : '未通过'}</div>
                                </div>
                            </div>
                        `).join('') : '<p class="text-gray-500 text-sm text-center py-4">暂无考试记录</p>'}
                    </div>
                </div>
            </div>
            
            <div class="mt-6 bg-white rounded-2xl shadow-sm p-6">
                <h2 class="font-bold text-gray-800 mb-4 flex items-center">
                    <span class="w-1 h-6 bg-primary-500 rounded mr-3"></span>
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
                        <div class="text-center p-4 rounded-xl ${b.cond ? 'bg-gradient-to-br from-yellow-50 to-orange-50 border border-yellow-200' : 'bg-gray-50 opacity-40'}">
                            <div class="text-3xl mb-2">${b.icon}</div>
                            <div class="text-xs font-medium text-gray-700">${b.name}</div>
                            ${b.cond ? '<div class="text-xs text-green-600 mt-1">✓ 已获得</div>' : '<div class="text-xs text-gray-400 mt-1">未解锁</div>'}
                        </div>
                    `).join('')}
                </div>
            </div>
            
            <div class="mt-6 flex justify-center">
                <button onclick="resetData()" class="text-red-500 text-sm hover:underline">🔄 重置学习数据</button>
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
    html = html.replace(/## (.+)/g, '<h2 class="text-2xl font-bold text-gray-800 mt-8 mb-4 pb-2 border-b-2 border-primary-100">$1</h2>');
    html = html.replace(/### (.+)/g, '<h3 class="text-xl font-semibold text-gray-700 mt-6 mb-3">$1</h3>');
    html = html.replace(/\*\*(.+?)\*\*/g, '<strong class="text-primary-700">$1</strong>');
    html = html.replace(/`([^`]+)`/g, '<code class="bg-gray-100 text-red-600 px-2 py-0.5 rounded text-sm font-mono">$1</code>');
    
    const tableRegex = /(\|.+\|\n)+/g;
    html = html.replace(tableRegex, match => {
        const lines = match.trim().split('\n');
        let isNew = true;
        let tbody = '';
        lines.forEach(line => {
            if (line.includes('---')) return;
            const cells = line.split('|').filter(c => c.trim() !== '');
            if (isNew) {
                isNew = false;
                return `<div class="overflow-x-auto my-4"><table class="w-full text-sm border-collapse bg-white rounded-lg overflow-hidden shadow-sm">
                    <thead class="bg-primary-50">
                        <tr>${cells.map(c => `<th class="px-4 py-3 text-left font-semibold text-primary-700 border border-gray-200">${c.trim()}</th>`).join('')}</tr>
                    </thead><tbody>`;
            } else {
                tbody += `<tr class="hover:bg-gray-50">${cells.map(c => `<td class="px-4 py-3 border border-gray-200 text-gray-700">${c.trim()}</td>`).join('')}</tr>`;
            }
        });
        return tbody + '</tbody></table></div>';
    });
    
    html = html.replace(/```[\s\S]*?```/g, match => {
        const code = match.replace(/```\w*\n?|```/g, '');
        return `<pre class="bg-gray-900 text-green-400 p-4 rounded-lg overflow-x-auto my-4 text-sm font-mono leading-relaxed shadow-inner">${code.trim()}</pre>`;
    });
    
    html = html.replace(/^- (.+)$/gm, '<li class="ml-6 list-disc text-gray-700">$1</li>');
    html = html.replace(/^(\d+)\. (.+)$/gm, '<li class="ml-6 list-decimal text-gray-700">$2</li>');
    
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
            <button onclick="navigate('course-detail', {selectedCourseId: ${course.id}})" class="text-primary-600 hover:underline mb-4 flex items-center text-sm">
                ← 返回课程详情
            </button>
            
            <div class="grid lg:grid-cols-4 gap-6">
                <div class="lg:col-span-1 order-2 lg:order-1">
                    <div class="bg-white rounded-2xl shadow-sm sticky top-24 overflow-hidden">
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
                                    <div class="border-b last:border-b-0">
                                        <div class="px-4 py-3 flex items-center justify-between bg-gray-50 hover:bg-gray-100 cursor-pointer transition-colors" onclick="toggleLessonSection(${si})">
                                            <div class="flex items-center">
                                                <span class="w-6 h-6 bg-primary-100 text-primary-600 rounded flex items-center justify-center text-xs font-semibold mr-2">${si + 1}</span>
                                                <span class="font-medium text-sm text-gray-800">${section.title}</span>
                                            </div>
                                            <span class="text-gray-400 text-xs transition-transform ${expanded ? 'rotate-180' : ''}">▾</span>
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
                                                             class="px-4 py-2.5 flex items-center text-sm transition-all cursor-pointer ${isActive ? 'bg-primary-50 text-primary-700 border-l-4 border-primary-500 font-medium' : 'text-gray-600 hover:bg-gray-50'} ${!hasContent ? 'opacity-40 cursor-not-allowed' : ''}">
                                                            <span class="w-5 h-5 rounded-full mr-2 flex items-center justify-center text-xs ${
                                                                lessonDone ? 'bg-green-500 text-white' : 
                                                                isActive ? 'bg-primary-500 text-white' : 
                                                                'bg-gray-200 text-gray-500'
                                                            }">${lessonDone ? '✓' : lessonFlatIdx + 1}</span>
                                                            <span class="flex-1 truncate">${lesson}</span>
                                                            ${!hasContent ? '<span class="text-xs text-gray-400">🔒</span>' : ''}
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
                    <div class="bg-white rounded-2xl shadow-lg overflow-hidden">
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
                            
                            <div class="p-6 md:p-8 leading-relaxed">
                                ${parseContentToHTML(content.content)}
                                
                                ${content.keyPoints && content.keyPoints.length > 0 ? `
                                    <div class="mt-8 p-5 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border-l-4 border-primary-500">
                                        <h4 class="font-bold text-primary-800 mb-3 flex items-center">
                                            <span class="mr-2">📌</span> 本节重点
                                        </h4>
                                        <ul class="space-y-2">
                                            ${content.keyPoints.map(kp => `
                                                <li class="flex items-start text-gray-700">
                                                    <span class="w-2 h-2 bg-primary-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                                                    <span>${kp}</span>
                                                </li>
                                            `).join('')}
                                        </ul>
                                    </div>
                                ` : ''}
                                
                                ${content.quizCheck ? `
                                    <div class="mt-6 p-5 bg-gradient-to-r from-orange-50 to-amber-50 rounded-xl border-l-4 border-orange-500">
                                        <h4 class="font-bold text-orange-800 mb-2 flex items-center">
                                            <span class="mr-2">🤔</span> 思考一下
                                        </h4>
                                        <p class="text-gray-700">${content.quizCheck}</p>
                                    </div>
                                ` : ''}
                            </div>
                        ` : `
                            <div class="p-12 text-center">
                                <div class="text-6xl mb-4">🔒</div>
                                <h3 class="text-xl font-bold text-gray-800 mb-2">该课程内容即将上线</h3>
                                <p class="text-gray-500">当前课时「${course.sections[sectionIndex].lessons[lessonIndex]}」的详细内容正在整理中，请先学习其他已有内容的课时。</p>
                            </div>
                        `}
                        
                        <div class="border-t bg-gray-50 p-6 flex flex-wrap items-center justify-between gap-4">
                            <div class="flex gap-3">
                                ${prevLesson ? `
                                    <button onclick="goToLesson(${prevLesson.sectionIndex}, ${prevLesson.lessonIndex})" class="btn-secondary text-sm">← 上一课</button>
                                ` : '<div class="text-sm text-gray-400">已到第一课</div>'}
                            </div>
                            
                            <button onclick="markLessonComplete()" class="btn-primary text-sm flex items-center gap-2">
                                ${nextLesson ? '标记完成并继续 →' : '✓ 标记完成'}
                            </button>
                            
                            <div class="flex gap-3">
                                ${nextLesson ? `
                                    <button onclick="goToLesson(${nextLesson.sectionIndex}, ${nextLesson.lessonIndex})" class="btn-secondary text-sm">下一课 →</button>
                                ` : '<div class="text-sm text-green-600 font-medium">🎉 已到最后一课</div>'}
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

            <div class="bg-white rounded-2xl p-2 mb-6 shadow-sm flex flex-col sm:flex-row gap-2 sm:gap-2">
                <button onclick="setTab('platforms')" id="tab-platforms" class="tab-btn flex-1 py-3 px-3 sm:px-4 rounded-xl font-semibold transition-all bg-gradient-to-r from-cyan-500 to-emerald-500 text-white shadow-md text-sm sm:text-base">
                    🔗 官方平台与标准
                </button>
                <button onclick="setTab('methods')" id="tab-methods" class="tab-btn flex-1 py-3 px-3 sm:px-4 rounded-xl font-semibold transition-all text-slate-600 hover:bg-slate-100 text-sm sm:text-base">
                    🎯 学习方法与路径
                </button>
            </div>

            <div id="resources-content"></div>
        </div>
    `;
    
    window.setTab = function(tab) {
        currentTab = tab;
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.className = 'tab-btn flex-1 py-3 px-4 rounded-xl font-semibold transition-all text-slate-600 hover:bg-slate-100';
        });
        document.getElementById('tab-' + tab).className = 'tab-btn flex-1 py-3 px-4 rounded-xl font-semibold transition-all bg-gradient-to-r from-cyan-500 to-emerald-500 text-white shadow-md';
        document.getElementById('resources-content').innerHTML = tab === 'platforms' ? renderPlatforms() : renderMethods();
    };
    
    document.getElementById('resources-content').innerHTML = renderPlatforms();
}

function renderPlatforms() {
    return RESOURCES.map(category => `
        <div class="resource-section rounded-2xl p-4 sm:p-6 mb-6">
            <div class="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-5">
                <span class="text-2xl sm:text-3xl">${category.icon}</span>
                <h2 class="text-lg sm:text-xl font-bold text-slate-800">${category.category}</h2>
                <span class="badge bg-cyan-100 text-cyan-700 text-xs">${category.items.length} 项</span>
            </div>
            <div class="grid md:grid-cols-2 gap-2 sm:gap-3">
                ${category.items.map(item => `
                    <a href="${item.url}" target="_blank" rel="noopener noreferrer" 
                       class="link-card group !p-3 sm:!p-4">
                        <div class="w-9 h-9 sm:w-10 sm:h-10 bg-gradient-to-br from-cyan-100 to-emerald-100 rounded-xl flex items-center justify-center text-base sm:text-lg flex-shrink-0 group-hover:from-cyan-200 group-hover:to-emerald-200 transition-all">
                            🔗
                        </div>
                        <div class="flex-1 min-w-0">
                            <h3 class="font-semibold text-slate-800 text-sm group-hover:text-cyan-600 transition-colors truncate">${item.name}</h3>
                            <p class="text-xs text-slate-500 mt-0.5 truncate">${item.desc}</p>
                        </div>
                        <span class="text-cyan-500 opacity-0 group-hover:opacity-100 transition-opacity text-xl flex-shrink-0">→</span>
                    </a>
                `).join('')}
            </div>
        </div>
    `).join('');
}

function renderMethods() {
    return `
        <div class="resource-section rounded-2xl p-4 sm:p-6 mb-6">
            <div class="mb-3 sm:mb-4">
                <h2 class="text-lg sm:text-xl font-bold text-slate-800">🎯 学习路径总览</h2>
                <p class="text-xs sm:text-sm text-slate-500 mt-1">六步法打造专业车载工程师</p>
            </div>
            <div class="grid grid-cols-3 sm:grid-cols-6 gap-2">
                ${['理论筑基','工具实战','项目驱动','专项深耕','社区交流','证书加持'].map((s,i) => `
                    <div class="text-center">
                        <div class="w-12 h-12 mx-auto sm:w-full sm:h-auto sm:aspect-square rounded-full ${i < 3 ? 'bg-gradient-to-br from-cyan-400 to-cyan-500' : i < 5 ? 'bg-gradient-to-br from-emerald-400 to-emerald-500' : 'bg-gradient-to-br from-violet-400 to-violet-500'} flex items-center justify-center text-white font-bold shadow-md text-sm">
                            ${i+1}
                        </div>
                        <div class="text-xs text-slate-600 mt-1 sm:mt-2 font-medium leading-tight">${s}</div>
                    </div>
                `).join('')}
            </div>
        </div>
        ${LEARNING_METHODS.map((m, i) => `
            <div class="bg-white rounded-2xl p-4 sm:p-6 mb-4 shadow-sm border border-slate-100 card-hover">
                <div class="flex flex-col sm:flex-row items-start gap-3 sm:gap-4">
                    <div class="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-br ${i < 3 ? 'from-cyan-400 to-cyan-600' : 'from-emerald-400 to-emerald-600'} flex items-center justify-center text-white font-bold shadow-md flex-shrink-0">
                        ${i + 1}
                    </div>
                    <div class="flex-1 min-w-0">
                        <h3 class="text-base sm:text-lg font-bold text-slate-800 mb-1 sm:mb-2">${m.title}</h3>
                        <p class="text-slate-600 leading-relaxed text-sm mb-2 sm:mb-3">${m.desc}</p>
                        <div class="flex flex-wrap gap-1.5 sm:gap-2">
                            ${m.tips.map(t => `<span class="badge bg-slate-100 text-slate-700 text-xs">✓ ${t}</span>`).join('')}
                        </div>
                    </div>
                </div>
            </div>
        `).join('')}
        <div class="bg-gradient-to-r from-cyan-500 to-emerald-500 rounded-2xl p-4 sm:p-6 text-white">
            <h3 class="font-bold text-base sm:text-lg mb-2 sm:mb-3">💡 学习建议</h3>
            <p class="text-sm opacity-90 leading-relaxed">车载行业正在经历前所未有的变革——智能驾驶从 L2 向 L4 演进，新能源汽车渗透率持续攀升。抓住这个窗口期，系统学习协议标准 + 熟练工具链 + 参与真实项目，3 年内成为领域专家。九键车载学习平台的课程体系正是按照这个路径设计的，从 CAN 基础到 ADAS 测试，一步步带你成长。</p>
        </div>
    `;
}
