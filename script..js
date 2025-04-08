document.addEventListener("DOMContentLoaded", () => {
    const loginContainer = document.getElementById("login-container");
    const registerContainer = document.getElementById("register-container");
    const tasksContainer = document.getElementById("tasks-container");
    const loginForm = document.getElementById("login-form");
    const registerForm = document.getElementById("register-form");
    const showRegister = document.getElementById("show-register");
    const showLogin = document.getElementById("show-login");
    const logoutButton = document.getElementById("logout");
    const taskForm = document.getElementById("task-form");
    const taskList = document.getElementById("task-list");

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
    } else {
        showSection(loginContainer);
    }

    showRegister.addEventListener("click", () => showSection(registerContainer));
    showLogin.addEventListener("click", () => showSection(loginContainer));

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
        addTaskToList(taskInput, taskTime, false);
        saveTask(taskInput, taskTime, false);
        taskForm.reset();
    });

    function loadTasks() {
        taskList.innerHTML = "";
        const tasks = JSON.parse(localStorage.getItem(`tasks_${currentUser}`)) || [];
        tasks.forEach((task, index) => addTaskToList(task.text, task.time, task.completed, index));
    }

    function addTaskToList(text, time, completed, index) {
        const taskItem = document.createElement("li");
        taskItem.classList.toggle("completed", completed);
        taskItem.innerHTML = `
            <span>${text} - ${new Date(time).toLocaleString()}</span>
            <input type='checkbox' class='mark-done' ${completed ? "checked" : ""} data-index="${index}">
            ${completed ? `<button class="delete-task" data-index="${index}">Eliminar</button>` : ""}
        `;
       
        // Agregar eventos para marcar tarea como completada
        const checkbox = taskItem.querySelector(".mark-done");
        checkbox.addEventListener("change", () => toggleTaskCompletion(index));

        // Agregar el evento de eliminación para el botón de eliminar
        const deleteButton = taskItem.querySelector(".delete-task");
        if (deleteButton) {
            deleteButton.addEventListener("click", () => deleteTask(index));
        }

        taskList.appendChild(taskItem);
    }

    function saveTask(text, time, completed) {
        const tasks = JSON.parse(localStorage.getItem(`tasks_${currentUser}`)) || [];
        tasks.push({ text, time, completed });
        localStorage.setItem(`tasks_${currentUser}`, JSON.stringify(tasks));
    }

    function deleteTask(index) {
        const tasks = JSON.parse(localStorage.getItem(`tasks_${currentUser}`)) || [];
        tasks.splice(index, 1); // Eliminar la tarea
        localStorage.setItem(`tasks_${currentUser}`, JSON.stringify(tasks));
        loadTasks(); // Volver a cargar las tareas
    }

    function toggleTaskCompletion(index) {
        const tasks = JSON.parse(localStorage.getItem(`tasks_${currentUser}`)) || [];
        tasks[index].completed = !tasks[index].completed;
        localStorage.setItem(`tasks_${currentUser}`, JSON.stringify(tasks));
        loadTasks(); // Volver a cargar las tareas
    }
    });