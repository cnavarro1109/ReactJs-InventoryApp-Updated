import React, { Component } from 'react';
import logo from './logo.svg';
import './App.css';

import { Table } from 'react-bootstrap'

//Firebase dependencies
var uuid = require('uuid');
var firebase = require('firebase');

var config = {
  apiKey: "AIzaSyBW6HNzdnMv7uvHV670hzs1AYxyBeRXF_g",
  authDomain: "inventoryapp-bace2.firebaseapp.com",
  databaseURL: "https://inventoryapp-bace2.firebaseio.com",
  storageBucket: "inventoryapp-bace2.appspot.com",
  messagingSenderId: "584481905960"
};
firebase.initializeApp(config);



class App extends Component {

  constructor(props) {

    super(props);

    this.state = {
      inventory: [],
      submitted: false,
      editMode: false,
      editFields: []
    }

    //Handle Actions
    this._updateFireBaseRecord = this._updateFireBaseRecord.bind(this); //Updates the firebase record
    this._setFireBaseDataEditTable = this._setFireBaseDataEditTable.bind(this); //Sets the UUID we are going to modify
    this._handleFirebaseFormChange = this._handleFirebaseFormChange.bind(this); //Sets the new value of each input

  }

  componentDidMount() {
    this._loadFirebaseData();
  }

  //Loading the data from firebase
  _loadFirebaseData() {
    //console.log("Edit Mode: ", this.state.editMode);
    var self = this;

    //Empty any records before we assign new ones
    this.setState({ inventory: [] });


    //Getting data from firebase
    firebase.database().ref().once('value').then((snapshot) => {
      snapshot.forEach(function (data) {

        //console.log(data.val());
        self.setState({
          inventory: self.state.inventory.concat(data.val())
        });
      });
    });

  }

  _handleFirebaseFormChange(event) { 
    console.log("Field Updated");
    this.props.onChange(event.target.value);
  }

  _setFireBaseDataEditTable(event) {
    event.preventDefault();

    const recordId = event.target.value;

    console.log("The firebase uuid is", event.target.value);

    this.setState({
      editMode: true,
      editUUID: event.target.value,
      editFields: []
    });

    //console.log(event.target.value);
    //console.log(event[event.target.value]);
    //console.log("Entering Edit Firebase Function");

    self = this; //We loose what this is once we go into the firebase database

    //Query the firebase data
    firebase.database().ref().child("inventoryapp").orderByChild("uuid").on('value',
      (snapshot) => {
        snapshot.forEach(function(child) {
            //console.log(child.val()) // NOW THE CHILDREN PRINT IN ORDER
            var value = child.val();
            var name = value.inventory.name;
            var quantity = value.inventory.quantity;
            var description = value.inventory.description;
            var uuid = value.inventory.uuid;
            
            var editFields = {};

            if(uuid === recordId){
              //console.log(value);
              editFields["name"] = name;
              editFields["quantity"] = quantity;
              editFields["description"] = description;
              editFields["uuid"] = uuid;

              self.setState({editFields : editFields});
              
            }
        });
      }
    )
  }

  _updateFireBaseRecord(event){
    event.preventDefault();

    //Getting the values of each child type input
    var details = {};
    event.target.childNodes.forEach(function (el) {
      if (el.tagName === 'INPUT') {
        details[el.name] = el.value
      } 
    });

    console.log("Data has been submitted!!!!");
   
    //Resetting the property value
    this.setState({
      editMode: false
    });

    var uuid = details["uuid"];
    var self = this;

    firebase.database().ref().child('/inventoryapp/' + uuid)
        .update({ inventory: details });

    this._loadFirebaseData();
  }

  _handleClick(event) {
    event.preventDefault();

    //console.log(event.target.value);
    //Remove one element
    var uuid = event.target.value;

    firebase.database().ref().child('inventoryapp/' + uuid).remove();

    //Reload the data
    this._loadFirebaseData();
  }

  render() {
    var inputForm;
    var table;
    var rows;
    var editView;
    var output;

    inputForm = <span>
      <h2>Please enter your inventory Item</h2>
      <form onSubmit={this.onSubmit.bind(this)}>
        <input type="text" placeholder="Enter Name..." name="name" />
        <input type="text" placeholder="Enter description..." name="description" />
        <input type="text" placeholder="Enter quantity..." name="quantity" />
        <button type="submit">Submit</button>
      </form>
    </span>


    var self = this;
    rows = self.state.inventory.map(function (item, index) {

      //console.log(item);
      //console.log(JSON.stringify(item));

      return Object.keys(item).map(function (s) {
        //console.log("ITEM:" + item[s].name)
        //console.log("ITEM:" + item[s].inventory.name) 
        return (
          //<tr key={index}>
          <tr key={s}>
            <th> {item[s].inventory.name} </th>
            <th> {item[s].inventory.description} </th>
            <th> {item[s].inventory.quantity} </th>
            <th>
              <button value={item[s].inventory.uuid} onClick={self._handleClick.bind(self)}>Delete</button>
              <button value={item[s].inventory.uuid} onClick={self._setFireBaseDataEditTable}>Edit</button>
            </th>
          </tr>
        )
      });


    });

    table = (
      <span>
        <Table striped bordered condensed hover>
          <thead>
            <tr>
              <th> Name </th>
              <th> Description </th>
              <th> Quantity </th>
              <th> Actions </th>
            </tr>
          </thead>
          <tbody>
            {rows}
          </tbody>
        </Table>
      </span>
    )

    editView = (
      <div>
        <h2>Edit Mode</h2>
        <form onSubmit={this._updateFireBaseRecord}>
          <input type="text" value={this.state.editFields.name} onChange={this._handleFirebaseFormChange} name="name" />
          <input type="text" value={this.state.editFields.description} onChange={this._handleFirebaseFormChange} name="description" />
          <input type="text" value={this.state.editFields.quantity} onChange={this._handleFirebaseFormChange} name="quantity" />
          <input type="text" className="hideinput" value={this.state.editFields.uuid} name="uuid" />
          <button type="submit" type="submit" >Submit</button>
        </form>
      </div>
    );



    if (this.state.editMode) {
      output = (
        <div className="App">
          <div className="App-header">
            <h2>Inventory App</h2>
          </div>
          <div className="text-center">
            {editView}
          </div>
        </div>
      );
    } else {
      output = (
        <div>
          <div className="App-header">
            <h2>Inventory App</h2>
          </div>
          <div className="text-center">
            {inputForm}
            <br />
            {table}
          </div>
        </div>
      );
    }




    return (
      <div className="App">
        {output}
      </div>
    );
  }


  //Adding our function that will handle our form submit 
  onSubmit(event) {
    event.preventDefault();

    //Creating our initial variables
    const details = {}
    const id = uuid.v1(); //generating our unique key

    //Go through each element in the form making sure it's an input element
    event.target.childNodes.forEach(function (el) {
      if (el.tagName === 'INPUT') {
        details[el.name] = el.value
      } else {
        el.value = null
      }

      //Adding one more element uuid
      details['uuid'] = id;
    });


    //Saving to firebase
    firebase.database().ref('inventoryapp/' + id).set({
      inventory: details
    });

    this.setState({
      submitted: true
    })

    this._loadFirebaseData();

  }

}

export default App;
