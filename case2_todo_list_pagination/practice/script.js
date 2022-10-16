;(function () {
  'use strict'

  const get = (target) => {
    return document.querySelector(target)
  }

  const $todos = get('.todos')
  const $form = get('.todo_form')
  const $todoInput = get('.todo_input')
  const API_URL = `http://localhost:3000/todos`
  const $pageNation = get('.pagination')

  let currentPage = 1 // 현재 페이지
  const totalCount = 100 // 총 데이터 개수
  const limit = 5 // 한페이지에서 몇개씩 보여줄지 정하는 변수

  const pagenation = () => {
    // 1-1. 밑에 페이지 몇개까지 보이게 할지 계산하기 11페이지 나옴
    const totalPage = Math.ceil(totalCount / limit)

    // 1-2. 현재 내가 몇번째 페이지에 속해있는지 알기위해 변수계산
    // 현재 내가 속해있는 페이지가 몇번째에 있는지 = 현재 페이지 / 페이지 카운트 => 1
    const pageCount = 5 // 페이지를 5개씩 보여줄거니까 5개 1, 2, 3, 4, 5.. 이런식
    const pageGroup = Math.ceil(currentPage / pageCount)

    // 1-3. 현재 페이지 그룹의 첫번째 /마지막 숫자 구하기.
    // 이걸 알아야 현재 페이지 그룹의 첫번째 ~ 마지막 숫자만큼 페이지를 화면에 표시가능하다.
    // 그리고 페이지네이션의 이전, 다음을 구현가능할 수 있음. 이전 그룹으로넘겨주고 다음누르면
    // 다음 - 6789... 이런식으로 보여준다.
    let lastNumber = pageGroup * pageCount
    // 예 ) 1페이지에있다면 * 5 => 5까지 보여줌
    // 예2 ) 내가 3페이지에 있다면 * 5 => 15까지 보여준다.
    if (lastNumber > totalPage) {
      lastNumber = totalPage
    } // 조건을 걸어서 토탈 페이지 이상 못넘어가게 해주기

    let firstNumber = lastNumber - (pageCount - 1)
    // 예) 마지막넘버가 5라면 - (페이지카운트 5 - 1) = 1부터 보여준다.  1, 2, 3, 4, 5
    // 예2) 마지막넘버가 15라면 - (5 - 1) => 11부터 보여준다.  11, 12, 13, 14, 15

    // 1-4. 다음, 이전 버튼 계산
    const next = lastNumber + 1 // 6부터 보여주기
    const prev = firstNumber - 1 // 이전으로 돌아가야하니까 11이면 10으로보여줘야하는것.

    // 1-5. html DOM요소에 집어넣기
    let html = ''
    if (prev > 0) {
      // 이렇게 해줘야 -1 -2 -3으로 안나간다. 버튼도 1페이지 부분에선 이전버튼이 없어짐
      html += `<button class='prev' data-fn='prev'>이전</button>`
    }
    for (let i = firstNumber; i <= lastNumber; i++) {
      html += `<button class="pageNumber" id="page_${i}">${i}</button>`
    }
    if (lastNumber < totalPage) {
      html += `<button class='next' data-fn='next'>다음</button>`
    }
    $pageNation.innerHTML = html

    // 1-6. 내가지금 현재 어디페이지에 있는지 알기 위해 폰트색상 차별화두기
    const $currentPageNumber = get(`.pageNumber#page_${currentPage}`)
    $currentPageNumber.style.color = '#9dc0e8'

    // 1-7. 다음이나 이전을 누를 때 1, 2, 3, 4, 5에서 => 6, 7, 8, 9, 10 이렇게
    // 페이지를 새로고침 해줘야 할것이다.
    // 페이지 버튼들 다가져오기
    const $currentPageNumbers = document.querySelectorAll('.pagination button')

    console.log($currentPageNumbers) // NodeList로 받아와진다. 실시간변경되지않는 NodeList
    // 하나하나 돌면서 button 요소에 event 등록하기
    $currentPageNumbers.forEach((button) => {
      button.addEventListener('click', () => {
        if (button.dataset.fn === 'prev') currentPage = prev
        else if (button.dataset.fn === 'next') currentPage = next
        else currentPage = button.innerText
        pagenation()
        getTodos()
      })
    })
  }

  const createTodoElement = (item) => {
    const { id, content, completed } = item
    const isChecked = completed ? 'checked' : ''
    const $todoItem = document.createElement('div')
    $todoItem.classList.add('item')
    $todoItem.dataset.id = id
    $todoItem.innerHTML = `
            <div class="content">
              <input
                type="checkbox"
                class='todo_checkbox' 
                ${isChecked}
              />
              <label>${content}</label>
              <input type="text" value="${content}" />
            </div>
            <div class="item_buttons content_buttons">
              <button class="todo_edit_button">
                <i class="far fa-edit"></i>
              </button>
              <button class="todo_remove_button">
                <i class="far fa-trash-alt"></i>
              </button>
            </div>
            <div class="item_buttons edit_buttons">
              <button class="todo_edit_confirm_button">
                <i class="fas fa-check"></i>
              </button>
              <button class="todo_edit_cancel_button">
                <i class="fas fa-times"></i>
              </button>
            </div>
      `
    return $todoItem
  }

  const renderAllTodos = (todos) => {
    $todos.innerHTML = ''
    todos.forEach((item) => {
      const todoElement = createTodoElement(item)
      $todos.appendChild(todoElement)
    })
  }

  const getTodos = () => {
    // fetch URL 쿼리문으로 바꿔서 제한적으로 보이게 하기
    fetch(`${API_URL}?_page=${currentPage}&_limit=${limit}`)
      .then((response) => response.json())
      .then((todos) => {
        renderAllTodos(todos)
      })
      .catch((error) => console.error(error.message))
  }

  const addTodo = (e) => {
    e.preventDefault()
    const content = $todoInput.value
    if (!content) return
    const todo = {
      content,
      completed: false,
    }
    fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-type': 'application/json' },
      body: JSON.stringify(todo),
    })
      .then((response) => response.json())
      .then(getTodos)
      .then(() => {
        $todoInput.value = ''
        $todoInput.focus()
      })
      .catch((error) => console.error(error.message))
  }

  const toggleTodo = (e) => {
    if (e.target.className !== 'todo_checkbox') return
    const $item = e.target.closest('.item')
    const id = $item.dataset.id
    const completed = e.target.checked
    fetch(`${API_URL}/${id}`, {
      method: 'PATCH',
      headers: { 'Content-type': 'application/json' },
      body: JSON.stringify({ completed }),
    })
      .then((response) => response.json())
      .then(getTodos)
      .catch((error) => console.error(error.message))
  }

  const changeEditMode = (e) => {
    const $item = e.target.closest('.item')
    const $label = $item.querySelector('label')
    const $editInput = $item.querySelector('input[type="text"]')
    const $contentButtons = $item.querySelector('.content_buttons')
    const $editButtons = $item.querySelector('.edit_buttons')
    const value = $editInput.value

    if (e.target.className === 'todo_edit_button') {
      $label.style.display = 'none'
      $editInput.style.display = 'block'
      $contentButtons.style.display = 'none'
      $editButtons.style.display = 'block'
      $editInput.focus()
      $editInput.value = ''
      $editInput.value = value
    }

    if (e.target.className === 'todo_edit_cancel_button') {
      $label.style.display = 'block'
      $editInput.style.display = 'none'
      $contentButtons.style.display = 'block'
      $editButtons.style.display = 'none'
      $editInput.value = $label.innerText
    }
  }

  const editTodo = (e) => {
    if (e.target.className !== 'todo_edit_confirm_button') return
    const $item = e.target.closest('.item')
    const id = $item.dataset.id
    const $editInput = $item.querySelector('input[type="text"]')
    const content = $editInput.value

    fetch(`${API_URL}/${id}`, {
      method: 'PATCH',
      headers: { 'Content-type': 'application/json' },
      body: JSON.stringify({ content }),
    })
      .then((response) => response.json())
      .then(getTodos)
      .catch((error) => console.error(error.message))
  }

  const removeTodo = (e) => {
    if (e.target.className !== 'todo_remove_button') return
    const $item = e.target.closest('.item')
    const id = $item.dataset.id

    fetch(`${API_URL}/${id}`, {
      method: 'DELETE',
    })
      .then((response) => response.json())
      .then(getTodos)
      .catch((error) => console.error(error.message))
  }

  const init = () => {
    window.addEventListener('DOMContentLoaded', () => {
      getTodos()
      // 1. 페이지네이션함수를 init에 추가한다.
      pagenation()
    })

    $form.addEventListener('submit', addTodo)
    $todos.addEventListener('click', toggleTodo)
    $todos.addEventListener('click', changeEditMode)
    $todos.addEventListener('click', editTodo)
    $todos.addEventListener('click', removeTodo)
  }

  init()
})()

// 내가 하면서 느꼈던 것들
// 1. 먼저 인잇에 무엇을 추가해야하는지 생각하기
// 2. 그리고 인잇에 내가 구현할 함수를 생각 했다면 (예를들어 페이지)
// 3. 그안에 필요한 구현기능을 제어할 변수를 생각해보기.
// 4. 어떻게 움직일지 수학적으로 생각해보기 페이지를 어떻게 보여줄것인지에 대한..
// 5. 기능버튼들이나 요소를 돔에 그려주기 (쓰기위해) // 먼저 그리면서 변수를 정해줘도 될듯
// 6. 이벤트 등록해주기 기능이 구현되게
