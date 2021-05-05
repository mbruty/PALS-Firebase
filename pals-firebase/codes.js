var firebaseConfig = {
  apiKey: "AIzaSyAPdKtwvjau4J91_tZ5ynx6lXj0iLCwuvc",
  authDomain: "pals-example.firebaseapp.com",
  projectId: "pals-example",
  storageBucket: "pals-example.appspot.com",
  messagingSenderId: "571370753389",
  appId: "1:571370753389:web:f8dc5c0930ce92d84a1e64",
  measurementId: "G-SVC14R4375",
};
// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

// db.collection("test")
//   .add({
//     first: "Mike",
//     last: "Bruty",
//   })
//   .then(console.log);

db.collection("test")
  .get()
  .then((snapshot) => {
    snapshot.forEach((doc) => {
      console.log(doc.data());
    });
  });

document.addEventListener("DOMContentLoaded", function () {
  registerLinks();
  renderPage("home");
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
}

function handleSignUp(e) {
  const login = document.getElementById("email-signup").value;
  const pass = document.getElementById("password-signup").value;
  const confpass = document.getElementById("password-confirm-signup").value;
  if (pass !== confpass) {
    alert("Passwords do not match!");
  }
  console.log({ login, pass, confpass });
}

function handleBooking() {
  const size = document.getElementById("party-size").value;
  const date = new Date(document.getElementById("date").value);
  const timeStr = document.getElementById("time").value;
  console.log(size, date, timeStr);
}
