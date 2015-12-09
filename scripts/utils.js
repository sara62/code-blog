var Utilities = function() {};
Utilities.prototype.compageStrings = function(s1,s2) {
  if (s1 === s2) { return true;} else { return false;}
};
Utilities.prototype.removeArrayElement = function(array,index) {
  var newArray = array.slice(0,index).concat(array.slice(index+1));
  this.arrayAlert(newArray);
  return newArray;
};
Utilities.prototype.arrayAlert = function(array) {
  alert(JSON.stringify(array));
};
