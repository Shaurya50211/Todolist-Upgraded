const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose")
const _ = require('lodash');

require('dotenv').config()

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

mongoose.connect(`mongodb+srv://admin-shaurya:${process.env.PASSWORD}@todolist-cluster.aerb2wq.mongodb.net/?retryWrites=true&w=majority/todolistDB`, {
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

  const itemName = req.body.newItem;
  const listName = _.capitalize(req.body.list);

  const item = new Item({
    name: itemName
  })

  if (listName === "Today") {
    item.save()
    res.redirect("/")
  } else {
    List.findOne({
      name: listName
    }).then(resp => {
      resp.items.push(item)
      resp.save()
      res.redirect("/" + resp.name)
    })
  }
});

app.post("/delete", function (req, res) {
  const listItemID = req.body.check;
  const listName = _.capitalize(req.body.listName);

  if (listName === "Today") {
    Item.findOneAndRemove(listItemID).then(res => {
      console.log(res)
    })
    res.redirect("/")
  } else {
    List.findOneAndUpdate({
        name: listName
      }, {
        $pull: {items: {_id: listItemID}}
      })
      .then(resp => {
        res.redirect("/" + listName)
      })
  }
})

app.get("/:listName", function (req, res) {
  const listName = _.capitalize(req.params.listName);

  List.findOne({
      name: listName
    })
    .then(resp => {
      if (resp == null) {
        const list = new List({
          name: listName,
          items: defaultList
        })
        // Doesn't exist
        list.save()
        res.redirect("/" + listName)
      } else {
        res.render("list", {
          listTitle: resp.name,
          newListItems: resp.items
        });
      }
      console.log(resp);
    })

});

app.get("/about", function (req, res) {
  res.render("about");
});

app.listen(3000, function () {
  console.log("Server started on port 3000");
});