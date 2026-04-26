const authGatewayOnline = false;
const redirectPath = 'acount.html';
const employeeProfile = {
	firstName: 'NULL',
	lastName: 'NULL',
	fullName: 'NULL',
	username: 'NULL',
	email: 'NULL',
	password: 'NULL',
	initials: 'NULL',
	joinedYear: 'NULL',
	arasakaId: 'NULL',
	grade: 'NULL',
	githubUrl: 'NULL',
	corporateNumber: 'NULL',
	bio: 'NULL'
};

const validEmail = employeeProfile.email;
const validPassword = employeeProfile.password;

const progressStorageKey = 'arasaka-employee-progress-v1';
const employeeTasks = [
	{
		id: 'git',
		label: 'Изучил Git и базовый hotfix workflow',
		icon: 'fa-code-branch',
		defaultCompleted: true
	},
	{
		id: 'linux',
		label: 'Погрузился в работу Linux',
		icon: 'fa-terminal',
		defaultCompleted: false
	},
	{
		id: 'networking',
		label: 'Разобрался с networking и диагностикой',
		icon: 'fa-network-wired',
		defaultCompleted: false
	},
	{
		id: 'containers',
		label: 'Изучил контейнеризацию и Docker',
		icon: 'fa-box',
		defaultCompleted: false
	},
	{
		id: 'kubernetes',
		label: 'Погрузился в Kubernetes',
		icon: 'fa-dharmachakra',
		defaultCompleted: false
	},
	{
		id: 'cicd',
		label: 'Освоил CI/CD и pipeline delivery',
		icon: 'fa-gears',
		defaultCompleted: false
	},
	{
		id: 'observability',
		label: 'Разобрал observability и сигналы системы',
		icon: 'fa-chart-line',
		defaultCompleted: false
	},
	{
		id: 'security',
		label: 'Изучил security practices',
		icon: 'fa-shield-halved',
		defaultCompleted: false
	},
	{
		id: 'incident-response',
		label: 'Отработал incident response и postmortem discipline',
		icon: 'fa-satellite-dish',
		defaultCompleted: false
	}
];

const messages = {
	maintenance:
		'Identity gateway remains in lockdown. Deploy a hotfix before authorization can continue.',
	invalid:
		'Credentials rejected by the Arasaka identity core. Re-check the operator record.',
	success:
		'Authorization token accepted. Redirecting to the protected account vault...'
};

const authForm = document.querySelector('#auth-form');
const emailInput = document.querySelector('#email');
const passwordInput = document.querySelector('#password');
const messageBox = document.querySelector('#message-box');

function setMessage(text, type = '') {
	if (!messageBox) {
		return;
	}

	messageBox.textContent = text;
	messageBox.className = 'message-box';

	if (type) {
		messageBox.classList.add(`is-${type}`);
	}
}

function loadTaskState() {
	const storedState = window.localStorage.getItem(progressStorageKey);

	if (storedState) {
		try {
			return JSON.parse(storedState);
		} catch (error) {
			console.error('Failed to parse progress state:', error);
		}
	}

	return employeeTasks.reduce((result, task) => {
		result[task.id] = task.defaultCompleted;
		return result;
	}, {});
}

function saveTaskState(state) {
	window.localStorage.setItem(progressStorageKey, JSON.stringify(state));
}

function renderProgress(state) {
	const progressValue = document.querySelector('#progress-value');
	const progressFill = document.querySelector('#progress-fill');
	const progressCaption = document.querySelector('#progress-caption');

	if (!progressValue || !progressFill || !progressCaption) {
		return;
	}

	const completedTasks = employeeTasks.filter((task) => state[task.id]).length;
	const totalTasks = employeeTasks.length;
	const progressPercent = Math.round((completedTasks / totalTasks) * 100);

	progressValue.textContent = `${progressPercent}%`;
	progressFill.style.width = `${progressPercent}%`;
	progressCaption.textContent = `${completedTasks} из ${totalTasks} задач отмечено как выполненные`;
}

function renderTaskList() {
	const taskList = document.querySelector('#task-list');

	if (!taskList) {
		return;
	}

	const state = loadTaskState();
	taskList.innerHTML = '';

	employeeTasks.forEach((task) => {
		const taskItem = document.createElement('label');
		taskItem.className = 'task-item';

		const checkbox = document.createElement('input');
		checkbox.className = 'task-checkbox';
		checkbox.type = 'checkbox';
		checkbox.checked = Boolean(state[task.id]);

		const icon = document.createElement('span');
		icon.className = 'task-icon';
		icon.innerHTML = `<i class="fas ${task.icon}" aria-hidden="true"></i>`;

		const content = document.createElement('span');
		content.className = 'task-content';

		const title = document.createElement('span');
		title.className = 'task-title';
		title.textContent = task.label;

		const status = document.createElement('span');
		status.className = 'task-status';
		status.textContent = checkbox.checked ? 'Completed' : 'Pending';

		content.append(title, status);
		taskItem.append(checkbox, icon, content);
		taskList.append(taskItem);

		if (checkbox.checked) {
			taskItem.classList.add('is-complete');
		}

		checkbox.addEventListener('change', () => {
			const nextState = loadTaskState();
			nextState[task.id] = checkbox.checked;
			saveTaskState(nextState);
			renderTaskList();
			renderProgress(nextState);
		});
	});

	renderProgress(state);
}

function renderEmployeeProfile() {
	const bindings = [
		['#test-operator-email', employeeProfile.email],
		['#test-operator-password', employeeProfile.password],
		['#employee-initials', employeeProfile.initials],
		['#employee-full-name', employeeProfile.fullName],
		[
			'#employee-summary-line',
			`In company since ${employeeProfile.joinedYear} · ARASAKA ID ${employeeProfile.arasakaId} · Grade ${employeeProfile.grade}`
		],
		['#employee-bio', employeeProfile.bio],
		['#employee-github', employeeProfile.githubUrl],
		['#employee-corp-number', employeeProfile.corporateNumber],
		['#employee-email', employeeProfile.email]
	];

	bindings.forEach(([selector, value]) => {
		const node = document.querySelector(selector);

		if (node) {
			node.textContent = value;
		}
	});
}

if (authForm) {
	authForm.addEventListener('submit', (event) => {
		event.preventDefault();

		if (!authGatewayOnline) {
			setMessage(messages.maintenance, 'error');
			return;
		}

		const email = emailInput.value.trim();
		const password = passwordInput.value.trim();

		if (email === validEmail && password === validPassword) {
			setMessage(messages.success, 'success');

			window.setTimeout(() => {
				window.location.href = redirectPath;
			}, 900);

			return;
		}

		setMessage(messages.invalid, 'error');
	});
}

renderTaskList();
renderEmployeeProfile();
