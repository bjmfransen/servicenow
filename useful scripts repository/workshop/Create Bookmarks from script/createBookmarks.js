function run(){
	var favs = new Favorites();


	// create entries for development group
	// var si = genOptions('list', 'Script Includes', 'sys_script_include');
	// var uia = genOptions('list', 'UI Actions', 'sys_ui_action');
	favs.startGroup('Development');
	favs.add('list', 'Script Includes', 'sys_script_include')
	favs.add('list', 'UI Actions', 'sys_ui_action');
	favs.add('list', 'My Logs Today', 'syslog', 'sys_created_onONToday@javascript:gs.beginningOfToday()@javascript:gs.endOfToday()^sourceSTARTSWITHBJF');
	favs.endGroup();

	favs.startGroup('Baanbrekend');
	favs.add('list', 'Invoices', 'u_invoice');
	favs.add('list', 'Journal Entries', 'u_journal_entry');
	favs.add('list', 'Expense Lines', 'fm_expense_line');



}


function Favorites(){
	this.list = [];

	this.add = function(type, title){
		var options = {
			title: title
		};

		switch (type){
			case 'record':
				options.table = arguments[2];
				options.sys_id = arguments[3];
				break;
			case 'list':
				options.table = arguments[2];
				options.query = arguments[3];
				break;
		}

		if (this.current){
			this.current.children.push(options);
		} else {
			this.list.push(options);
		}

		return options;
	}

	this.startGroup = function(title){
		if (typeof this.current != 'undefined'){
			//if there is a current group going, close it before starting a new one
			this.endGroup();
		}
		this.current = {
			title: title,
			children: []
		}
	}

	this.endGroup = function(){
		this.list.push(this.current);
		this.current = null;
	}

	this.create = function(){
		this.list.forEach(function(options){
			if (typeof options.children === 'undefined'){
				createBookmark(options)
			} else {
				createBookmarkGroup(options);
			}
		})
	}
}


function createBookmark(options){
	var grBookmark = new GlideRecord('sys_ui_bookmark');
	var key;
	var excludeKeys = ['table', 'query', 'sys_id'];

	options.user = options.user || gs.getUserID();

	if (typeof options.url === 'undefined' && typeof options.table != 'undefined'){
		if (typeof query != 'undefined'){
			options.url = options.table + '_list.do?sysparm_query='+options.query
		} else if (typeof sys_id != 'undefined'){
			options.url = options.table + '.do?sys_id='+options.sys_id;
		}
	}

	// every key in options matches a field name
	// unless that key is part of exculdeKeys, it will be copied to the record
	for (key in options){
		if (excludeKeys.indexOf(key) === -1){
			grBookmark.setValue(key, options[key])
		}
	}

	return grBookmark.insert();
}

function createBookmarkGroup(options){
	var grBookmarkGroup = new GlideRecord('sys_ui_bookmark_group');
	var key;
	var groupId;

	options.user = options.user || gs.getUserID();

	for (key in options){
		grBookmarkGroup.setValue(key, options[key]);
	}

	groupId = grBookmarkGroup.insert();
	gs.log('inserted bookmarkgroup with sys_id = '+groupId, 'TEST')
	options.children.forEach((function(groupId){
		gs.log('running iife with sys_id = '+groupId, 'TEST')
		return function(element, index){
			gs.log('> callback running, elm/index/id = '+JSON.stringify(element)+' - '+index+' - '+groupId, 'TEST')
			element.group = groupId;
			createBookmark(element)
		}
	})(groupId))
}