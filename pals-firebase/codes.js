var firebaseConfig = {
  apiKey: "AIzaSyAPdKtwvjau4J91_tZ5ynx6lXj0iLCwuvc",
  authDomain: "pals-example.firebaseapp.com",
  projectId: "pals-example",
  storageBucket: "pals-example.appspot.com",
  messagingSenderId: "571370753389",
  appId: "1:571370753389:web:f8dc5c0930ce92d84a1e64",
  measurementId: "G-SVC14R4375",
};

var uid;
// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

document.addEventListener("DOMContentLoaded", function () {
  registerLinks();
  renderPage("home");
  let id = window.localStorage.getItem("uid");
  console.log(id);
  if (id) uid = id;
});

function registerLinks() {
  const links = document.querySelectorAll("a");
  links.forEach((link) => {
    link.addEventListener("click", (e) => {
      e.preventDefault();
      renderPage(link.id);
    });
  });
}

async function renderPage(pageSlug) {
  const page = await fetch(pageSlug + ".html");
  let html = await page.text();
  if (page.status === 404) {
    html = "<h1>404 Page not found</h1>";
  }
  window.history.pushState({ html, pageTitle: "PALS Cafe" }, "PALS Cafe", "");
  document.getElementById("app").innerHTML = html;
  if (pageSlug === "log-in") {
    loginPageCodes();
  }
  if (pageSlug === "create-booking") {
    createBookingPageCodes();
  }
  if (pageSlug == "view-bookings") {
    setupBookings();
  }
}

function setupBookings() {
  db.collection("users")
    .where("id", "==", uid)
    .get()
    .then((querySnapshot) => {
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        console.log(doc.id, " => ", data);
        document.getElementById("name").innerText = "Hello " + data.name;
        const table = document.getElementById("booking-body");
        data.booking.forEach((booking, idx) => {
          const tr = document.createElement("tr");
          const size = document.createElement("td");
          size.innerText = booking.size;
          const date = document.createElement("td");
          date.innerText = booking.date.toDate().toDateString();
          const time = document.createElement("td");
          time.innerText = booking.time;
          const deleteBtn = document.createElement("i");
          deleteBtn.className = "material-icons";
          deleteBtn.innerText = "delete_forever";
          deleteBtn.addEventListener("click", () => {
            data.booking.splice(idx, 1);
            deleteBooking(data.booking);
          });

          tr.appendChild(date);
          tr.appendChild(time);
          tr.appendChild(size);
          tr.appendChild(deleteBtn);
          table.appendChild(tr);
        });
      });
    });
}

window.onpopstate = function (e) {
  if (e.state) {
    document.getElementById("app").innerHTML = e.state.html;
    document.title = e.state.pageTitle;
  }
};

function loginPageCodes() {
  M.Tabs.init(document.querySelector(".tabs"), {});
}

function createBookingPageCodes() {
  M.Timepicker.init(document.querySelectorAll(".timepicker"), {
    twelveHour: false,
  });
  M.Datepicker.init(document.querySelectorAll(".datepicker"), {});
}

function handleLogIn(e) {
  const login = document.getElementById("email-login").value;
  const pass = document.getElementById("password-login").value;
  console.log({ login, pass });
  firebase
    .auth()
    .signInWithEmailAndPassword(login, pass)
    .then((userCredential) => {
      // Signed in
      var user = userCredential.user;
      console.log(user);
      uid = user.uid;
      saveUid(uid);
      // ...
    })
    .catch((error) => {
      var errorCode = error.code;
      var errorMessage = error.message;
      console.log(errorMessage);
    });
}

function handleSignUp(e) {
  const name = document.getElementById("name-signup").value;
  const login = document.getElementById("email-signup").value;
  const pass = document.getElementById("password-signup").value;
  const confpass = document.getElementById("password-confirm-signup").value;
  if (pass !== confpass) {
    alert("Passwords do not match!");
    return;
  }
  console.log({ login, pass, confpass, name });
  firebase
    .auth()
    .createUserWithEmailAndPassword(login, pass)
    .then((userCredential) => {
      // Signed in
      var user = userCredential.user;
      uid = user.uid;
      saveUid(uid);
      renderPage("create-booking");
      db.collection("users")
        .add({
          email: login,
          id: uid,
          name: name,
        })
        .then(console.log);
    })
    .catch((error) => {
      var errorCode = error.code;
      var errorMessage = error.message;
      console.log(errorMessage);
      // ..
    });
}

function handleBooking() {
  const size = document.getElementById("party-size").value;
  const date = new Date(document.getElementById("date").value);
  const timeStr = document.getElementById("time").value;
  console.log(size, date, timeStr);
  db.collection("users")
    .where("id", "==", uid)
    .get()
    .then((querySnapshot) => {
      querySnapshot.forEach((doc) => {
        console.log(doc.id, " => ", doc.data());
        db.collection("users")
          .doc(doc.id)
          .update(
            {
              booking: firebase.firestore.FieldValue.arrayUnion({
                size: size,
                date: firebase.firestore.Timestamp.fromDate(date),
                time: timeStr,
              }),
            },
            { merge: true }
          );
      });
    });
}

function deleteBooking(data) {
  db.collection("users")
    .where("id", "==", uid)
    .get()
    .then((querySnapshot) => {
      querySnapshot.forEach((doc) => {
        console.log(doc.id, " => ", doc.data());
        db.collection("users").doc(doc.id).update(
          {
            booking: data,
          },
          { merge: true }
        );
      });
    })
    .then(() => {
      renderPage("view-bookings");
    });
}

function saveUid(id) {
  window.localStorage.setItem("uid", id);
}
