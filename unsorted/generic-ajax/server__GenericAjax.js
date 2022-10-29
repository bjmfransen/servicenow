var GenericAjax = Class.create();
GenericAjax.prototype = Object.extendsObject(AbstractAjaxProcessor, {
    runAjax: function(){
        var siName = ''+this.getParameter('si_name');
        var siMethod = ''+this.getParameter('si_method');
        var args = ''+this.getParameter('args');

        var result = handleGenericAjax(siName, siMethod, args);

        return JSON.stringify(result);
    }
});

function handleGenericAjax(siName, siMethod, args){
    try {
        if (siName === '') return Error('script include not provided' );
        if (siMethod === '') return Error('script include method not provided');
        if (args === '') return Error('arguments array not provided');

        if (!validateMethod(siName, siMethod)) return Error(siName+'.'+siMethod+' is not in the allowed list');

        var argumentsArray = JSON.parse(args);
        if (!Array.isArray(argumentsArray)) return Error('args is not an array');

        if (!global.hasOwnProperty(siName)) return Error('Script include global.'+siName+' not found');
        
        var si = new global[siName];
        if (!si.prototype[siMethod]) return Error('Function '+siMethod+' in '+siName+' not found');
        if (typeof si[siMethod] != 'function') return Error(siMethod+' in '+siName+' is not a function')

        return si[siMethod].apply(this, argumentsArray);
    } catch (e) {
        return Error(e);
    }
}

function Error(e){
    if (typeof e === 'string'){
        return {
            hasError: true,
            name: 'GenericAjax error',
            message: e
        }
    } else {
        return {
            hasError: true,
            message: e.message,
            name: e.name || 'GenericAjax error',
            lineNumber: e.lineNumber
        }
    }
}

function validateMethod(siName, siMethod){
    // maybe move validation list to a property later
    var validationList = [
        '__DataUtils.getRecordList',
        '__DataUtils.getValueDisplay'
    ];

    return validationList.some(function(item){
        var dotIndex = item.indexOf('.');
        if (dotIndex === -1){
            return (item === siName);
        } else {
            var values = item.split('.');
            return (values[0] === siName && values[1] === siMethod);
        }
    })
}
