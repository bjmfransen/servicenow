      Var cat_sys_id = current.sys_id.toString();


      var attrs = new Packages.java.util.HashMap();


      var table_name= 'custom_table';


      var fname;


      var src_table = new GlideRecord('asmt_metric');


      src_table.addQuery('category', cat_sys_id);


      src_table.query();


      while(src_table.next())


              {


              fname = src_table.name;


              var ca = new GlideColumnAttributes(fname);


              ca.setType("string");


              ca.setUsePrefix(true);


              attrs.put(fname, ca);


      }


      var tc = new GlideTableCreator(table_name , table_name);


      tc.setColumnAttributes(attrs);


      if(typeof extends_table != 'undefined') tc.setExtends(extends_table);


      tc.update();