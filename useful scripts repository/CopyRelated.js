function CopyRelated(id, table, relatedTable, relatedField){
	/**
	 * Copies a record including related records. The relations are of type 1-n
	 * @param {string} id - sys_id of the source record
	 * @param {string} table - name of the source table
	 * @param {string} relatedTable - name of the related table
	 * @param {string} relatedField - name of the field in relatedTable that references the source table record
	 * @returns {object} - newly insert record
	 */
	var grRecord = new GlideRecord(table);
	var grRelatedRecord = new GlideRecord(relatedTable);
	var newId;
	if (grRecord.get(id)){
		grRecord.setValue('name', grRecord.getValue('name')+' (Copy)')
		newId = grRecord.insert();

		grRelatedRecord.addQuery(relatedField, id);
		grRelatedRecord.query();

		while (grRelatedRecord.next()){
			grRelatedRecord.setValue(relatedField, newId);
			grRelatedRecord.insert();
		}
	}

	return grRecord;
}

function CopyCatalogItem(id){
	CopyRelated(id, 'sc_cat_item', 'item_option_new', 'cat_item')
}
