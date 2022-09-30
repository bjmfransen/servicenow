var __DataUtils = Class.create();
__DataUtils.prototype = {
    initialize: function () { },

    /**
     * Retrieves data from a table
     *
     * @param {string} table - the table to query
     * @param {string} query - encoded query string
     * @param {array} fields - fields to be returned
     * @param {number} max - the number of records to be returned, -1 returns all
     * @returns {array} - array with records and name value pairs of the fields (both display and value).
     */
     getRecordList: function (table, query, fields, max) {
        var gr = new GlideRecord(table);

        // determine if the getValues function needs to perform dotwalks
        var getValues = getValuesFunction(fields);

        if (fields.indexOf('sys_id') === -1) {
            fields.push('sys_id');
        }
        gr.addQuery(query);
        if (typeof max === 'number' && max > -1) {
            gr.setLimit(max);
        }
        gr.query();

        var result = [];
        var record;
        while (gr.next()) {
            record = {};
            fields.forEach(function (field) {
                record[field] = getValues(gr, field);
            });
            result.push(record);
        }
        return result;
    },
    
    getValuesAndDisplay: function(table, query, field, max){
        // convert a record list to two arrays: one with the field's values, one with the field's display values
        // this way we can use these values/display values on the client in multi select boxes
        var recordList = this.getRecordList(table, query, [field], max);
        var result = {
            valueList: [],
            displayList: []
        };

        recordList.forEach(function(record){
            result.valueList.push(record[field].value);
            result.displayList.push(record[field].display);
        })

        return result;
    },

    insertRecord: function (table, values) {
        /**
         * Inserts a record into a table.
         * @param {string} table - name of the table where the record is inserted
         * @param {Object} values = field/value pairs
         * @returns {string} sys_id of the inserted record
         */
        if (typeof table !== 'string') return -1;
        if (typeof values !== 'object') return -2;

        var gr = new GlideRecord(table);
        for (var field in values) {
            gr.setValue(field, values[field]);
        }

        return gr.insert();
    }
};

function getValuesFunction(fields){
    // if we do not need to dotwalk, we can use a much more efficient function
    // than if we do. for performance reason we implement both functions and determine
    // runtime which one to use
    var dotwalk = (fields.some(function(field){
        return field.indexOf('.') > -1;
    }));

    return dotwalk ? _getDotWalkValues : _getValues;
}

function _getValues(gr, field) {
    return {
        value: gr.getValue(field),
        display: gr.getDisplayValue(field)
    };
}

function _getDotWalkValues(gr, field) {
    if (typeof field != 'string') return;

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

var utils = new bjDataUtils();
var records = utils.getRecordList('sys_user_grmember', 'user.user_name=falcon', ['user.first_name']);
gs.info(JSON.stringify(records, null, '  '));
