var Utilities = function() {};
Utilities.prototype.uniqueArray = function(array) {
  var output = [];
  $.each(array,function(index,value){
    var arrayValue = value;
    var alreadyInOutput = false;
    $.each(output,function(index,value){
      if (arrayValue === value)
      {
        alreadyInOutput = true;
      }
    });
    if (!alreadyInOutput)
    {
      output.push(value);
    }
  });
  return output;
};
Utilities.prototype.arrayAlert = function(array) {
  alert(JSON.stringify(array));
};
