
        tailwind.config = {
            darkMode: 'class',
            theme: {
                extend: {
                    fontFamily: {
                        sans: ['Inter', 'sans-serif'],
                        sinhala: ['Noto Sans Sinhala', 'Inter', 'sans-serif'],
                    },
                    colors: {
                        brand: {
                            50: '#eef2ff',
                            100: '#e0e7ff',
                            500: '#6366f1',
                            600: '#4f46e5',
                            700: '#4338ca',
                            900: '#312e81',
                        }
                    }
                }
            }
        }
    

        let quizzes = JSON.parse(localStorage.getItem('proquiz_quizzes')) || [];
        let books = JSON.parse(localStorage.getItem('proquiz_books')) || [];
        let studentHistory = [];

        let currentQuiz = null;
        let currentQuestionIndex = 0;
        let userAnswers = [];
        let score = 0;
        let timerInterval = null;
        let timeLeft = 0;
        let quizStartTime = 0;

        let tempQuestions = [];
        let editingQuizId = null;
        let lineChartInstance = null;
        let barChartInstance = null;

        function checkAuthSession() {
            let session = localStorage.getItem('proquiz_logged_in');
            if (session !== 'true') {
                document.getElementById('auth-container').classList.remove('hidden');
                switchAuthTab('login');
            } else {
                document.getElementById('auth-container').classList.add('hidden');
                loadStudentHistory();
                updateNavUserInfo();
                applyAdminAccessControl();
            }
        }

        // Admin check function
        function checkIsAdmin() {
            let userEmail = localStorage.getItem('proquiz_user_email') || '';
            let userPass = localStorage.getItem('proquiz_user_pass') || '';
            return userEmail.trim().toLowerCase() === 'nadunprabasha95@gmail.com' && (userPass === '25017' || localStorage.getItem('proquiz_is_admin') === 'true');
        }

        function applyAdminAccessControl() {
            let adminNav = document.getElementById('nav-admin');
            let createQuizBtn = document.getElementById('nav-create-quiz-btn');
            
            if (checkIsAdmin()) {
                if (adminNav) adminNav.classList.remove('hidden');
                if (adminNav) adminNav.classList.add('flex');
                if (createQuizBtn) createQuizBtn.classList.remove('hidden');
                if (createQuizBtn) createQuizBtn.classList.add('flex');
            } else {
                if (adminNav) adminNav.classList.add('hidden');
                if (adminNav) adminNav.classList.remove('flex');
                if (createQuizBtn) createQuizBtn.classList.add('hidden');
                if (createQuizBtn) createQuizBtn.classList.remove('flex');
            }
        }

        function loadStudentHistory() {
            let userEmail = localStorage.getItem('proquiz_user_email') || 'default_student';
            studentHistory = JSON.parse(localStorage.getItem('proquiz_student_history_' + userEmail)) || [];
        }

        function updateNavUserInfo() {
            let userName = localStorage.getItem('proquiz_user_name') || 'Student User';
            let userEmail = localStorage.getItem('proquiz_user_email') || 'student@example.com';
            
            document.getElementById('sidebar-user-name').innerText = userName;
            document.getElementById('sidebar-user-email').innerText = userEmail;
            document.getElementById('sidebar-user-avatar').innerText = userName.charAt(0).toUpperCase();
        }

        function toggleMobileMenu() {
            let dropdown = document.getElementById('mobile-nav-dropdown');
            if (dropdown.classList.contains('hidden')) {
                dropdown.classList.remove('hidden');
            } else {
                dropdown.classList.add('hidden');
            }
        }

        function switchAuthTab(tab) {
            document.getElementById('form-login').classList.add('hidden');
            document.getElementById('form-signup').classList.add('hidden');

            if (tab === 'login') {
                document.getElementById('form-login').classList.remove('hidden');
            } else if (tab === 'signup') {
                document.getElementById('form-signup').classList.remove('hidden');
            }
        }

        function submitLogin() {
            let email = document.getElementById('login-email').value.trim();
            let pass = document.getElementById('login-password').value.trim();
            if (!email || !pass) {
                alert("Please fill in email and password.");
                return;
            }

            let namePart = email.split('@')[0];
            let formattedName = namePart.charAt(0).toUpperCase() + namePart.slice(1);

            localStorage.setItem('proquiz_logged_in', 'true');
            localStorage.setItem('proquiz_user_email', email);
            localStorage.setItem('proquiz_user_pass', pass);
            localStorage.setItem('proquiz_user_name', formattedName);

            if (email.toLowerCase() === 'nadunprabasha95@gmail.com' && pass === '25017') {
                localStorage.setItem('proquiz_is_admin', 'true');
            } else {
                localStorage.setItem('proquiz_is_admin', 'false');
            }

            document.getElementById('auth-container').classList.add('hidden');
            loadStudentHistory();
            updateNavUserInfo();
            applyAdminAccessControl();
            updateDashboardCounts();
        }

        function submitSignup() {
            let name = document.getElementById('signup-name').value.trim();
            let email = document.getElementById('signup-email').value.trim();
            let pass = document.getElementById('signup-password').value.trim();
            if (!name || !email || !pass) {
                alert("Please fill in all signup fields.");
                return;
            }
            localStorage.setItem('proquiz_user_name', name);
            localStorage.setItem('proquiz_user_email', email);
            localStorage.setItem('proquiz_user_pass', pass);
            localStorage.setItem('proquiz_logged_in', 'true');

            if (email.toLowerCase() === 'nadunprabasha95@gmail.com' && pass === '25017') {
                localStorage.setItem('proquiz_is_admin', 'true');
            } else {
                localStorage.setItem('proquiz_is_admin', 'false');
            }

            alert("Account created and logged in successfully!");
            document.getElementById('auth-container').classList.add('hidden');
            loadStudentHistory();
            updateNavUserInfo();
            applyAdminAccessControl();
            updateDashboardCounts();
        }

        function handleGoogleAuth() {
            localStorage.setItem('proquiz_logged_in', 'true');
            localStorage.setItem('proquiz_user_name', 'Google User');
            localStorage.setItem('proquiz_user_email', 'google_user@gmail.com');
            localStorage.setItem('proquiz_is_admin', 'false');
            alert("Google Sign-In successful!");
            document.getElementById('auth-container').classList.add('hidden');
            loadStudentHistory();
            updateNavUserInfo();
            applyAdminAccessControl();
            updateDashboardCounts();
        }

        function handleLogout() {
            localStorage.removeItem('proquiz_logged_in');
            localStorage.removeItem('proquiz_user_name');
            localStorage.removeItem('proquiz_user_email');
            localStorage.removeItem('proquiz_user_pass');
            localStorage.removeItem('proquiz_is_admin');
            checkAuthSession();
        }

        function toggleTheme() {
            if (document.documentElement.classList.contains('dark')) {
                document.documentElement.classList.remove('dark');
                localStorage.setItem('proquiz_theme', 'light');
                document.getElementById('theme-icon').className = 'fa-solid fa-moon';
            } else {
                document.documentElement.classList.add('dark');
                localStorage.setItem('proquiz_theme', 'dark');
                document.getElementById('theme-icon').className = 'fa-solid fa-sun';
            }
        }

        function insertToolbarSymbol(symbol) {
            const textarea = document.getElementById('q-explanation');
            const start = textarea.selectionStart;
            const end = textarea.selectionEnd;
            const text = textarea.value;
            textarea.value = text.substring(0, start) + symbol + text.substring(end);
            textarea.focus();
            textarea.selectionStart = textarea.selectionEnd = start + symbol.length;
        }

        function setExpTextColor(color) {
            const textarea = document.getElementById('q-explanation');
            textarea.style.color = color;
        }

        function switchAdminTab(tab) {
            if (tab === 'quiz') {
                document.getElementById('admin-form-quiz').classList.remove('hidden');
                document.getElementById('admin-form-book').classList.add('hidden');
                document.getElementById('admin-tab-quiz').className = 'px-4 py-2 font-bold text-sm bg-brand-600 text-white rounded-xl shadow';
                document.getElementById('admin-tab-book').className = 'px-4 py-2 font-bold text-sm bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl';
            } else {
                document.getElementById('admin-form-quiz').classList.add('hidden');
                document.getElementById('admin-form-book').classList.remove('hidden');
                document.getElementById('admin-tab-quiz').className = 'px-4 py-2 font-bold text-sm bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl';
                document.getElementById('admin-tab-book').className = 'px-4 py-2 font-bold text-sm bg-brand-600 text-white rounded-xl shadow';
            }
        }

        function switchView(viewName) {
            if ((viewName === 'admin') && !checkIsAdmin()) {
                alert("Access Denied! Only Admin can access this section.");
                return;
            }

            document.getElementById('view-dashboard').classList.add('hidden');
            document.getElementById('view-library').classList.add('hidden');
            document.getElementById('view-store').classList.add('hidden');
            document.getElementById('view-progress').classList.add('hidden');
            document.getElementById('view-player').classList.add('hidden');
            document.getElementById('view-result').classList.add('hidden');
            document.getElementById('view-admin').classList.add('hidden');

            if (viewName !== 'player') {
                clearInterval(timerInterval);
            }

            if (viewName === 'dashboard') {
                document.getElementById('view-dashboard').classList.remove('hidden');
                updateDashboardCounts();
            } else if (viewName === 'library') {
                document.getElementById('view-library').classList.remove('hidden');
                renderLibrary();
            } else if (viewName === 'store') {
                document.getElementById('view-store').classList.remove('hidden');
                renderStore();
            } else if (viewName === 'progress') {
                document.getElementById('view-progress').classList.remove('hidden');
                renderProgressAnalytics();
            } else if (viewName === 'player') {
                document.getElementById('view-player').classList.remove('hidden');
            } else if (viewName === 'result') {
                document.getElementById('view-result').classList.remove('hidden');
            } else if (viewName === 'admin') {
                document.getElementById('view-admin').classList.remove('hidden');
                renderManageQuizzesList();
            }
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }

        function updateDashboardCounts() {
            let chemCount = quizzes.filter(q => q.subject === 'Chemistry').length;
            let phyCount = quizzes.filter(q => q.subject === 'Physics').length;
            let bioCount = quizzes.filter(q => q.subject === 'Biology').length;

            document.getElementById('count-chemistry').innerText = `${chemCount} Quizzes Available`;
            document.getElementById('count-physics').innerText = `${phyCount} Quizzes Available`;
            document.getElementById('count-biology').innerText = `${bioCount} Quizzes Available`;

            let grid = document.getElementById('featured-quizzes-grid');
            grid.innerHTML = '';
            if (quizzes.length === 0) {
                grid.innerHTML = `<div class="col-span-3 text-center py-8 text-slate-400 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700">No quizzes published yet.</div>`;
                return;
            }
            quizzes.slice(0, 3).forEach(quiz => {
                grid.innerHTML += createQuizCardHTML(quiz);
            });
        }

        function filterSubject(subject) {
            document.getElementById('lib-subject-filter').value = subject;
            switchView('library');
            renderLibrary();
        }

        function renderLibrary() {
            let subFilter = document.getElementById('lib-subject-filter').value;
            let batchFilter = document.getElementById('lib-batch-filter').value;
            let grid = document.getElementById('library-quizzes-grid');
            grid.innerHTML = '';

            let filtered = quizzes.filter(q => {
                let matchSub = (subFilter === 'All' || q.subject === subFilter);
                let matchBatch = (batchFilter === 'All' || q.batch === batchFilter);
                return matchSub && matchBatch;
            });

            if (filtered.length === 0) {
                grid.innerHTML = `<div class="col-span-3 text-center py-12 text-slate-400 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700">No quizzes found for this category or batch.</div>`;
                return;
            }

            filtered.forEach(quiz => {
                grid.innerHTML += createQuizCardHTML(quiz);
            });
        }

        function renderStore() {
            let search = document.getElementById('store-search').value.toLowerCase();
            let yearFilter = document.getElementById('store-year-filter').value;
            let grid = document.getElementById('store-books-grid');
            grid.innerHTML = '';

            let filtered = books.filter(b => {
                let matchTitle = b.title.toLowerCase().includes(search) || b.description.toLowerCase().includes(search) || b.subject.toLowerCase().includes(search);
                let matchYear = (yearFilter === 'All' || b.year === yearFilter);
                return matchTitle && matchYear;
            });

            if (filtered.length === 0) {
                grid.innerHTML = `<div class="col-span-3 text-center py-12 text-slate-400 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700">No books found in the store for this year.</div>`;
                return;
            }

            filtered.forEach(book => {
                let defaultCover = 'https://placehold.co/400x300/e0e7ff/4f46e5?text=' + encodeURIComponent(book.title);
                let coverImg = (book.cover && book.cover.trim() !== '') ? book.cover : defaultCover;

                grid.innerHTML += `
                    <div class="bg-white dark:bg-slate-800 rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-md transition flex flex-col justify-between">
                        <div>
                            <img src="${coverImg}" alt="${book.title}" class="w-full h-48 object-cover bg-slate-100 dark:bg-slate-700" onerror="this.src='https://placehold.co/400x300/e0e7ff/4f46e5?text=Science+Book'">
                            <div class="p-5 space-y-2">
                                <div class="flex items-center justify-between">
                                    <span class="text-xs font-bold px-2.5 py-1 bg-brand-50 dark:bg-brand-900/40 text-brand-700 dark:text-brand-300 rounded-md">${book.subject}</span>
                                    <span class="text-xs font-bold px-2.5 py-1 bg-indigo-50 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300 rounded-md">A/L ${book.year}</span>
                                </div>
                                <h3 class="text-lg font-bold text-slate-900 dark:text-slate-100">${book.title}</h3>
                                <p class="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">${book.description}</p>
                            </div>
                        </div>
                        <div class="p-5 pt-0 flex items-center justify-between border-t border-slate-100 dark:border-slate-700 mt-4">
                            <span class="text-lg font-extrabold text-brand-600 dark:text-brand-400">LKR ${book.price}</span>
                            <button onclick="openOrderModal('${encodeURIComponent(book.title)}', '${encodeURIComponent(coverImg)}')" class="px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white text-xs font-semibold rounded-xl shadow transition">
                                <i class="fa-solid fa-cart-shopping mr-1"></i> OderBook
                            </button>
                        </div>
                    </div>
                `;
            });
        }

        // Open Order Modal for WhatsApp Message Generation
        function openOrderModal(titleEncoded, coverEncoded) {
            document.getElementById('order-book-title').value = decodeURIComponent(titleEncoded);
            document.getElementById('order-book-cover').value = decodeURIComponent(coverEncoded);
            document.getElementById('order-person-name').value = '';
            document.getElementById('order-whatsapp').value = '';
            document.getElementById('order-address').value = '';
            document.getElementById('order-modal').classList.remove('hidden');
        }

        function closeOrderModal() {
            document.getElementById('order-modal').classList.add('hidden');
        }

        function confirmAndSendWhatsAppOrder() {
            let bookTitle = document.getElementById('order-book-title').value;
            let coverImg = document.getElementById('order-book-cover').value;
            let name = document.getElementById('order-person-name').value.trim();
            let whatsapp = document.getElementById('order-whatsapp').value.trim();
            let address = document.getElementById('order-address').value.trim();

            if (!name || !whatsapp || !address) {
                alert("කරුණාකර නම, වට්සැප් අංකය සහ ලිපිනය ඇතුළත් කරන්න.");
                return;
            }

            let message = `📸 *پొතේ ඡායාරූපය (Book Image)*\n${coverImg}\n\n` +
                          `📚 *පොතේ නම:* ${bookTitle}\n` +
                          `👤 *පාරිභෝගිකයාගේ නම:* ${name}\n` +
                          `📱 *වට්සැප් අංකය:* ${whatsapp}\n` +
                          `📍 *ලිපිනය:* ${address}\n\n` +
                          `✨ *ස්තූතියි! කරුණාකර මගේ ඇණවුම තහවුරු කරන්න.* ✨`;

            let encodedMessage = encodeURIComponent(message);
            let whatsappUrl = `https://wa.me/94726813373?text=${encodedMessage}`;

            closeOrderModal();
            window.open(whatsappUrl, '_blank');
        }

        function createQuizCardHTML(quiz) {
            let badgeColor = 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300';
            let icon = 'fa-flask';
            if (quiz.subject === 'Physics') {
                badgeColor = 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300';
                icon = 'fa-bolt';
            } else if (quiz.subject === 'Biology') {
                badgeColor = 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300';
                icon = 'fa-dna';
            }

            return `
                <div class="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-md transition flex flex-col justify-between">
                    <div>
                        <div class="flex items-center justify-between mb-3">
                            <span class="text-xs font-bold px-3 py-1 rounded-full ${badgeColor}">
                                <i class="fa-solid ${icon} mr-1"></i> ${quiz.subject}
                            </span>
                            <span class="text-xs font-bold px-2.5 py-1 bg-indigo-50 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300 rounded-md">A/L ${quiz.batch || '2027'}</span>
                        </div>
                        <h3 class="text-lg font-bold text-slate-900 dark:text-slate-100 mb-2">${quiz.title}</h3>
                        <p class="text-xs text-slate-400 font-medium mb-3">${quiz.questions.length} Questions</p>
                    </div>
                    <div class="pt-4 border-t border-slate-100 dark:border-slate-700 flex items-center justify-between">
                        <span class="text-xs text-slate-500 dark:text-slate-400"><i class="fa-solid fa-clock mr-1"></i> ${quiz.timeLimit}s per q</span>
                        <div class="flex items-center space-x-2">
                            <button onclick="startQuiz(${quiz.id})" class="px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white text-sm font-semibold rounded-xl shadow transition flex items-center gap-2">
                                Start Quiz <i class="fa-solid fa-play text-xs"></i>
                            </button>
                        </div>
                    </div>
                </div>
            `;
        }

        function renderProgressAnalytics() {
            let totalCompleted = studentHistory.length;
            let avgAcc = totalCompleted > 0 ? Math.round(studentHistory.reduce((acc, cur) => acc + cur.score, 0) / totalCompleted) : 0;

            document.getElementById('stat-completed-count').innerText = totalCompleted;
            document.getElementById('stat-avg-accuracy').innerText = `${avgAcc}%`;

            let tbody = document.getElementById('history-table-body');
            tbody.innerHTML = '';
            if (totalCompleted === 0) {
                tbody.innerHTML = `<tr><td colspan="5" class="p-4 text-center text-slate-400">No quizzes completed yet.</td></tr>`;
            } else {
                studentHistory.slice().reverse().forEach(item => {
                    let badge = item.score >= 75 ? '<span class="px-2 py-0.5 bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300 font-bold text-xs rounded">Excellent</span>' : '<span class="px-2 py-0.5 bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300 font-bold text-xs rounded">Good</span>';
                    tbody.innerHTML += `
                        <tr class="hover:bg-slate-50 dark:hover:bg-slate-700/50">
                            <td class="p-3 font-mono text-xs">${item.date}</td>
                            <td class="p-3 font-medium text-slate-900 dark:text-slate-100">${item.title}</td>
                            <td class="p-3"><span class="px-2 py-0.5 bg-slate-100 dark:bg-slate-700 rounded text-xs">${item.subject} (A/L ${item.batch || '2027'})</span></td>
                            <td class="p-3 font-bold text-brand-600 dark:text-brand-400">${item.score}%</td>
                            <td class="p-3">${badge}</td>
                        </tr>
                    `;
                });
            }

            const isDark = document.documentElement.classList.contains('dark');
            const textColor = isDark ? '#cbd5e1' : '#475569';
            const gridColor = isDark ? '#334155' : '#e2e8f0';

            const lineCtx = document.getElementById('progressLineChart').getContext('2d');
            if (lineChartInstance) lineChartInstance.destroy();

            lineChartInstance = new Chart(lineCtx, {
                type: 'line',
                data: {
                    labels: studentHistory.map(h => h.date),
                    datasets: [{
                        label: 'Quiz Score (%)',
                        data: studentHistory.map(h => h.score),
                        borderColor: '#6366f1',
                        backgroundColor: 'rgba(99, 102, 241, 0.1)',
                        borderWidth: 3,
                        fill: true,
                        tension: 0.3
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    scales: {
                        y: { beginAtZero: true, max: 100, ticks: { color: textColor }, grid: { color: gridColor } },
                        x: { ticks: { color: textColor }, grid: { color: gridColor } }
                    },
                    plugins: { legend: { display: false } }
                }
            });

            let chemScores = studentHistory.filter(h => h.subject === 'Chemistry').map(h => h.score);
            let phyScores = studentHistory.filter(h => h.subject === 'Physics').map(h => h.score);
            let bioScores = studentHistory.filter(h => h.subject === 'Biology').map(h => h.score);

            let avgChem = chemScores.length ? Math.round(chemScores.reduce((a, b) => a + b, 0) / chemScores.length) : 0;
            let avgPhy = phyScores.length ? Math.round(phyScores.reduce((a, b) => a + b, 0) / phyScores.length) : 0;
            let avgBio = bioScores.length ? Math.round(bioScores.reduce((a, b) => a + b, 0) / bioScores.length) : 0;

            const barCtx = document.getElementById('subjectBarChart').getContext('2d');
            if (barChartInstance) barChartInstance.destroy();

            barChartInstance = new Chart(barCtx, {
                type: 'bar',
                data: {
                    labels: ['Chemistry', 'Physics', 'Biology'],
                    datasets: [{
                        label: 'Average Accuracy (%)',
                        data: [avgChem, avgPhy, avgBio],
                        backgroundColor: ['#f59e0b', '#3b82f6', '#10b981'],
                        borderRadius: 8
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    scales: {
                        y: { beginAtZero: true, max: 100, ticks: { color: textColor }, grid: { color: gridColor } },
                        x: { ticks: { color: textColor }, grid: { color: gridColor } }
                    },
                    plugins: { legend: { display: false } }
                }
            });
        }

        function startQuiz(quizId) {
            let found = quizzes.find(q => q.id === quizId);
            if (!found) return;
            currentQuiz = JSON.parse(JSON.stringify(found));
            currentQuestionIndex = 0;
            userAnswers = new Array(currentQuiz.questions.length).fill(null);
            score = 0;
            quizStartTime = Date.now();

            document.getElementById('player-quiz-subject').innerText = currentQuiz.subject;
            document.getElementById('player-quiz-batch').innerText = `A/L ${currentQuiz.batch || '2027'}`;
            document.getElementById('player-quiz-title').innerText = currentQuiz.title;

            switchView('player');
            loadQuestion();
            startTimer();
        }

        function startTimer() {
            clearInterval(timerInterval);
            timeLeft = currentQuiz.timeLimit || 60;
            updateTimerDisplay();

            timerInterval = setInterval(() => {
                timeLeft--;
                updateTimerDisplay();
                if (timeLeft <= 0) {
                    clearInterval(timerInterval);
                    nextQuestion();
                }
            }, 1000);
        }

        function updateTimerDisplay() {
            let m = Math.floor(timeLeft / 60);
            let s = timeLeft % 60;
            document.getElementById('timer-display').innerText = `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
        }

        function formatExplanationHTML(text) {
            if (!text || text.trim() === '') return '<p>විවරණයක් සපයා නැත.</p>';
            let lines = text.split('\n').map(l => l.trim()).filter(l => l.length > 0);
            let html = '<ul class="space-y-2 list-none">';
            lines.forEach(line => {
                let hasIcon = line.startsWith('🔹') || line.startsWith('💡') || line.startsWith('⭐') || line.startsWith('✔') || line.startsWith('⚠');
                let cleanLine = line;
                let iconHtml = '<i class="fa-solid fa-circle-check text-amber-600 dark:text-amber-400 text-xs mt-1 shrink-0"></i>';
                
                if (hasIcon) {
                    let firstChar = line.substring(0, 2).trim();
                    cleanLine = line.substring(2).trim();
                    iconHtml = `<span class="text-sm shrink-0">${firstChar}</span>`;
                }

                html += `<li class="flex items-start space-x-2.5">${iconHtml}<span class="sinhala-text font-medium leading-relaxed">${cleanLine}</span></li>`;
            });
            html += '</ul>';
            return html;
        }

        function loadQuestion() {
            let q = currentQuiz.questions[currentQuestionIndex];
            document.getElementById('question-counter').innerText = `Question ${currentQuestionIndex + 1} of ${currentQuiz.questions.length}`;
            document.getElementById('question-subject-badge').innerText = `${currentQuiz.subject} (A/L ${currentQuiz.batch || '2027'})`;
            document.getElementById('question-text').innerText = q.text;

            let imgContainer = document.getElementById('question-image-container');
            let imgEl = document.getElementById('question-image');
            if (q.image && q.image.trim() !== '') {
                imgEl.src = q.image;
                imgContainer.classList.remove('hidden');
            } else {
                imgContainer.classList.add('hidden');
            }

            let optsContainer = document.getElementById('options-container');
            optsContainer.innerHTML = '';

            q.options.forEach((opt, idx) => {
                let isSelected = userAnswers[currentQuestionIndex] === idx;
                let btnStyle = "border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100 hover:border-brand-500 hover:bg-brand-50/30";
                let badgeStyle = "bg-slate-100 dark:bg-slate-600 text-slate-600 dark:text-slate-200";

                if (userAnswers[currentQuestionIndex] !== null) {
                    if (idx === q.correct) {
                        btnStyle = "border-emerald-500 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-900 dark:text-emerald-200 font-bold";
                        badgeStyle = "bg-emerald-600 text-white";
                    } else if (isSelected && idx !== q.correct) {
                        btnStyle = "border-rose-500 bg-rose-50 dark:bg-rose-900/30 text-rose-900 dark:text-rose-200 font-bold";
                        badgeStyle = "bg-rose-600 text-white";
                    }
                } else if (isSelected) {
                    btnStyle = "border-brand-600 bg-brand-50 dark:bg-brand-900/40 text-brand-900 dark:text-brand-200 font-bold";
                    badgeStyle = "bg-brand-600 text-white";
                }

                let contentHtml = '';
                if (opt.startsWith('http://') || opt.startsWith('https://') || opt.startsWith('data:image')) {
                    contentHtml = `<img src="${opt}" alt="Option ${idx + 1}" class="max-h-24 object-contain mx-auto rounded-lg">`;
                } else {
                    contentHtml = `<span class="sinhala-text">${opt}</span>`;
                }

                optsContainer.innerHTML += `
                    <button onclick="selectOption(${idx})" class="w-full text-left p-4 rounded-xl border-2 ${btnStyle} transition flex items-center space-x-3 shadow-sm">
                        <span class="w-7 h-7 rounded-lg ${badgeStyle} flex items-center justify-center font-bold text-xs shrink-0">${idx + 1}</span>
                        <div class="flex-1">${contentHtml}</div>
                    </button>
                `;
            });

            let expBox = document.getElementById('explanation-box');
            if (userAnswers[currentQuestionIndex] !== null) {
                expBox.classList.remove('hidden');
                document.getElementById('explanation-content').innerHTML = formatExplanationHTML(q.explanation);
                
                let expImgContainer = document.getElementById('explanation-image-container');
                let expImgEl = document.getElementById('explanation-image');
                if (q.expImage && q.expImage.trim() !== '') {
                    expImgEl.src = q.expImage;
                    expImgContainer.classList.remove('hidden');
                } else {
                    expImgContainer.classList.add('hidden');
                }
            } else {
                expBox.classList.add('hidden');
            }

            document.getElementById('btn-prev').disabled = (currentQuestionIndex === 0);
            if (currentQuestionIndex === currentQuiz.questions.length - 1) {
                document.getElementById('btn-next').innerText = "Finish & View Result";
            } else {
                document.getElementById('btn-next').innerText = "Next Question →";
            }
        }

        function selectOption(idx) {
            if (userAnswers[currentQuestionIndex] !== null) return;
            userAnswers[currentQuestionIndex] = idx;
            clearInterval(timerInterval);
            loadQuestion();
        }

        function prevQuestion() {
            if (currentQuestionIndex > 0) {
                currentQuestionIndex--;
                loadQuestion();
                startTimer();
            }
        }

        function nextQuestion() {
            if (currentQuestionIndex < currentQuiz.questions.length - 1) {
                currentQuestionIndex++;
                loadQuestion();
                startTimer();
            } else {
                finishQuiz();
            }
        }

        function quitQuiz() {
            if (confirm("Are you sure you want to quit this quiz?")) {
                clearInterval(timerInterval);
                switchView('library');
            }
        }

        function finishQuiz() {
            clearInterval(timerInterval);
            let correctCount = 0;
            currentQuiz.questions.forEach((q, idx) => {
                if (userAnswers[idx] === q.correct) {
                    correctCount++;
                }
            });

            score = Math.round((correctCount / currentQuiz.questions.length) * 100);
            let quizDurationSeconds = Math.round((Date.now() - quizStartTime) / 1000);

            let m = Math.floor(quizDurationSeconds / 60);
            let s = quizDurationSeconds % 60;
            let timeStr = `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;

            document.getElementById('result-score').innerText = `${score}%`;
            document.getElementById('result-correct').innerText = `${correctCount} / ${currentQuiz.questions.length}`;
            document.getElementById('result-time').innerText = timeStr;

            document.getElementById('report-quiz-title').innerText = currentQuiz.title;
            document.getElementById('report-date').innerText = new Date().toISOString().split('T')[0];
            document.getElementById('report-score-badge').innerText = `Score: ${score}%`;

            let reportList = document.getElementById('report-questions-list');
            reportList.innerHTML = '';
            currentQuiz.questions.forEach((q, idx) => {
                let userAns = userAnswers[idx];
                let isCorrect = userAns === q.correct;
                let statusBadge = isCorrect ? '<span class="px-2 py-0.5 bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300 font-bold text-xs rounded">Correct</span>' : '<span class="px-2 py-0.5 bg-rose-100 text-rose-800 dark:bg-rose-900/30 dark:text-rose-300 font-bold text-xs rounded">Incorrect</span>';
                
                reportList.innerHTML += `
                    <div class="p-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/40 space-y-2">
                        <div class="flex items-center justify-between text-xs font-bold text-slate-500">
                            <span>Question ${idx + 1}</span>
                            ${statusBadge}
                        </div>
                        <p class="font-bold text-sm text-slate-900 dark:text-slate-100 sinhala-text">${q.text}</p>
                        <p class="text-xs text-slate-600 dark:text-slate-300">Your Answer: <span class="font-semibold">${userAns !== null ? q.options[userAns] : 'Not Answered'}</span></p>
                        <p class="text-xs text-emerald-600 dark:text-emerald-400">Correct Answer: <span class="font-semibold">${q.options[q.correct]}</span></p>
                        <div class="mt-2 p-3 bg-amber-50 dark:bg-amber-900/20 rounded-lg text-xs text-amber-900 dark:text-amber-200 sinhala-text">
                            <strong>විවරණය:</strong> ${q.explanation || 'විවරණයක් නැත.'}
                        </div>
                    </div>
                `;
            });

            studentHistory.push({
                id: Date.now(),
                title: currentQuiz.title,
                subject: currentQuiz.subject,
                batch: currentQuiz.batch || '2027',
                score: score,
                correctCount: correctCount,
                total: currentQuiz.questions.length,
                date: new Date().toISOString().split('T')[0]
            });
            let userEmail = localStorage.getItem('proquiz_user_email') || 'default_student';
            localStorage.setItem('proquiz_student_history_' + userEmail, JSON.stringify(studentHistory));

            switchView('result');
        }

        function restartCurrentQuiz() {
            startQuiz(currentQuiz.id);
        }

        function downloadPDFReport() {
            const { jsPDF } = window.jspdf;
            const doc = new jsPDF();
            doc.setFillColor(79, 70, 229);
            doc.rect(0, 0, 210, 40, 'F');
            doc.setTextColor(255, 255, 255);
            doc.setFontSize(20);
            doc.text("ProQuiz Science Hub - Performance Report", 14, 25);

            doc.setTextColor(50, 50, 50);
            doc.setFontSize(14);
            doc.text(`Quiz Title: ${currentQuiz.title}`, 14, 55);
            doc.text(`Subject: ${currentQuiz.subject} (A/L ${currentQuiz.batch || '2027'})`, 14, 65);
            doc.text(`Score Achieved: ${score}%`, 14, 75);
            doc.text(`Date: ${new Date().toISOString().split('T')[0]}`, 14, 85);

            doc.setFontSize(12);
            doc.text("Keep practicing and reviewing explanations to master your A/L Science subjects!", 14, 105);

            doc.save(`${currentQuiz.title}_Report.pdf`);
        }

        function addQuestionToCurrentForm() {
            let text = document.getElementById('q-text').value.trim();
            let image = document.getElementById('q-image').value.trim();
            let correct = parseInt(document.getElementById('q-correct').value);
            let explanation = document.getElementById('q-explanation').value.trim();
            let expImage = document.getElementById('q-exp-image').value.trim();

            let options = [];
            for (let i = 0; i < 5; i++) {
                let t = document.getElementById(`opt-${i}-text`).value.trim();
                let img = document.getElementById(`opt-${i}-img`).value.trim();
                if (img !== '') {
                    options.push(img);
                } else if (t !== '') {
                    options.push(t);
                }
            }

            if (!text || options.length < 2) {
                alert("Please provide question text and at least 2 answer options.");
                return;
            }

            tempQuestions.push({
                text,
                image,
                options,
                correct,
                explanation,
                expImage
            });

            document.getElementById('current-question-count').innerText = tempQuestions.length;
            document.getElementById('quiz-builder-status').innerText = `${tempQuestions.length} question(s) added successfully!`;

            document.getElementById('q-text').value = '';
            document.getElementById('q-image').value = '';
            document.getElementById('q-explanation').value = '';
            document.getElementById('q-exp-image').value = '';
            for (let i = 0; i < 5; i++) {
                document.getElementById(`opt-${i}-text`).value = '';
                document.getElementById(`opt-${i}-img`).value = '';
            }
        }

        function publishQuiz() {
            if (!checkIsAdmin()) {
                alert("Access Denied!");
                return;
            }
            let title = document.getElementById('admin-quiz-title').value.trim();
            let subject = document.getElementById('admin-subject').value;
            let batch = document.getElementById('admin-batch').value;
            let timeLimit = parseInt(document.getElementById('admin-time').value) || 60;

            if (!title || tempQuestions.length === 0) {
                alert("Please provide a quiz title and add at least one question.");
                return;
            }

            if (editingQuizId !== null) {
                let index = quizzes.findIndex(q => q.id === editingQuizId);
                if (index !== -1) {
                    quizzes[index] = {
                        id: editingQuizId,
                        title,
                        subject,
                        batch,
                        timeLimit,
                        questions: [...tempQuestions]
                    };
                }
                editingQuizId = null;
                document.getElementById('admin-heading-title').innerText = "Create New Quiz & Add Questions";
                document.getElementById('btn-cancel-edit').classList.add('hidden');
            } else {
                let newQuiz = {
                    id: Date.now(),
                    title,
                    subject,
                    batch,
                    timeLimit,
                    questions: [...tempQuestions]
                };
                quizzes.push(newQuiz);
            }

            localStorage.setItem('proquiz_quizzes', JSON.stringify(quizzes));
            alert("Quiz published successfully!");
            tempQuestions = [];
            document.getElementById('current-question-count').innerText = "0";
            document.getElementById('admin-quiz-title').value = '';
            renderManageQuizzesList();
            updateDashboardCounts();
        }

        function publishBook() {
            if (!checkIsAdmin()) {
                alert("Access Denied!");
                return;
            }
            let title = document.getElementById('book-title').value.trim();
            let subject = document.getElementById('book-subject').value;
            let year = document.getElementById('book-year').value;
            let price = parseFloat(document.getElementById('book-price').value) || 1500;
            let cover = document.getElementById('book-cover').value.trim();
            let description = document.getElementById('book-desc').value.trim();

            if (!title || !description) {
                alert("Please provide book title and description.");
                return;
            }

            let newBook = {
                id: Date.now(),
                title,
                subject,
                year,
                price,
                cover,
                description
            };

            books.push(newBook);
            localStorage.setItem('proquiz_books', JSON.stringify(books));
            alert("Book published to store successfully!");

            document.getElementById('book-title').value = '';
            document.getElementById('book-price').value = '1500';
            document.getElementById('book-cover').value = '';
            document.getElementById('book-desc').value = '';
            renderManageQuizzesList();
        }

        function renderManageQuizzesList() {
            let qList = document.getElementById('manage-quizzes-list');
            qList.innerHTML = `<h4 class="text-xs font-bold uppercase text-slate-400 mb-2">Published Quizzes (${quizzes.length})</h4>`;
            
            if (quizzes.length === 0) {
                qList.innerHTML += `<p class="text-xs text-slate-400">No quizzes available.</p>`;
            } else {
                quizzes.forEach(q => {
                    qList.innerHTML += `
                        <div class="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-700/40 rounded-xl text-sm">
                            <div>
                                <span class="font-bold text-slate-900 dark:text-slate-100">${q.title}</span>
                                <span class="text-xs text-slate-500 ml-2">(${q.subject} - A/L ${q.batch || '2027'} | ${q.questions.length} Qs)</span>
                            </div>
                            <div class="flex items-center space-x-2">
                                <button onclick="deleteQuiz(${q.id})" class="px-2.5 py-1 text-xs font-semibold text-rose-600 bg-rose-50 hover:bg-rose-100 rounded-lg"><i class="fa-solid fa-trash"></i> Delete</button>
                            </div>
                        </div>
                    `;
                });
            }

            let bList = document.getElementById('manage-books-list');
            bList.innerHTML = `<h4 class="text-xs font-bold uppercase text-slate-400 mb-2">Published Books (${books.length})</h4>`;
            if (books.length === 0) {
                bList.innerHTML += `<p class="text-xs text-slate-400">No books available in store.</p>`;
            } else {
                books.forEach(b => {
                    bList.innerHTML += `
                        <div class="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-700/40 rounded-xl text-sm">
                            <div>
                                <span class="font-bold text-slate-900 dark:text-slate-100">${b.title}</span>
                                <span class="text-xs text-slate-500 ml-2">(${b.subject} - A/L ${b.year} | LKR ${b.price})</span>
                            </div>
                            <div class="flex items-center space-x-2">
                                <button onclick="deleteBook(${b.id})" class="px-2.5 py-1 text-xs font-semibold text-rose-600 bg-rose-50 hover:bg-rose-100 rounded-lg"><i class="fa-solid fa-trash"></i> Delete</button>
                            </div>
                        </div>
                    `;
                });
            }
        }

        function deleteQuiz(id) {
            if (confirm("Are you sure you want to delete this quiz?")) {
                quizzes = quizzes.filter(q => q.id !== id);
                localStorage.setItem('proquiz_quizzes', JSON.stringify(quizzes));
                renderManageQuizzesList();
                updateDashboardCounts();
            }
        }

        function deleteBook(id) {
            if (confirm("Are you sure you want to delete this book?")) {
                books = books.filter(b => b.id !== id);
                localStorage.setItem('proquiz_books', JSON.stringify(books));
                renderManageQuizzesList();
            }
        }

        function openAdminCreateNew() {
            if (!checkIsAdmin()) {
                alert("Access Denied!");
                return;
            }
            switchView('admin');
        }
    