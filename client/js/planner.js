// Planner state
let plannerState = {
    currentDate: new Date(),
    selectedDate: new Date(),
    tasks: [],
    goals: [],
    studyStats: {
        completed: 0,
        total: 0,
        studyTime: 0,
        questionsDone: 0
    }
};

document.addEventListener('DOMContentLoaded', () => {
    checkAuth();
    loadTasks();
    loadGoals();
    renderCalendar();
    updateDateDisplay();
    updateTodayTasks();
    updateStats();
    if (window.studyStreak) studyStreak.init();
});

function checkAuth() {
    const token = localStorage.getItem('token');
    if (!token) window.location.href = '/auth.html';
}

function loadTasks() {
    const saved = localStorage.getItem('studyTasks');
    plannerState.tasks = saved ? JSON.parse(saved) : [];
}

function loadGoals() {
    const saved = localStorage.getItem('studyGoals');
    plannerState.goals = saved ? JSON.parse(saved) : getDefaultGoals();
}

function getDefaultGoals() {
    return [
        {
            id: 'goal1',
            name: 'Practice Questions',
            target: 100,
            current: 0,
            unit: 'questions',
            deadline: getEndOfWeek()
        },
        {
            id: 'goal2',
            name: 'Study Hours',
            target: 10,
            current: 0,
            unit: 'hours',
            deadline: getEndOfWeek()
        },
        {
            id: 'goal3',
            name: 'Flashcards Reviewed',
            target: 50,
            current: 0,
            unit: 'cards',
            deadline: getEndOfWeek()
        }
    ];
}

function getEndOfWeek() {
    const date = new Date();
    date.setDate(date.getDate() + (7 - date.getDay()));
    return date.toISOString();
}

function renderCalendar() {
    const year = plannerState.currentDate.getFullYear();
    const month = plannerState.currentDate.getMonth();
    
    document.getElementById('calendarMonth').textContent = 
        new Date(year, month).toLocaleString('default', { month: 'long', year: 'numeric' });
    
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    
    let html = '';
    
    for (let i = 0; i < firstDay; i++) {
        html += '<div class="calendar-day empty"></div>';
    }
    
    for (let day = 1; day <= daysInMonth; day++) {
        const date = new Date(year, month, day);
        const dateStr = date.toDateString();
        const today = new Date().toDateString();
        const tasksOnDay = plannerState.tasks.filter(t => 
            new Date(t.date).toDateString() === dateStr
        );
        
        let classes = 'calendar-day';
        if (dateStr === today) classes += ' today';
        if (tasksOnDay.length > 0) classes += ' has-study';
        
        html += `
            <div class="${classes}" onclick="selectDate('${dateStr}')">
                <span class="day-number">${day}</span>
                ${tasksOnDay.length > 0 ? `
                    <span class="study-indicator"></span>
                    <span class="study-count">${tasksOnDay.length}</span>
                ` : ''}
            </div>
        `;
    }
    
    document.getElementById('calendarDays').innerHTML = html;
}

function selectDate(dateStr) {
    plannerState.selectedDate = new Date(dateStr);
    updateTodayTasks();
}

function changeMonth(delta) {
    plannerState.currentDate.setMonth(plannerState.currentDate.getMonth() + delta);
    renderCalendar();
}

function updateDateDisplay() {
    const today = new Date();
    document.getElementById('currentDay').textContent = today.getDate();
    document.getElementById('currentMonthYear').textContent = 
        today.toLocaleString('default', { month: 'long', year: 'numeric' });
}

function addTask(event) {
    event.preventDefault();
    
    const task = {
        id: 'task_' + Date.now(),
        title: document.getElementById('taskTitle').value,
        subject: document.getElementById('taskSubject').value,
        time: document.getElementById('taskTime').value,
        notes: document.getElementById('taskNotes').value,
        date: plannerState.selectedDate.toISOString(),
        completed: false,
        createdAt: new Date().toISOString()
    };
    
    plannerState.tasks.push(task);
    localStorage.setItem('studyTasks', JSON.stringify(plannerState.tasks));
    
    document.getElementById('taskTitle').value = '';
    document.getElementById('taskSubject').value = '';
    document.getElementById('taskTime').value = '';
    document.getElementById('taskNotes').value = '';
    
    renderCalendar();
    updateTodayTasks();
    updateStats();
    
    showNotification('✅ Task added successfully!');
}

