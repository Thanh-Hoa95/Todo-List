const $ = document.querySelector.bind(document);
const $$ = document.querySelectorAll.bind(document);

const addBtn = $(".add-btn");
const formApp = $("#addTaskModal");
const modalClose = $(".modal-close");
const btnClose = $(".btn-close");
const todoForm = $(".todo-app-form");
const taskTitle = $("#task1");
const todoList = $("#todoList");
const searchInput = $(".search-input");

const inputDate = $("#taskDate");
const output = $(".formatted-date");

let editIndex = null;
const days = ["Chủ Nhật", "Thứ Hai", "Thứ Ba", "Thứ Tư", "Thứ Năm", "Thứ Sáu", "Thứ Bảy"];

addBtn.onclick = function () {
    handleOpenModal();
};

todoList.onclick = function (event) {
    const taskHeader = event.target.closest(".task-header");

    if (taskHeader) {
        const editBtn = event.target.closest(".edit-btn");
        const deleteBtn = event.target.closest(".delete-btn");
        const completeBtn = event.target.closest(".complete-btn");
        const taskIndex = taskHeader.dataset.index;
        const task = todoTask[taskIndex];
        output.textContent = formattedDate(task.dueDate);

        if (editBtn) {
            editIndex = taskIndex;

            for (const key in task) {
                const input = $(`[name="${key}"]`);
                if (input) input.value = task[key];
            }

            handleOpenModal();

            const formTitle = formApp.querySelector(".modal-title");
            if (formTitle) {
                formTitle.dataset.original = formTitle.textContent;
                formTitle.textContent = "Edit Task";
            }

            const btnSubmit = formApp.querySelector(".btn-submit");

            if (btnSubmit) {
                btnSubmit.dataset.original = btnSubmit.textContent;
                btnSubmit.textContent = "Save";
            }
        }

        if (deleteBtn) {
            if (confirm(`Bạn có muốn xóa công việc ${task.title} không?`)) {
                todoTask.splice(taskIndex, 1);
                saveTodoTask();
                renderTask(todoTask);
            }
        }

        if (completeBtn) {
            editIndex = taskIndex;

            for (const key in task) {
                const input = $(`[name="${key}"]`);
                if (input) input.value = task[key];
            }

            handleOpenModal();

            const formTitle = formApp.querySelector(".modal-title");
            if (formTitle) {
                formTitle.dataset.original = formTitle.textContent;
                formTitle.textContent = "Progress Update:";
            }

            const btnSubmit = formApp.querySelector(".btn-submit");
            if (btnSubmit) {
                btnSubmit.dataset.original = btnSubmit.textContent;
                btnSubmit.textContent = "Update";
            }
        }
    }
};

function handleOpenModal() {
    formApp.classList.add("show");
    setTimeout(() => taskTitle.focus(), 200);
}

function handleCloseModal() {
    formApp.classList.remove("show");

    if (editIndex !== null) {
        const formTitle = formApp.querySelector(".modal-title");
        if (formTitle?.dataset.original) {
            formTitle.textContent = formTitle.dataset.original;
            delete formTitle.dataset.original;
        }

        const btnSubmit = formApp.querySelector(".btn-submit");
        if (btnSubmit?.dataset.original) {
            btnSubmit.textContent = btnSubmit.dataset.original;
            delete btnSubmit.dataset.original;
        }
    }

    formApp.querySelector(".modal").scrollTop = 0;
    todoForm.reset();
    editIndex = null;
}

modalClose.onclick = btnClose.onclick = handleCloseModal;

let todoTask = JSON.parse(localStorage.getItem("todoTasks")) ?? [];

searchInput.oninput = function (event) {
    const keyword = event.target.value.toLowerCase();
    const filtered = todoTask.filter((task) => task.dueDate.toLowerCase().includes(keyword));
    renderTask(filtered);
};

function formattedDate(dates) {
    const day = days[new Date(dates).getDay()];
    const [year, month, date] = dates.split("-");
    return `${day} - ${date}/${month}/${year}`;
}

inputDate.addEventListener("change", function () {
    const rawDate = this.value;
    if (rawDate) {
        output.textContent = formattedDate(rawDate);
    }
});

todoForm.onsubmit = function (event) {
    event.preventDefault();

    const formData = Object.fromEntries(new FormData(todoForm));

    // Xử lý phần trăm
    formData.percent = Number(formData.percent || 0);
    formData.isCompleted = formData.percent >= 100;

    if (editIndex) {
        todoTask[editIndex] = formData;
    } else {
        formData.isCompleted = false;
        todoTask.unshift(formData);
    }

    saveTodoTask();
    renderTask(todoTask);
    handleCloseModal();
};

function saveTodoTask() {
    localStorage.setItem("todoTasks", JSON.stringify(todoTask));
}

function renderTask(tasks) {
    if (!tasks.length) {
        todoList.innerHTML = `
      <div class="no-task">
        <img src="./assets/image/search.svg" alt="" />
        <h3 class="no-task">Việc chưa có nhìn cái gì ?</h3>
      </div>`;
        return;
    }

    const html = tasks
        .map((task, index) => {
            const check = task.percent >= 100 ? "✅" : "⛔";
            const statusText = task.percent >= 100 ? "✅ Đã hoàn thành" : "🛑 Chưa hoàn thành";
            const statusColor = task.percent >= 100 ? "green" : "red";
            let formatDate = "";
            if (task.dueDate) formatDate = formattedDate(task.dueDate);

            return `
      <div style="--card-color:${task.color}" class="task-card ${task.isCompleted ? "completed" : ""}">
        <div class="task-header" data-index="${index}" >
            ${formatDate ? `<h3 class="task-title task-date">${formatDate}</h3>` : "Chưa chọn ngày ❣"}
          <button class="task-menu">
            <i class="fa-solid fa-ellipsis fa-icon"></i>
            <span class="dropdown-menu">
              <span class="dropdown-item edit-btn">
                <i class="fa-solid fa-pen-to-square fa-icon"></i>
                Edit
              </span>
              <span class="dropdown-item complete complete-btn" >
                <i class="fa-solid fa-check fa-icon"></i>
                Cập nhật tiến độ
              </span>
              <span class="dropdown-item delete delete-btn" >
                <i class="fa-solid fa-trash fa-icon"></i>
                Delete
              </span>
            </span>
          </button>
        </div>
        <ul class="todo-list">
          <li><span>${check}</span>
          <p>${task.task1}</p></li>
          ${task.task2 ? `<li><span>${check}</span><p>${task.task2}</p></li>` : ""}
          ${task.task3 ? `<li><span>${check}</span><p>${task.task3}</p></li>` : ""}
          ${task.task4 ? `<li><span>${check}</span><p>${task.task4}</p></li>` : ""}
          ${task.task5 ? `<li><span>${check}</span><p>${task.task5}</p></li>` : ""}
        </ul>
        <div class="task-time">
          ${task.start_time ? task.start_time : "00:00"} - ${task.end_time ? task.end_time : "24:00"}
        </div>
        <div class="task-status" style="color:${statusColor}">
          ${statusText} (${task.percent || 0}%)
        </div>
      </div>
      `;
        })
        .join("");

    todoList.innerHTML = html;
}

renderTask(todoTask);
