Ext.define("Admin.view.template.Store", {
    extend: 'Ext.data.Store',
    xtype: 'adminstore',
    alias: 'store.adminstore',
    listeners: {
      metachange: function (store, meta) {
        store.fields = meta.fields;
        store.setPageSize(meta.pageSize || store.pageSize);
        if (meta.grouper) store.groupField = meta.grouper
      },
      load: function (store, records, success, operation, opts) {
        const error = operation.error;
        if(error){
          if(error.status === 401){
            const response = Ext.JSON.decode(error.response.responseText, true);
            notify(response.error, false);
            return;
          }
          notify('Something went wrong. \nPlease contact administrator.', false);
        }else{
          if(this.onLoadProcess) this.onLoadProcess(operation.getResponse().responseText)
        }
      }
    },
    constructor: function (cfg) {
      const me = this;
      cfg = cfg || {};
      me.callParent([Ext.apply({
        autoLoad: true,
        pageSize: 25,
        remoteSort: true,
        onLoadProcess: me.onLoadProcess,
        proxy: {
          url: cfg.url,
          type: 'ajax',
          reader: {
            type: 'json',
            idProperty: 'id',
            totalProperty: 'total',
            rootProperty: 'data'
          },
          actionMethods: {
            create: 'POST',
            read: 'GET',
            destroy: 'DELETE',
            update: 'PUT'
          }
        }
      }, cfg)]);
    }
  }); 