const express = require("express");
const app = express();
const port = 9000;

const { initializeApp, cert } = require("firebase-admin/app");
const { getFirestore ,Filter} = require("firebase-admin/firestore");
var serviceAccount = require("./serviceAccountKey.json");
const bodyparser = require("body-parser");
app.use(bodyparser.json());

app.use(bodyparser.urlencoded({extended:false}));
var passwordHash = require("password-hash");
initializeApp({
  credential: cert(serviceAccount),
});

const db = getFirestore();

app.set("view engine", "ejs");

app.use(express.urlencoded({ extended: true })); 

app.get("/", (req, res) => {
  res.render("sign_log")
});

app.get("/signin", (req, res) => {
  res.render("signin");
});

app.get("/sign_log", (req, res) => {
  res.render("sign_log");
});
app.post("/signinsubmit", (req, res) => {
  const Username = req.body.username;
  const Email = req.body.email;
  const Password = req.body.password;

  db.collection("foundation")
    .where("Email", "==", Email)
    .get()
    .then((emailDocs) => {
      if (!emailDocs.empty) {
        res.send("Hey, an account with this email address already exists.");
      } else {

        db.collection("foundation")
          .where(
            Filter.or(
              Filter.where("Email","==",Email),
              Filter.where("UserName", "==", Username)
            )
          )
          .get()
          .then((userDocs) => {
            if (!userDocs.empty) {
              res.send("Hey, an account with this Username and Email already exists.");
            } else {
              // Neither email nor username exists, so add the new account
              db.collection("foundation")
                .add({
                  UserName: Username,
                  Email: Email,
                  Password: passwordHash.generate(Password),
                })
                .then(() => {
                  console.log(Password);
                  res.render("signin_after", { UserName: Username });
                })
                .catch(() => {
                  res.send("Something went WRONG");
                });
            }
          });
      }
    });
});

app.get("/signin_after", (req, res) => {
  const { UserName } = req.query.username;
  res.render('signin_after', { UserName });
});



app.get("/signin_aftersubmit", (req, res) => {
  res.render('login'); 
});

app.get("/login", (req, res) => {
  

  res.render('login'); 
});

app.get("/helping_hands", (req, res) => {
  res.render('helping_hands'); 
});

app.get("/about",(red,res) => {
  res.render('about');
});

app.get("/donate", (req, res) => {
  res.render('donate'); 
});

app.get("/types_of_Donations",(red,res) => {
  res.render('types_of_Donations');
});

app.get("/contact",(red,res) => {
  res.render('contact');
});

app.get("/food_donation",(red,res) => {
  res.render('food_donation');
});

app.get("/cloth_donation",(red,res) => {
  res.render('cloth_donation');
});

app.get("/organ_donation",(red,res) => {
  res.render('organ_donation');
});
app.get("/blood_donation",(red,res) => {
  res.render('blood_donation');
});

app.get("/plasma_donation",(red,res) => {
  res.render('plasma_donation');
});

app.get("/hair_donation",(red,res) => {
  res.render('hair_donation');
});

app.post("/loginsubmit", (req, res) => {
  const Email = req.body.email;
  const Password = req.body.password;

  db.collection("foundation")
    .where("Email", "==", Email)
    .get()
    .then((emailDocs) => {
      let verified = false;
      emailDocs.forEach((doc) => {
        verified = passwordHash.verify(Password, doc.data().Password); 
      });
      if (verified) {
        res.render("helping_hands"); 
      } else {
        res.render("login_after"); 
      }

    })
    .catch((error) => {
      console.error("Error logging in:", error);
      res.send("Something went wrong.");
    });
});

app.get("/login_aftersubmit", (req, res) => {
  
  res.render('signin'); 
});

app.get("/donate_thank_you", (req, res) => {
  
  res.sendFile(path.join(__dirname, 'public', 'donate_thank_you.html'));
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
  
});
 