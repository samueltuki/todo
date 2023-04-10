import { useRef, useState } from "react";
import { useAuthState } from "react-firebase-hooks/auth";
import { useCollectionData } from "react-firebase-hooks/firestore";
import firebase from "firebase/compat/app";
import "firebase/compat/auth";
import "firebase/compat/firestore";
import { serverTimestamp } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyAsisfAjIu9V7RHPHSWvGalR6hWfilT98I",
  authDomain: "todoapp-4e287.firebaseapp.com",
  projectId: "todoapp-4e287",
  storageBucket: "todoapp-4e287.appspot.com",
  messagingSenderId: "991099317576",
  appId: "1:991099317576:web:383d1cd9ec16e53e1dd77d",
};

firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const firestore = firebase.firestore();

export default function App() {
  const [user] = useAuthState(auth);
  return (
    <div className="App" style={{ margin: "20px" }}>
      <SignIn />
      {user && <TodoList />}
    </div>
  );
}

function SignIn() {
  function googleSignIn() {
    const provider = new firebase.auth.GoogleAuthProvider();
    auth.signInWithPopup(provider);
  }
  return !auth.currentUser ? (
    <button onClick={googleSignIn}>Sign In</button>
  ) : (
    <button onClick={() => auth.signOut()}>Sign Out </button>
  );
}

function TodoList() {
  const { uid, photoURL } = auth.currentUser;
  const todoCollection = firestore.collection("todos");
  const query = todoCollection.where("uid", "==", uid).orderBy("createdAt");
  const [todos] = useCollectionData(query, { idField: "id" });
  const todoText = useRef(0);
  const [hideComplete, setHideComplete] = useState(true);
  const flex = { display: "flex", alignItems: "center", gap: "10px" };

  async function submit(e) {
    e.preventDefault();
    const text = todoText.current.value;
    await todoCollection.add({
      uid,
      text,
      createdAt: serverTimestamp(),
      complete: false,
    });
    todoText.current.value = "";
  }

  async function completed(id) {
    const ref = firestore.collection("todos").doc(id);
    await ref.update({ complete: true });
  }

  async function deleteTodo(id) {
    const ref = firestore.collection("todos").doc(id);
    await ref.delete();
  }
  return (
    <div>
      <img
        src={photoURL}
        alt="profile"
        style={{ width: "50px", borderRadius: "50%" }}
      />
      <h1>Todo!</h1>
      <form onSubmit={submit}>
        <input
          ref={todoText}
          type="text"
          required
          placeholder="I need to ..."
        />
        <button type="submit">submit</button>
      </form>
      <ul>
        {todos &&
          todos.map((todo) => {
            return todo.complete && hideComplete ? (
              ""
            ) : (
              <div key={todo.id} style={flex}>
                <li style={todo.complete ? { color: "grey" } : {}}>
                  {todo.text}
                </li>
                <button
                  onClick={() => {
                    completed(todo.id);
                  }}
                >
                  Completed
                </button>
                <button
                  onClick={() => {
                    deleteTodo(todo.id);
                  }}
                >
                  Delete
                </button>
              </div>
            );
          })}
      </ul>
      <button onClick={() => setHideComplete(!hideComplete)}>
        {!hideComplete ? "Show Completed" : "Hide Completed"}
      </button>
    </div>
  );
}
