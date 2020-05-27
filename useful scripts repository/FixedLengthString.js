function FixedLengthString(length, padCharacter, padAfter){
	/**
	 * Creates a string where the length is crucial. This is why it is 
	 * the first, mandatory parameter. The other parameters in the constructor
	 * determine what to do if the provided value does not have the correct length
	 * The padCharacter is used to pad the field's value if it does not meet the required
	 * length. padCharacter is not forced to be of length 1, but it is recommended.
	 * If padCharacter is not provided, it will get a value in the fix-method. If the 
	 * value provided to fix is a number, padCharacter will be '0', for all other types
	 * it will be set to a space ' '.
	 * 
	 * Usage:
	 *   Example 1 - returns 'ServiceNow          '
	 *   	var f1 = FixedLengthString(20, ' ', true).fix('ServiceNow');
	 *
	 * 	 Example 2 - returns '000123' - number 123 will be cast to type string.
	 *   	var f2 = FixedLengthString(6).fix(123);
	 *   Note that FixedLengthString(6).fix('123') returns '   123'
	 *
	 * 	 Example 3 - second line returns 'Thi'
	 *   	var f3 = FixedLengthString(3, '');
	 *   	f3.fix('This string is too long')
	 *
	 * 	 Example 5 - returns '    ' (four spaces)
	 * 		var f5 = FixedLengthString(4).fix()
	 * 
	 * 	 Example 5 - returns '000'
	 * 		var f5 = FixedLengthString(3).fix(0)
	 * 
	 * @param {number} length - length of the string
	 * @param {string} [padCharacter] - optional, use this character to expand a string that is too short
	 * @param {boolean} [padAfter] - optional, determines whether to pad before or after the string. Defaults to false (pads before the string)
	 * @returns {Object} methods - interfacing methods
	 * @returns {Function} methods.fix - sets/gets the string value
	 *
	 * Version 1 - BJM Fransen, 7 May 2020
	 *
	 */
  var padBefore = !padAfter;
  
  var fix = function(s){
  	/**
  	 * Fixes and returns the value using the settings and the provided string
  	 * 
  	 * @param {string} [s] - string to be converted to fixed length. Defaults to an empty string, is cast to a string if needed
  	 * @returns {string} - string of the length provided in FixedLengthString
  	 */
  	var _value;

  	// if padCharacter is not provided, set it based on the string type
  	if (typeof padCharacter === 'undefined'){
  		padCharacter = (typeof s === 'number') ? '0' : ' ';
  	}

    if (typeof s !== 'string') {
      s = (s || '').toString();
    }
    
    //calculate the length gap; if s is longer than expected truncate, otherwise fill using padCharacter
    var gap = s.length - length;
    var pad;
    
    if (gap > 0){
      _value = s.substr(0, length)
    } else if (gap < 0){
      pad = (new Array(1-gap).join(padCharacter));
      _value = (padBefore) ? pad + s : s + pad;
    } else {
    	_value = s;
    }

	  return _value;
  }

  return {
  	fix: fix
  }
}

// (function test(){
// 	var f1 = FixedLengthString(20, ' ', true).fix('ServiceNow');
// 	var f2 = FixedLengthString(6).fix('123')
// 	var f3 = FixedLengthString(3, 'x').fix();
// 	var f4 = FixedLengthString(3).fix(0)
// 	var f5 = FixedLengthString(4).fix()
// 	var f6 = FixedLengthString(5).fix('12345')
// })()