function updateTodayTasks() {
    const selectedDate = plannerState.selectedDate.toDateString();
    const tasks = plannerState.tasks.filter(t => 
        new Date(t.date).toDateString() === selectedDate
    ).sort((a, b) => a.time.localeCompare(b.time));
    
    const container = document.getElementById('todayTasks');
    
    if (tasks.length === 0) {
        container.innerHTML = `
            <div style="text-align: center; padding: 40px; background: white; border-radius: 10px;">
                <p style="font-size: 3rem; margin-bottom: 20px;">📅</p>
                <h3>No tasks for this day</h3>
                <p style="color: #666; margin-top: 10px;">Add a task using the form</p>
            </div>
        `;
        return;
    }
    
    container.innerHTML = tasks.map(task => `
        <div class="study-item ${task.completed ? 'completed' : ''}">
            <div class="study-time">${formatTime(task.time)}</div>
            <div class="study-content">
                <div class="study-title">${task.title}</div>
                <div class="study-subject">${getSubjectName(task.subject)}</div>
                ${task.notes ? `<div style="color: #999; font-size: 0.9rem; margin-top: 5px;">📝 ${task.notes}</div>` : ''}
            </div>
            <div class="study-actions">
                <button class="study-action-btn complete" onclick="toggleTaskComplete('${task.id}')" title="Mark complete">
                    ${task.completed ? '↩️' : '✅'}
                </button>
                <button class="study-action-btn delete" onclick="deleteTask('${task.id}')" title="Delete">🗑️</button>
            </div>
        </div>
    `).join('');
    
    updateStats();
}

function toggleTaskComplete(taskId) {
    const task = plannerState.tasks.find(t => t.id === taskId);
    if (task) {
        task.completed = !task.completed;
        localStorage.setItem('studyTasks', JSON.stringify(plannerState.tasks));
        updateTodayTasks();
        updateStats();
        updateGoals();
    }
}

function deleteTask(taskId) {
    if (confirm('Delete this task?')) {
        plannerState.tasks = plannerState.tasks.filter(t => t.id !== taskId);
        localStorage.setItem('studyTasks', JSON.stringify(plannerState.tasks));
        renderCalendar();
        updateTodayTasks();
        updateStats();
        showNotification('✅ Task deleted');
    }
}

function updateStats() {
    const today = new Date().toDateString();
    const todayTasks = plannerState.tasks.filter(t => 
        new Date(t.date).toDateString() === today
    );
    
    const completed = todayTasks.filter(t => t.completed).length;
    const total = todayTasks.length;
    
    plannerState.studyStats.completed = completed;
    plannerState.studyStats.total = total;
    
    document.getElementById('completedCount').textContent = `${completed}/${total}`;
    document.getElementById('studyTime').textContent = calculateStudyTime(todayTasks);
    document.getElementById('questionsDone').textContent = calculateQuestionsDone(today);
}

function calculateStudyTime(tasks) {
    const completedTasks = tasks.filter(t => t.completed).length;
    const minutes = completedTasks * 30;
    
    if (minutes < 60) return `${minutes} min`;
    return `${Math.floor(minutes / 60)}h ${minutes % 60}m`;
}

function calculateQuestionsDone(date) {
    const practiceStats = JSON.parse(localStorage.getItem('practiceStats') || '{"total":0}');
    return practiceStats.total || 0;
}

function updateGoals() {
    const goalsContainer = document.getElementById('weeklyGoals');
    
    const practiceStats = JSON.parse(localStorage.getItem('practiceStats') || '{"total":0}');
    const flashcards = JSON.parse(localStorage.getItem('flashcardDecks') || '[]');
    const totalFlashcards = flashcards.reduce((sum, d) => sum + d.totalCards, 0);
    
    plannerState.goals[0].current = practiceStats.total || 0;
    plannerState.goals[1].current = Math.floor(practiceStats.total / 30);
    plannerState.goals[2].current = totalFlashcards;
    
    goalsContainer.innerHTML = plannerState.goals.map(goal => {
        const percentage = Math.min(100, (goal.current / goal.target) * 100);
        
        return `
            <div class="goal-item">
                <div style="min-width: 150px;">
                    <strong>${goal.name}</strong>
                </div>
                <div class="goal-progress">
                    <div class="progress-bar">
                        <div class="progress-fill" style="width: ${percentage}%"></div>
                    </div>
                    <div class="goal-stats">
                        <span>${goal.current} / ${goal.target} ${goal.unit}</span>
                        <span>${Math.round(percentage)}% complete</span>
                    </div>
                </div>
                <div style="color: #666;">
                    Due: ${new Date(goal.deadline).toLocaleDateString()}
                </div>
            </div>
        `;
    }).join('');
    
    localStorage.setItem('studyGoals', JSON.stringify(plannerState.goals));
}

function formatTime(timeStr) {
    const [hours, minutes] = timeStr.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const hour12 = hour % 12 || 12;
    return `${hour12}:${minutes} ${ampm}`;
}

function getSubjectName(subjectId) {
    const subjects = {
        english: 'Use of English',
        math: 'Mathematics',
        physics: 'Physics',
        chemistry: 'Chemistry',
        biology: 'Biology'
    };
    return subjects[subjectId] || subjectId;
}

function showNotification(message) {
    const toast = document.createElement('div');
    toast.className = 'share-toast';
    toast.textContent = message;
    document.body.appendChild(toast);
    
    setTimeout(() => toast.classList.add('show'), 100);
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => toast.remove(), 300);
    }, 2000);
}

window.changeMonth = changeMonth;
window.selectDate = selectDate;
window.addTask = addTask;
window.toggleTaskComplete = toggleTaskComplete;
window.deleteTask = deleteTask;