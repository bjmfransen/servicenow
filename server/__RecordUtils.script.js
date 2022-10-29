var __RecordUtils = Class.create();
__RecordUtils.prototype = {
    initialize: function (enableLogging) {
        if (enableLogging) this.enableLogging();
        return this;
    },
    
    enableLogging: function(){
        this.loggingEnabled = true;
        return this;
    },

    log: function(s){
        if (this.enableLogging){
            if (typeof s === 'string') gs.info(s);
            if (Array.isArray(s)) gs.info(s.join('\n'));
        }
    },

    /**
     * Retrieves data from a table
     *
     * @param {Object} - options - parameters are passed in through an options object
     * @param {string} options.table - the table to query
     * @param {string} options.query - encoded query string
     * @param {string[]} options.fieldList - list of fields whose values will be returned
     * @param {number} options.max - the number of records to be returned, -1 returns all
     * @returns {record[]} - array with records and name value pairs of the fieldList (both display and value).
     */
    getRecordList: function (options) {
        this.log('@getRecordList');
        if (typeof options != 'object') return Error('No options provided');
        if (typeof options.table !== 'string') return Error('No table provided or table is not a string');
        if (typeof options.query !== 'string') return Error('No query provided or query is not a string');
        if (!options.fieldList || !Array.isArray(options.fieldList) || options.fieldList.length === 0) return Error('fieldList should be a non-empty array');
        if (typeof options.max === 'undefined'){
            options.max = -1;
        }

        this.log([options.table, options.query, JSON.stringify(options.fieldList), options.max]);

        var gr = new GlideRecord(options.table);

        // determine which function to use for retrieving values so we can skip the heavy dotwalking algorithm if we don't need it
        var getValues = getValuesFunction(options.fieldList);
        gr.addQuery(options.query);
        if (typeof options.max === 'number' && options.max > -1) {
            this.log('Setting max nr of records to '+options.max);
            gr.setLimit(options.max);
        }

        gr.query();

        var result = [];
        var record;

        while (gr.next()) {
            this.log('Processing '+options.table+'_'+gr.getValue('sys_id'));
            record = {};
            options.fieldList.forEach(function (field) {
                record[field] = getValues(gr, field);
                this.log(['field = '+field, 'value = '+record[field]]);
            }, this);
            result.push(record);
        }
        this.log(['getRecordList returns:', JSON.stringify(result, null, '  ')]);

        return result;
    },
    

    /**
     * Retrieves a single record.
     * If a query is provided, that is used. The options field, value, sys_id are ignored if provided
     * If no query is present, the sys_id is used to find a match. If no sys_id is provided, the field and value
     * are matched.
     * @param {Object} options - parameters passed in as an object
     * @param {string} options.table - table name
     * @param {string} options.query - query to be run on options.table
     * @param {string} options.sys_id - sys_id of the record to be found
     * @param {string} options.field - field name
     * @param {string} options.value - value for the field name
     * @returns {Object}
     */
    getRecord: function(options){
        if (typeof options != 'object') return;
        if (typeof options.table !== 'string') return;
        if (!options.fieldList || !Array.isArray(options.fieldList) || options.fieldList.length === 0) return;

        if (typeof options.query !== 'string'){
            if (typeof options.sys_id === 'string'){
                options.query = 'sys_id='+options.sys_id;
            } else {
                if (typeof options.field !== 'string') return;
                if (typeof options.value !== 'string') return;
    
                options.query = options.field+'='+options.value;
            }
        }

        var list = this.getRecordList(options.table, options.query, options.fieldList, 1);
    
        return list[0];
    },
    
    /**
     * Inserts a record in the database
     * @param {Object} options - parameters passed in as an object
     * @param {string} options.table - table name
     * @param {Object} options.values - field/value pairs
     * @param {string} options.values.field - name of the field
     * @param {string|number|boolean} options.values.value - value of the field
     * @returns {string} - return value of GlideRecord.insert (sys_id of the inserted record or null on failure)
     */
    insertRecord: function (options) {
        if (typeof options.table !== 'string') return Error('No table provided or table is not a string');
        if (typeof options.values !== 'object') return Error('No values provided or values is not an object');

        var gr = new GlideRecord(options.table);
        for (var field in options.values) {
            gr.setValue(field, options.values[field]);
        }

        return gr.insert();
    }
};


/**
 * Section below contains private functions
 */


/**
 * The dotwalking algorithm is expensive when compared to the regular getValue. The last one just takes the
 * field name and passes it on the GlideRecord.getValue. The former needs to split the dotwalked field name on
 * dots, and iterate over the array, using subsequent field names to perform the dotwalk.
 * Since we know the field names before we start, we can determine whether dotwalking can be skipped - if none of the
 * field names contains a dot. If so, we return the regular (faster) getValue function, otherwise we will use the
 * dotwalking algorithm.
 * @param {string[]} fieldList - list of the field names
 * @returns {Function} - function to be used to retrieve value/display value pairs from a gliderecord
 */
function getValuesFunction(fieldList){
    var dotwalk = (fieldList.some(function(field){
        return field.indexOf('.') > -1;
    }));

    return dotwalk ? _getDotWalkValues : _getValues;
}

/**
 * Returns the value and display value of a field. Does not support dotwalking
 * @param {GlideRecord} gr - glide record variable
 * @param {string} field - field name
 * @returns {Object} - object has two keys: value and display, containing the field's value and display value respectively
 */
function _getValues(gr, field) {
    return {
        value: gr.getValue(field),
        display: gr.getDisplayValue(field)
    };
}

/**
 * Returns the value and display value of a field. Supports dotwalking
 * @param {GlideRecord} gr - glide record variable
 * @param {string} field - field name
 * @returns {Object} - object has two keys: value and display, containing the field's value and display value respectively
 */
function _getDotWalkValues(gr, field) {
    if (typeof field !== 'string') return;

    var fields;
    fields = field.split('.');
    do
        gr = gr[fields.shift()];
    while (fields.length > 0);

    return {
        value: gr.getValue(),
        display: gr.getDisplayValue()
    };
}

function Error(e, debug){
    if (typeof e === 'string'){
        // custom generated error
        return {
            hasError: true,
            name: '__RecordUtils error',
            message: e,
            debug: debug
        }
    } else {
        // system generated error
        return {
            hasError: true,
            message: e.message,
            name: e.name || '__RecordUtils error',
            lineNumber: e.lineNumber
        }
    }
}