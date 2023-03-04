//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const _ = require('lodash');
const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

// below removed, we're going to use mongoose instead.
// const items = ["Buy Food", "Cook Food", "Eat Food"];
// const workItems = [];

// create new db
mongoose.connect("mongodb+srv://candyroll93:Dd012893@candyroll93project.pswty.mongodb.net/todolistDB");

// Schema
const itemsSchema = new mongoose.Schema ({
  name: String
});

// Mongoose model ("collection/table name", Schema) it automatically pluralizes the name
const Item = mongoose.model("Item", itemsSchema);

// C in CRUD
const welcomeItem = new Item ({
  name: "Welcome to your To-do List!"
});

const addItem = new Item ({
  name: "Press the + button to add a new item."
});

const delItem = new Item ({
  name: "<-- Click this to delete an item."
});

const defaultItems = [welcomeItem, addItem, delItem];

const listSchema = {
  name: String,
  items: [itemsSchema]
};

const List = mongoose.model("List", listSchema);


// GET & POST
app.get("/", function(req, res) {


  Item.find({},(err, foundItems)=>{
    // check to see if default items are here
    if (foundItems===0){
      // C in CRUD
      Item.insertMany(defaultItems, (err) =>{
        if (err) {
          console.log(err);
        } else {
          console.log("Successfully saved default items to DB.");
        }
      });
      res.redirect('/');
    } else {
      // R in CRUD
    res.render("list", {listTitle: "Today", newListItems: foundItems});
    // foundItems populates the newListItems ejs tag
  }
});
});


// D in CRUD
// model.findOneandUpdate(
//   {conditions},
// {updates},
// (err, results) => {
//
// });
//
// Item.findOneAndUpdate(
//   {conditions},
//   // {$pull: {field: {query}}}, <--- the field is an arrayy of "items", query = which item
//   // {$pull: {field: {_id: value}}}, <---
//   // {$pull: {field: {_id: value}}}, <---
//   (err, results)=>{
//
//   }
// );

app.post("/", function(req, res){
      // C in CRUD
  const itemName = req.body.newItem;
  // what list are we wanting to add a task in?
  const listName = req.body.list;
      // C in CRUD
  const item = new Item ({
    name: itemName
  });

  if (listName === "Today") {
    item.save()
    console.log("Successfully saved the task in the " + listName + " list!")
    res.redirect("/")
  } else {
    List.findOne({name: listName}, (err, foundList)=>{
      foundList.items.push(item)
      foundList.save()
      res.redirect("/list/" + listName)
    });
  }
});
// old function without DB
//   if (req.body.list === "Work") {
//     workItems.push(item);
//     res.redirect("/work");
//   } else {
//     items.push(item);
//     res.redirect("/");
//   }
// });


  // D in CRUD
  app.post("/delete", (req, res)=>{
    console.log(req.body.checkbox);
    console.log(req.body.listName);
    const checkedItemId = req.body.checkbox;
    const listName = req.body.listName;
  // hidden input to tell us which list to delete from
  // delete if !today
  if (listName === "Today") {
    Item.findByIdAndRemove(checkedItemId, (err)=>{
      if(!err){
        console.log("Successfully deleted the checked item.");
        res.redirect("/");
      }
    });
  } else {
    List.findOneAndUpdate({name:listName},{$pull:{items:{_id:checkedItemId}}},(err, foundList)=>{
      if(!err){
        res.redirect("/list/"+listName)
      }
    })
  }
});

  // Item.deleteOne({_id:checkedItemId}, (err)=>{

app.get("/list/:customListName", (req, res)=>{
    const customListName = _.capitalize(req.params.customListName);
    console.log(customListName);

// checks to see if list exists, if so takes us there,
// if not, creates it
    List.findOne({name: customListName},(err, foundList)=>{
      if (!err && !foundList) {
          // C in CRUD
          const list = new List({
            name: customListName,
            items: defaultItems
          });
          list.save();
          console.log("Successfully saved " + customListName + " list!");
          res.redirect("/list/" + customListName);
      } else {
          console.log("It exists!");
          res.render("list", {listTitle: foundList.name, newListItems: foundList.items});
        };
    });


        // determine if the list name already exists
  });
  //
  // app.post("/list/:customListName", (req, res) => {
  //   const customListName = req.params.customListName;
  //   console.log(customListName);
  //       // C in CRUD
  //   const itemName = req.body.newItem;
  //   // what list are we wanting to add a task in?
  //   const listName = req.body.listTitle;
  //       // C in CRUD
  //   const item = new Item ({
  //     name: itemName
  //   });
  //
  //   if (listName === "Today") {
  //     item.save();
  //     console.log("Successfully saved the task in the " + listName + " list!")
  //     res.redirect("/list/" + customListName);
  //   } else {
  //     List.findOne({name: listName}, (err, foundList)=>{
  //       foundList.items.push(item);
  //       foundList.save();
  //       res.redirect("/list/" + customListName);
  //     });
  //   };
  // });



app.get("/about", function(req, res){
  res.render("about");
});

let port = process.env.PORT;
if (port == null || port == "") {
  port = 3000;
}

app.listen(port, function() {
  console.log("Server has successfully started.");
});
