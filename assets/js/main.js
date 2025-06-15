const $ = document.querySelector.bind(document)
const $$ = document.querySelectorAll.bind(document)

const addBtn = $(".add-btn")
const formApp = $("#addTaskModal")
const modalClose = $(".modal-close")
const btnClose = $(".btn-close")
const todoForm = $(".todo-app-form")
const taskTitle = $("#taskTitle")
const todoList = $("#todoList")
const searchInput = $(".search-input")

searchInput.oninput = function (event) {
  console.log(event.target.value)
}

let editIndex = null

addBtn.onclick = function () {
  handleOpenModal()

  setTimeout(() => taskTitle.focus(), 100)
}

todoList.onclick = function (event) {
  const editBtn = event.target.closest(".edit-btn")
  const deleteBtn = event.target.closest(".delete-btn")
  const completeBtn = event.target.closest(".complete-btn")

  if (editBtn) {
    const taskIndex = editBtn.dataset.index
    const task = todoTask[taskIndex]

    editIndex = taskIndex

    for (const key in task) {
      const input = $(`[name="${key}"]`)
      if (input) input.value = task[key]
    }

    handleOpenModal()

    const formTitle = formApp.querySelector(".modal-title")
    if (formTitle) {
      formTitle.dataset.original = formTitle.textContent
      formTitle.textContent = "Edit Task"
    }

    const btnSubmit = formApp.querySelector(".btn-submit")
    if (btnSubmit) {
      btnSubmit.dataset.original = btnSubmit.textContent
      btnSubmit.textContent = "Save"
    }
  }

  if (deleteBtn) {
    const taskIndex = deleteBtn.dataset.index
    const task = todoTask[taskIndex]

    if (confirm(`Bạn có muốn xóa công việc ${task.title} không?`)) {
      todoTask.splice(taskIndex, 1)
      saveTodoTask()
      renderTask()
    }
  }

  if (completeBtn) {
    const taskIndex = completeBtn.dataset.index
    const task = todoTask[taskIndex]

    editIndex = taskIndex

    for (const key in task) {
      const input = $(`[name="${key}"]`)
      if (input) input.value = task[key]
    }

    handleOpenModal()

    const formTitle = formApp.querySelector(".modal-title")
    if (formTitle) {
      formTitle.dataset.original = formTitle.textContent
      formTitle.textContent = "Cập nhật tiến độ"
    }

    const btnSubmit = formApp.querySelector(".btn-submit")
    if (btnSubmit) {
      btnSubmit.dataset.original = btnSubmit.textContent
      btnSubmit.textContent = "Cập nhật"
    }
  }
}

function handleOpenModal() {
  formApp.classList.add("show")
}

function handleCloseModal() {
  formApp.classList.remove("show")

  if (editIndex !== null) {
    const formTitle = formApp.querySelector(".modal-title")
    if (formTitle?.dataset.original) {
      formTitle.textContent = formTitle.dataset.original
      delete formTitle.dataset.original
    }

    const btnSubmit = formApp.querySelector(".btn-submit")
    if (btnSubmit?.dataset.original) {
      btnSubmit.textContent = btnSubmit.dataset.original
      delete btnSubmit.dataset.original
    }
  }

  formApp.querySelector(".modal").scrollTop = 0
  todoForm.reset()
  editIndex = null
}

modalClose.onclick = btnClose.onclick = handleCloseModal

const todoTask = JSON.parse(localStorage.getItem("todoTasks")) ?? []

todoForm.onsubmit = function (event) {
  event.preventDefault()

  const formData = Object.fromEntries(new FormData(todoForm))

  // Xử lý phần trăm
  formData.percent = Number(formData.percent || 0)
  formData.isCompleted = formData.percent >= 100

  if (editIndex !== null) {
    todoTask[editIndex] = formData
  } else {
    todoTask.push(formData)
  }

  saveTodoTask()
  renderTask()
  handleCloseModal()
}

function saveTodoTask() {
  localStorage.setItem("todoTasks", JSON.stringify(todoTask))
}

function renderTask() {
  if (!todoTask.length) {
    todoList.innerHTML = `<h3 class="no-task">Việc chưa có nhìn cái gì ?</h3>`
    return
  }

  const html = todoTask
    .map((task, index) => {
      const statusText =
        task.percent >= 100 ? "Đã hoàn thành" : "Chưa hoàn thành"
      const statusColor = task.percent >= 100 ? "green" : "red"

      return `
      <div class="task-card ${
        task.isCompleted ? "completed" : ""
      }" style="--card-color:${task.color}">
        <div class="task-header">
          <h3 class="task-title">${task.title}</h3>
          <button class="task-menu">
            <i class="fa-solid fa-ellipsis fa-icon"></i>
            <div class="dropdown-menu">
              <div class="dropdown-item edit-btn" data-index="${index}">
                <i class="fa-solid fa-pen-to-square fa-icon"></i>
                Edit
              </div>
              <div class="dropdown-item complete complete-btn" data-index="${index}">
                <i class="fa-solid fa-check fa-icon"></i>
                Cập nhật tiến độ
              </div>
              <div class="dropdown-item delete delete-btn" data-index="${index}">
                <i class="fa-solid fa-trash fa-icon"></i>
                Delete
              </div>
            </div>
          </button>
        </div>
        <p class="task-description">${task.description}</p>
        <div class="task-time">${task.start_time} - ${task.end_time}</div>
        <div class="task-status" style="color:${statusColor}">
          ${statusText} (${task.percent || 0}%)
        </div>
      </div>
      `
    })
    .join("")

  todoList.innerHTML = html
}

renderTask()
