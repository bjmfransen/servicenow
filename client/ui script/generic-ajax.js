(function () {
	var genericAjax = function (siName, siMethod, argumentsArray) {
		if (typeof siName != 'string') return;
		if (typeof siMethod != 'string') return;

		argumentsArray = argumentsArray || [];

		return new Promise(function (resolve, reject) {
			var gaDUA = new GlideAjax('GenericAjax');
			gaDUA.addParam('sysparm_name', 'runAjax');
			gaDUA.addParam('si_name', siName);
			gaDUA.addParam('si_method', siMethod);
			gaDUA.addParam('args', JSON.stringify(argumentsArray));

			gaDUA.getXMLAnswer(function (response) {
				if (response.hasError){
					reject(response);
				} else {
					resolve(response);
				}
			});
		});
	};

	return {
		genericAjax: genericAjax
	};
})();


