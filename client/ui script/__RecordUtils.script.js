/**
 * Client side pendant of the script include __RecordUtils. It can be invoked using identical syntax.
 * The methods return a promise. The data returned by the server's equivalent method is passed on 
 * to the promise's revolve function.
 * So e.g. the server method getRecordList returns a list of records. By invoking the client version, that
 * record list will be available in the resolve function:
 * 
 * new RecordUtils(true).getRecordList(options).then(function(recordList){
 *   // process recordList
 * })
 * 
 * 
 * 
 * @param {boolean} enableLogging - whether server side logging is enabled
 * @returns {RecordUtils} - this
 */
function RecordUtils(enableLogging){
    var scriptIncludeName = '__RecordUtils';
    this.enableLogging = !!enableLogging;

    /**
     * Retrieves data from a table
     *
     * @param {Object}   options - parameters are passed in through an options object
     * @param {string}   options.table - the table to query
     * @param {string}   options.query - encoded query string
     * @param {string[]} options.fieldList - list of fields whose values will be returned
     * @param {number}   options.max - the number of records to be returned, -1 returns all
     * @returns {Promise} - resolve function of the promise accepts an array with records and name value pairs of the fieldList (both display and value).
     */
    this.getRecordList = function(options){
        return AjaxBus(scriptIncludeName, 'getRecordList', options, this.enableLogging);
    };

    this.getValueDisplayList = function(options){
        if (!options.field) return;
        options.fieldList = [options.field];

        return this.getRecordList(options).then(function(recordList){
            var lists = {
                valueList: [],
                displayList: []
            };
            
            recordList.forEach(function(record, index){
                console.log(index, record)
                lists.valueList.push(record[options.field].value);
                lists.displayList.push(record[options.field].display);
            });

            return lists;
        });
    };

    this.getRecord = function(options){
        options.enableLogging = this.enableLogging;
        return AjaxBus(scriptIncludeName , 'getRecord', options);
    };

    return this;
};


