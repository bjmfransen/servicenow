function initializeRadioButtons(document, uniqueId, parameters){
/**
 * Initialize the radio buttons filter element
 *
 * @param {} document - the DOM
 * @param {String} uniqueId - unique identifier for the html element
 * @param {} parameters - contains field mappings, settings to enable creating the html element including the default value
 *
 */
	//first, set up a dedicated namespace for radio buttons to which the functions can be attached
	document.shRadioButtons = {};
	document.shRadioButtons.getBaseFilter = function(parameters, value){
	/**
	 * calculates the base filter based on the parameters and value selected
	 *
	 *
	 */
		var result;

		// first, find the selected radio button in the list
		var found = false;
		var i = 0;
		var l = parameters.settings.radioButtons.length;
		var radioButton;

		while (i < l && !found){
			found = (parameters.settings.radioButtons[i].value === value);
			i++;
		}

		if (found){
			// if found, retrieve the radio button data
			radioButton = parameters.settings.radioButtons[i-1];

			if (radioButton.noFilter){
				// if noFilter was set, return a 'true'-query. this will lead to the filter not being run
				result = 'true';
			} else {
				// if noFilter was not set, check if there is a filter. if so, return it
				// otherwise match the base field to the value to create the base filter
				result = radioButton.filter || parameters.mapping.base.field + '=' + value;
			}
		}
		console.log('$$$ getBaseFilter', parameters.settings.uid, result)
		return result;
	}	

	document.shRadioButtons.publishFilters = function(parameters, value){
	/**
	 * publish the filters
	 *
	 *
	 */
		if (typeof window.shGlobalSpace === 'undefined'){
			window.shGlobalSpace = {
				counter: 0
			}
		} else {
			window.shGlobalSpace.counter++;
		}

		var handler;
	 	var oFilters = {
			id: parameters.settings.uid
		};

		var baseFilter = document.shRadioButtons.getBaseFilter(parameters, value);

		if (baseFilter){
			// Convert all reference entries to filters  
			oFilters.filters = parameters.mapping.references.map(function(reference){
				return {
					table: reference.table,
					filter: reference.reference + baseFilter
				}
			})

			// Insert the base table/filter as the first element of the array
			oFilters.filters.unshift({
				table: parameters.mapping.base.table,
				filter: baseFilter
			})
	  	}

		// Retrieve all existing filters for this dashboard, update/publish the current one and store the defaults
		// console.log('$$$ publishing', allRendered(), SNC.canvas, window.shGlobalSpace.counter);
		// console.log('$$$ 0 default values', SNC.canvas.interactiveFilters.defaultValues);
		// window.SNC.canvas.interactiveFilters.fetchDefaultValues(SNC.canvas.layoutJson.canvasSysId);
		// console.log('$$$ 1 default values', SNC.canvas.interactiveFilters.defaultValues);

		handler = new DashboardMessageHandler(oFilters.id);
		if (baseFilter === 'true'){
			console.log('$$$ baseFilter true, remove filters')
			handler.removeFilter()
		} else {
			console.log('$$$ publish filters')
			handler.publishMessage(oFilters.filters);
			// window.SNC.canvas.interactiveFilters.setDefaultValue(oFilters, true);
		}
		
		return;
	}

	document.shRadioButtons.addEventListeners = function(parameters, radioButtonsElement){
	/**
	 * Add the event listener to the radio buttons element
	 *
	 * @param {String} id - unique id for the html element
	 * @param {String} paramaters - needed to used in to the publishFilters callback
	 * @param {} radioButtonsElement - DOM element holding the radio buttons
	 *
	 */
	 console.log('$$$ addEventListeners', parameters, radioButtonsElement)
	 	// we generate the callback listener using an iife to be able to pass on parameters to it
	 	var callbackListener = (function(parameters){
	 		return function(event){
	 			console.log('$$$ callbackListener!')
				var filter = event.target.getAttribute('filter');
		 		var value = event.target.value;

				document.shRadioButtons.publishFilters(parameters, value, filter);
				setPreference(parameters.settings.uid, value);
			}
	 	})(parameters)

		//find all radio buttons and assign a callback function to them
		console.log('$$$ radioButtonsElement', radioButtonsElement);
		radioButtonsElement.querySelectorAll('input').forEach(function(rbItem){
			rbItem.addEventListener('change', callbackListener)
		})

		return;
	}

	document.shRadioButtons.setDefaultValue = function(radioButtonsElement, value){
	/**
	 * Apply the preferred value to the html element. If no radio button
	 * is found with the value provided, the first radio button will
	 * be checked, and its value will be returned.
	 *
	 * @param {} radioButtonsElement - the radio button DOM element
	 * @param {String} value - the value that needs to be set
	 *
	 * @return {String} - returns the value of the radio button
	 */	

	 	// find the radio option that corresponds to the provided value
		var radioButtonInput = radioButtonsElement.querySelector( '[value='+value+']')

		if (!radioButtonInput){
			// if the provided value has no radio option, find the first option available
			radioButtonInput = radioButtonsElement.querySelector('input');
		}

		// check the radio button
		radioButtonInput.setAttribute('checked', 'checked');

		// setTimeout(function(radioButtonsElement){
		// 	return function(){
		// 		console.log('$$$ raising change event', radioButtonsElement)
		// 		console.log('$$$', SNC.canvas)
		// 		getInfo();
		// 		radioButtonsElement.dispatchEvent(new Event('change'));
		// 	}
		// }(radioButtonsElement), 1000)

		return radioButtonInput.getAttribute('value');
	}


	// main functionality
	// the value previously used is stored as a user preference; retrieve it
	var value = parameters.settings.preference;

	// find the radio buttons element using the unique id
	var radioButtonsElement = document.getElementById(parameters.settings.uid);
	console.log('$$$ selected radioButtonsElement', radioButtonsElement)

	// create event listeners to add behaviour to the radio buttons
	document.shRadioButtons.addEventListeners(parameters, radioButtonsElement);

	// apply the default value to the radio buttons
	value = document.shRadioButtons.setDefaultValue(radioButtonsElement, value);

	// publish the filters
	return document.shRadioButtons.publishFilters(parameters, value);
}







function getInfo(){
	console.log('$$$$$$$$$$$$$$$$$$$$$', allRendered());
	SNC.canvas.layoutJson.panes.forEach(function(pane, index){
		console.log('$$$$', index, pane.sysId, pane.prefs.title, pane.isRendered, pane.isInProcess)
	})
}

function allRendered(){
	// returns true if all panes are rendered, false otherwise
	var panes = SNC.canvas.layoutJson.panes;
	console.log('$$$ checking all rendered', panes)
	var i = 0;
	var l = panes.length;

	while (i < l){
		if (panes[i].isRendered === false){
			//if any pane is not rendered, we can stop and return false
			console.log('$$$ not rendered', panes[i].prefs.title);
			return false;
		}
		i++;
	}

	//if we are here, the loop was not exited, and all panes were rendered
	return true;
}
