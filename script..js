document.addEventListener("DOMContentLoaded", () => {
    const loginContainer = document.getElementById("login-container");
    const registerContainer = document.getElementById("register-container");
    const tasksContainer = document.getElementById("tasks-container");
    const loginForm = document.getElementById("login-form");
    const registerForm = document.getElementById("register-form");
    const logoutButton = document.getElementById("logout");
    const taskForm = document.getElementById("task-form");
    const taskGroups = document.getElementById("task-groups");
    const notificationSound = document.getElementById("notification-sound");

    let currentUser = localStorage.getItem("currentUser");

    function showSection(section) {
        loginContainer.classList.add("hidden");
        registerContainer.classList.add("hidden");
        tasksContainer.classList.add("hidden");
        section.classList.remove("hidden");
    }

    if (currentUser) {
        showSection(tasksContainer);
        loadTasks();
        checkPendingTasks();
    } else {
        showSection(loginContainer);
    }

    loginForm.addEventListener("submit", (e) => {
        e.preventDefault();
        const user = document.getElementById("login-user").value;
        const pass = document.getElementById("login-pass").value;

        const users = JSON.parse(localStorage.getItem("users")) || [];
        const foundUser = users.find(u => u.username === user && u.password === pass);

        if (foundUser) {
            localStorage.setItem("currentUser", user);
            showSection(tasksContainer);
            loadTasks();
            checkPendingTasks();
        } else {
            alert("Usuario o contraseña incorrectos");
        }
    });

    registerForm.addEventListener("submit", (e) => {
        e.preventDefault();
        const user = document.getElementById("register-user").value;
        const pass = document.getElementById("register-pass").value;

        let users = JSON.parse(localStorage.getItem("users")) || [];
        if (users.find(u => u.username === user)) {
            alert("El usuario ya existe");
            return;
        }

        users.push({ username: user, password: pass });
        localStorage.setItem("users", JSON.stringify(users));
        alert("Registro exitoso. Ahora inicia sesión.");
        showSection(loginContainer);
    });

    logoutButton.addEventListener("click", () => {
        localStorage.removeItem("currentUser");
        location.reload();
    });

    taskForm.addEventListener("submit", (e) => {
        e.preventDefault();
        const taskInput = document.getElementById("task").value;
        const taskTime = document.getElementById("task-time").value;
        addTask(taskInput, taskTime, false);
        saveTask(taskInput, taskTime, false);
        taskForm.reset();
    });

    function loadTasks() {
        taskGroups.innerHTML = "";
        const tasks = JSON.parse(localStorage.getItem(`tasks_${currentUser}`)) || [];
        const groupedTasks = groupTasksByDate(tasks);

        for (const date in groupedTasks) {
            const section = document.createElement("div");
            section.innerHTML = `<h3>${date}</h3><ul id="list-${date}"></ul>`;
            taskGroups.appendChild(section);
            groupedTasks[date].forEach(task => addTask(task.text, task.time, task.completed, date));
        }
    }

    function addTask(text, time, completed, date = formatDate(time)) {
        const taskItem = document.createElement("li");
        taskItem.innerHTML = `
            <span>${text} - ${new Date(time).toLocaleTimeString()}</span>
            <input type='checkbox' class='mark-done' ${completed ? "checked" : ""}>
        `;

        if (completed || new Date(time) < new Date()) {
            taskItem.classList.add("completed");
        }

        document.getElementById(`list-${date}`).appendChild(taskItem);
    }

    function saveTask(text, time, completed) {
        const tasks = JSON.parse(localStorage.getItem(`tasks_${currentUser}`)) || [];
        tasks.push({ text, time, completed });
        localStorage.setItem(`tasks_${currentUser}`, JSON.stringify(tasks));
    }

    function groupTasksByDate(tasks) {
        return tasks.reduce((acc, task) => {
            const date = formatDate(task.time);
            acc[date] = acc[date] || [];
            acc[date].push(task);
            return acc;
        }, {});
    }

    function formatDate(date) {
        return new Date(date).toLocaleDateString();
    }

    function checkPendingTasks() {
        const tasks = JSON.parse(localStorage.getItem(`tasks_${currentUser}`)) || [];
        const now = new Date();

        tasks.forEach(task => {
            const taskTime = new Date(task.time);
            if (taskTime > now && !task.completed) {
                setTimeout(() => {
                    showNotification(task.text);
                }, taskTime - now);
            }
        });
    }

    function showNotification(taskText) {
        if (Notification.permission === "granted") {
            new Notification("Tarea pendiente", { body: taskText });
            notificationSound.play();
        } else if (Notification.permission !== "denied") {
            Notification.requestPermission().then(permission => {
                if (permission === "granted") {
                    new Notification("Tarea pendiente", { body: taskText });
                    notificationSound.play();
                }
            });
        }
    }
});
