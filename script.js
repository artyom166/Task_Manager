window.onload = () => {
  createTaskWindow();
  openTaskWindow();
  setupSearchFunctionality();
  loadTasks(); 
};

function createTaskWindow() {
  let div = document.createElement('div');
  let paragraph = document.createElement("p");
  let taskCreateBtn = document.createElement("button");
  taskCreateBtn.id = 'taskCreateBtn';
  taskCreateBtn.textContent = "Ստեղծել";
  paragraph.textContent = "Առաջադրանքների կառավարիչ";
  paragraph.classList.add('paragraf');
  let name = document.createElement('input');
  name.placeholder = "Անվանում";
  name.id = 'name';

  let description = document.createElement('textarea');
  description.placeholder = "Նկարագրություն";
  description.id = 'description';

  div.appendChild(paragraph);
  div.appendChild(name);
  div.appendChild(description);
  div.appendChild(taskCreateBtn);
  document.getElementById('tasklist').appendChild(div);

  taskCreateBtn.onclick = () => {
    document.getElementById('tasklist').style.display = "none";
    let dateTask = formatted_date();
    let taskInfo = saveTaskInfo(dateTask);
    addTask(taskInfo, false, false);
    saveTasks(); // Save tasks after adding a new one
  };

  function addTask(taskInfo, isChecked, isDeleted) {
    let taskContainer = isDeleted ? document.getElementById("trash-tasks") : (isChecked ? document.getElementById("checked-tasks") : document.getElementById("task"));
    let taskDiv = document.createElement("div");
    taskDiv.className = "taskdiv";

    let infoDiv = document.createElement("div");
    infoDiv.className = "taskinfo";

    let deleteBtn = document.createElement("button");
    deleteBtn.className = "delete-btn";
    deleteBtn.textContent = "X";
    deleteBtn.onclick = () => {
      taskContainer.removeChild(taskDiv);
      addTask(taskInfo, false, true);
      saveTasks(); // Save tasks after deletion
    };

    let restoreBtn = document.createElement("button");
    restoreBtn.className = "restore-btn";
    restoreBtn.textContent = "Վերականգնել";
    restoreBtn.onclick = () => {
      taskContainer.removeChild(taskDiv);
      addTask(taskInfo, false, false);
      saveTasks(); // Save tasks after restoration
    };

    let taskName = document.createElement("p");
    let taskDate = document.createElement("p");
    let taskDesc = document.createElement("p");
    let checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.className = "checkbox";
    checkbox.checked = isChecked;
    checkbox.onclick = () => {
      taskContainer.removeChild(taskDiv);
      addTask(taskInfo, checkbox.checked, false);
      saveTasks(); // Save tasks after checkbox change
    };

    taskName.innerHTML = `<strong>Անուն:</strong> ${taskInfo.name}`;
    taskDate.innerHTML = `<strong>Ամսաթիվ:</strong> ${taskInfo.date}`;
    taskDesc.innerHTML = `<strong>Նկարագրություն:</strong> ${taskInfo.description}`;

    infoDiv.appendChild(taskName);
    infoDiv.appendChild(taskDate);
    infoDiv.appendChild(taskDesc);
    taskDiv.appendChild(checkbox);
    taskDiv.appendChild(infoDiv);

    if (!isDeleted) {
      taskDiv.appendChild(deleteBtn);
    } else {
      taskDiv.appendChild(restoreBtn);
      let permanentlyDeleteBtn = document.createElement("button");
      permanentlyDeleteBtn.className = "delete-btn";
      permanentlyDeleteBtn.textContent = "Ընդմիշտ ջնջել";
      permanentlyDeleteBtn.onclick = () => {
        taskContainer.removeChild(taskDiv);
        saveTasks(); // Save tasks after permanent deletion
      };
      taskDiv.appendChild(permanentlyDeleteBtn);
    }

    taskContainer.appendChild(taskDiv);

    taskDesc.onclick = () => {
      editTaskDescription(taskDiv, taskInfo);
    };
  }
}

function formatted_date() {
  let d = new Date();
  return `${d.getFullYear()}/${d.getMonth() + 1}/${d.getDate()} ${d.getHours()}:${d.getMinutes()}`;
}

function openTaskWindow() {
  let openTaskBtn = document.getElementById("open-task-btn");
  let tasklist = document.getElementById('tasklist');

  openTaskBtn.onclick = () => {
    tasklist.style.display = "block";
  };
}

function saveTaskInfo(date) {
  const name = document.getElementById("name");
  const description = document.getElementById("description");

  let newTask = {
    name: name.value,
    date: date,
    description: description.value
  };

  name.value = "";
  description.value = "";

  return newTask;
}

function setupSearchFunctionality() {
  let searchInput = document.querySelector('#first_part input');

  searchInput.addEventListener('input', () => {
    let filter = searchInput.value.toLowerCase();
    let tasks = document.querySelectorAll('.taskdiv');

    tasks.forEach(task => {
      let taskName = task.querySelector('.taskinfo p').textContent.toLowerCase();
      if (taskName.includes(filter)) {
        task.style.display = "";
      } else {
        task.style.display = "none";
      }
    });
  });
}

function editTaskDescription(taskDiv, taskInfo) {
  let taskDesc = taskDiv.querySelector('.taskinfo p:nth-child(3)');
  let newDesc = prompt("Edit Description:", taskInfo.description);
  if (newDesc !== null) {
    taskInfo.description = newDesc;
    taskDesc.innerHTML = `<strong>Description:</strong> ${newDesc}`;
    saveTasks(); // Save tasks after description edit
  }
}

function saveTasks() {
  // Get tasks from each section
  let tasks = {
    task: [],
    checked: [],
    trash: []
  };

  document.querySelectorAll('#task .taskdiv').forEach(taskDiv => {
    let taskInfo = extractTaskInfo(taskDiv);
    tasks.task.push(taskInfo);
  });

  document.querySelectorAll('#checked-tasks .taskdiv').forEach(taskDiv => {
    let taskInfo = extractTaskInfo(taskDiv);
    tasks.checked.push(taskInfo);
  });

  document.querySelectorAll('#trash-tasks .taskdiv').forEach(taskDiv => {
    let taskInfo = extractTaskInfo(taskDiv);
    tasks.trash.push(taskInfo);
  });

  // Save tasks to localStorage
  localStorage.setItem('tasks', JSON.stringify(tasks));
}

function loadTasks() {
  // Load tasks from localStorage
  let tasks = JSON.parse(localStorage.getItem('tasks'));

  if (tasks) {
    tasks.task.forEach(taskInfo => addTask(taskInfo, false, false));
    tasks.checked.forEach(taskInfo => addTask(taskInfo, true, false));
    tasks.trash.forEach(taskInfo => addTask(taskInfo, false, true));
  }
}

function extractTaskInfo(taskDiv) {
  let taskName = taskDiv.querySelector('.taskinfo p:nth-child(1)').textContent.replace('Անուն:', '').trim();
  let taskDate = taskDiv.querySelector('.taskinfo p:nth-child(2)').textContent.replace('Ամսաթիվ:', '').trim();
  let taskDesc = taskDiv.querySelector('.taskinfo p:nth-child(3)').textContent.replace('Նկարագրություն:', '').trim();

  return {
    name: taskName,
    date: taskDate,
    description: taskDesc
  };
}
