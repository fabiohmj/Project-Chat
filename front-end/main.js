import { io } from "https://cdn.socket.io/4.7.2/socket.io.esm.min.js";

let username = '';
let userList = [];
let socket = null;

const loginPage = document.querySelector('#loginPage');
const chatPage = document.querySelector('#chatPage');

const loginInput = document.querySelector('#loginNameInput');
const textInput = document.querySelector('#chatTextInput');

loginPage.style.display = 'flex';
chatPage.style.display = 'none';
loginInput.focus();

function renderUserList(list) {
  let ul = document.querySelector('.userList');
  ul.innerHTML = '';
  list.forEach(user => {
    let li = document.createElement('li');
    li.textContent = user;
    ul.appendChild(li);
  });
}

function addMessageToChat(type, user, msg) {
  let ul = document.querySelector('.chatList');
  switch (type) {
    case 'status':
      ul.innerHTML += `<li class="m-status"><span class='status'>${msg}</li>`;
      break;
    case 'msg':
      if (user === username) {
        ul.innerHTML += `<li class="m-txt"><span class='me'>${user}:</span> ${msg}</li>`;
      } else {
        ul.innerHTML += `<li class="m-txt"><span>${user}:</span> ${msg}</li>`;
      }
      break;
  }
}

loginInput.addEventListener('keyup', (event) => {
  if (event.key === 'Enter') {
    username = loginInput.value.trim();
    if (username) {
      socket = io("http://localhost:3000", {
        query: {
          username: username,
        },
      });

      socket.on('connect', () => {
        socket.emit('join-request', username);
      });

      socket.on('user-exists', () => {
        alert(`Existe um usuário com nome${username} no chat no momento. Por favor, escolha outro nome.`);
        loginInput.value = '';
        username = '';
      });

      socket.on('user-ok', (data) => {
        document.title = `Chat - ${username}`;
        loginPage.style.display = 'none';
        chatPage.style.display = 'flex';
        textInput.focus();
        if (data.joined === username) {
          addMessageToChat('status', '', `Bem-vindo ao chat, ${username}!`);
        }
        userList = data.list;
        renderUserList(userList);
      });

      socket.on('list-update', (data) => {
        if (data.joined && data.joined !== username) {
          addMessageToChat('status', '', `${data.joined} entrou no chat.`);
          userList.push(data.joined);
        } else if (data.left && data.left !== username) {
          addMessageToChat('status', '', `${data.left} saiu do chat.`);
          userList = userList.filter(user => user !== data.left);
        }
        userList = data.list;
        renderUserList(userList);
      });

      socket.on('show-msg', (data) => {
        addMessageToChat('msg', data.user, data.text);
      });

      socket.on('disconnect', () => {
        addMessageToChat('status', '', 'Você foi desconectado do chat.');


      });

    } else {
      alert('Digite um nome de usuário válido.');
    }
  }
});

textInput.addEventListener('keyup', (event) => {
  if (event.key === 'Enter') {
    const text = textInput.value.trim();
    textInput.value = '';
    if (text !== '') {
      socket.emit('send-msg', {
        user: username,
        text: text
      });
    }
  }
})