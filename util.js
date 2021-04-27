const isValidProperty = (object,  property, type="string") => {
  if(object == null || type == null || property == null){
    return false;
  }
  switch(type){
    case 'string':
      return object.hasOwnProperty(property) && object[property] != null && typeof object[property] === 'string' && object[property].length != 0
    case 'number':
      return object.hasOwnProperty(property) && object[property] != null && !isNaN(object[property])
    case 'array':
      return object.hasOwnProperty(property) && object[property] != null && Array.isArray(object[property]) && object[property].length != 0
    default:
      return false;
  }
}

module.exports = {
  isValidProperty: isValidProperty
}; 