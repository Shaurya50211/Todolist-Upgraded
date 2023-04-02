//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose")
const defaultList = [{
    name: "Hit the + Button to add a new item"
  },
  {
    name: "<-- Click it to check off an item"
  },
  {
    name: "We hope you enjoy!"
  }
]

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(express.static("public"));

const displayedItems = []

mongoose.connect("mongodb://localhost:27017/todolistDB", {
  useNewUrlParser: true
});

const itemsSchema = new mongoose.Schema({
  name: String
})

const listSchema = new mongoose.Schema({
  name: String,
  items: [itemsSchema]
})

const List = mongoose.model("List", listSchema)

const Item = mongoose.model("Item", itemsSchema)

app.get("/", function (req, res) {

  Item.find().then(function (items) {

    if (items.length == 0) {
      Item.insertMany(defaultList)
      res.redirect("/")
    } else {
      res.render("list", {
        listTitle: "Today",
        newListItems: items
      });
    }

  });

})

app.post("/", function (req, res) {

  const item = req.body.newItem;

  // if (req.body.list === "Work") {
  //   workItems.push(item);
  //   res.redirect("/work");
  // } else {
  //   items.push(item);
  //   res.redirect("/");
  // }r

  Item.insertMany([{
    name: item
  }])

  res.redirect("/")
});

app.post("/delete", function (req, res) {
  console.log(req.body.check)

  Item.findOneAndRemove(req.body.check).then(res => {
    console.log(res)
  })

  res.redirect("/")
})

app.get("/:listName", function (req, res) {
  const listName = req.params.listName;
  const list = new List({
    name: listName,
    items: defaultList
  })

  List.find({ name: listName }).then(res => {
    if (res != []) {
      // List already exists
    } else {
      // Create new list
      list.save()
    }
  }).catch(err => {
    console.log(err);
  })

});

app.get("/about", function (req, res) {
  res.render("about");
});

app.listen(3000, function () {
  console.log("Server started on port 3000");
});