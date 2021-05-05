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
  renderPage("home"); // Direct to home page on load
  let id = window.localStorage.getItem("uid"); // Get a uid stored locally
  console.log(id);
  if (id) uid = id; // If we have the uid, set it
});

function registerLinks() {
  const links = document.querySelectorAll("a"); // Get all 'a' elements that are in the nav
  links.forEach((link) => {
    link.addEventListener("click", (e) => {
      e.preventDefault(); // Prevent a page reload on click
      renderPage(link.id); // Render the page with the link's id (i.e. "log-in")
    });
  });
}

async function renderPage(pageSlug) {
  const page = await fetch(pageSlug + ".html"); // Fetch the corresponding html page for the page ("log-in" will get log-in.html)
  let html = await page.text(); // Get the text from the response
  if (page.status === 404) {
    // 404 - couldn't find the page
    html = "<h1>404 Page not found</h1>";
  }
  window.history.pushState(
    { html, pageTitle: "PALS Cafe" },
    "PALS Cafe",
    pageSlug
  ); // Push the new page into the window's history, this will allow the user to go back
  document.getElementById("app").innerHTML = html; // Get <div id="app"> and place the html from the loaded file into it
  if (pageSlug === "log-in") {
    loginPageCodes(); // Load the log in page logic
  }
  if (pageSlug === "create-booking") {
    createBookingPageCodes(); // Load the booking page logic
  }
  if (pageSlug == "view-bookings") {
    setupBookings(); // Load the view bookings page logic
  }
}

function setupBookings() {
  db.collection("users") // Get the collection users
    .where("id", "==", uid) // Where the id is equal to the current user id
    .get()
    .then((querySnapshot) => {
      querySnapshot.forEach((doc) => {
        // For each document returned (should only be one)
        const data = doc.data();
        console.log(doc.id, " => ", data);
        document.getElementById("name").innerText = "Hello " + data.name; // Set the <h1>'s text to Hello name
        const table = document.getElementById("booking-body");
        data.booking.forEach((booking, idx) => {
          // For each booking
          const tr = document.createElement("tr"); // Create a new table row
          const size = document.createElement("td"); // Create the element that the size is going to be in
          size.innerText = booking.size; // Set the text content of that td to the size
          const date = document.createElement("td"); // Repeate for each element
          date.innerText = booking.date.toDate().toDateString(); // Conver the object to a js date object and then convert that into a date string
          const time = document.createElement("td");
          time.innerText = booking.time;
          const deleteBtn = document.createElement("i"); // Create the delete icon
          deleteBtn.className = "material-icons";
          deleteBtn.innerText = "delete_forever";
          deleteBtn.addEventListener("click", () => {
            // When the delete icon is clicked...
            data.booking.splice(idx, 1); // Remove the item at the index
            deleteBooking(data.booking); // Save the updated array
          });

          // Add all the table elements to the row
          tr.appendChild(date);
          tr.appendChild(time);
          tr.appendChild(size);
          tr.appendChild(deleteBtn);
          // Add the table row to the table
          table.appendChild(tr);
        });
      });
    });
}

// Handler for going back
window.onpopstate = function (e) {
  if (e.state) {
    document.getElementById("app").innerHTML = e.state.html;
    document.title = e.state.pageTitle;
  }
};

function loginPageCodes() {
  M.Tabs.init(document.querySelector(".tabs"), {}); // Init the material tabs component
}

function createBookingPageCodes() {
  // init the time picker and date picker elements
  M.Timepicker.init(document.querySelectorAll(".timepicker"), {
    twelveHour: false,
  });
  M.Datepicker.init(document.querySelectorAll(".datepicker"), {});
}

function handleLogIn(e) {
  // Get the email and password
  const login = document.getElementById("email-login").value;
  const pass = document.getElementById("password-login").value;
  console.log({ login, pass });
  firebase
    .auth() // Inialise firebase auth
    .signInWithEmailAndPassword(login, pass) // Sign in with given username and password
    .then((userCredential) => {
      // Signed in
      var user = userCredential.user; // get the user from the returned object
      console.log(user);
      uid = user.uid; // get the user id
      saveUid(uid); // save the user id
      // ...
    })
    .catch((error) => {
      var errorCode = error.code;
      var errorMessage = error.message;
      console.log(errorMessage);
    });
}

function handleSignUp(e) {
  // Get all the data from the form
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
    .createUserWithEmailAndPassword(login, pass) // Sign up with email nad password
    .then((userCredential) => {
      // Signed in
      var user = userCredential.user;
      uid = user.uid; // Get the user id
      saveUid(uid); // save the user id
      renderPage("create-booking"); // Go to the create booking page
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
  // Get all the form data
  const size = document.getElementById("party-size").value;
  const date = new Date(document.getElementById("date").value);
  const timeStr = document.getElementById("time").value;
  console.log(size, date, timeStr);
  db.collection("users")
    .where("id", "==", uid) // Get the doccument containing the user's info
    .get()
    .then((querySnapshot) => {
      querySnapshot.forEach((doc) => {
        console.log(doc.id, " => ", doc.data());
        db.collection("users")
          .doc(doc.id)
          .update(
            // Add the booking to the bookings array contained inside the user
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
