import React from "react";
import "./App.css";
import { Button, Card, Form } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import ToastList from "./components/toastlist";


function TodoFn({ todo, index, markTodo, removeTodo }) {
  return (
      <div className="todo">
        <span style={{ textDecoration: todo.isDone ? "line-through" : "" }}>{todo.text + '-' + todo.day}</span>
        <div>
          <Button variant="outline-success" onClick={() => markTodo(index)}>✓</Button>{' '}
          <Button variant="outline-danger" onClick={() => removeTodo(index)}>✕</Button>
        </div>
      </div>
  );
}

function FormTodoFn({ addTodo }) {
  const [value, setValue] = React.useState("");

  const handleSubmit = e => {
    e.preventDefault();
    if (!value) return;
    addTodo(value);
    setValue("");
  };

  return (
      <Form onSubmit={handleSubmit}>
        <Form.Group>
          <Form.Control type="text" className="input" value={value} onChange={e => setValue(e.target.value)} placeholder="Add new reminder" />
        </Form.Group>
        <Button variant="primary mb-3" type="submit">
          Submit
        </Button>
      </Form>
  );
}

function getCurrentDate(){
  return Date().toLocaleString();
}

function App() {
  const [todos, setTodos] = React.useState([]);

  const [toasts, setToasts] = React.useState([]);
  const [autoClose, setAutoClose] = React.useState(true);
  const showToast = (message) => {
    const toast = {
      id: Date.now(),
      message,
    };

    console.log("adding toast");
    setToasts((prevToasts) => [...prevToasts, toast]);

    if (autoClose) {
      setTimeout(() => {
        removeToast(toast.id);
      }, 5 * 1000);
    }
  };

  const removeToast = (id) => {
    setToasts((prevToasts) => prevToasts.filter((toast) => toast.id !== id));
  };

  const addTodo = async (reminder) => {
    const id= Math.floor(Math.random()*10000) + 1
    const datetime = getCurrentDate()
    console.log(id + '-time-' + datetime);
    let reminderJson = {
      id:id,
      text:reminder,
      day:datetime,
      isDone:false
    }
    const res = await fetch(`/addreminder`, {
      method:'POST',
      headers: {
        'Content-type': 'application/json'
      },
      body: JSON.stringify(reminderJson)

    })
    const data = await res.json()
    console.log(data);
    showToast("Reminder saved");
  };

  const fetchAllTodos = async () => {
    const res = await fetch(`/fetchreminders`, {
      method:'GET',
      headers: {
        'Content-type': 'application/json'
      },
    });
    console.log("fetching all todos");
    let remoteJson;
    try {
      remoteJson = await res.json();
    } catch (e) {
      console.log(e);
    }
    if (remoteJson === null) {
      return;
    }
    if (remoteJson === '') {
      return;
    }
    let parsedjson;
    try {
      parsedjson = JSON.parse(remoteJson);
    } catch (e) {
      showToast("No reminders to show");
      return;
    }

    //remoteJson.replace(/\\"/g, '"')
    const reminders = [];
    try {
      parsedjson.tasks.forEach((reminder) => {
        const productObj = {
          id: reminder.id,
          text: reminder.text,
          day: reminder.day,
          isDone: false
        };
        reminders.push(productObj);
      });
    } catch (e) {
      console.log(e);
    }
    setTodos(reminders);
  }

  const markTodo = index => {
    const newTodos = [...todos];
    newTodos[index].isDone = true;
    setTodos(newTodos);
  };

  const removeTodo = async (index) => {
    const newTodos = [...todos];
    newTodos.splice(index, 1);
    setTodos(newTodos);
  };

  const removeAllTodo = async () => {
    const res = await fetch(`/deleteallreminder` );
    const data = await res.json()
    console.log(data);
    setTodos([]);
  };

  return (
      <div className="app">
        <div className="container">
          <h1 className="text-center mb-4">My Todo List</h1>
          <FormTodoFn addTodo={addTodo} />
          <div>
            {todos.map((todo, index) => (
                <Card>
                  <Card.Body>
                    <TodoFn
                        key={index}
                        index={index}
                        todo={todo}
                        markTodo={markTodo}
                        removeTodo={removeTodo}
                    />
                  </Card.Body>
                </Card>
            ))}
          </div>
          <div>
            <Button variant="primary mb-3" type="fetch" onClick={fetchAllTodos}>
              Fetch all reminders
            </Button>
          </div>
        </div>
        <ToastList data={toasts} position="bottom-right" removeToast={removeToast} />
      </div>
  );
}

export default App;