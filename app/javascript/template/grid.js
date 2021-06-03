Ext.define('Admin.view.template.Grid',{
    extend: 'Ext.grid.Panel',
    xtype: 'admingrid',
    width: '100%',
    store:[],
    preventHeader: true,
    // scrollable: true,
    customActionColumns: [],
    customTBarItems: [],
    disableConfig: {},
    store: [],
    storeConfig: [],
    root:{
        disableAll: false,
        disableDefaultConfig: false,
        disableActionColumns: false,
        disableTopToolbar: false,
        disablePagination: false,
        disableStatusColumn: false,
        disableIsActiveColumn: false,
        disable: {
            search: false,
            create: false,
            update: false,
            destroy: false,
            read: false
        }
    },
    viewConfig:{
        enableTextSelection: true,
    },
    initComponent: function(){
        const me = this;
        const columns = me.columns;
        columns.map(column => {
            column.menuDisabled = true;
            return column;
        });
        const tbar = me.processTbar();
        me.processStore();
        const newColumn = [...columns, ...me.processActionColumns()];
        Ext.apply(me,{
            columns: newColumn,
            ...(me.processTbar()),
            selModel: me.selModel || { mode: 'MULTI' },
            ...(me.paginationContainer()),
            ...(me.processGrouping())
        });
        me.callParent(arguments);
    },
    paginationContainer: function(){
        const me = this;
        const newConfig = me.getRootConfig();
        if(newConfig.disableAll || newConfig.disablePagination)
            return {};
        return {
            bbar:{
                xtype: 'pagingtoolbar',
                store: me.store,
                displayInfo: true,
                inputItemWidth: 45 
            }
        }
        // return {bbar: },
    },
    getRootConfig: function(){
        const me = this;
        return {...(me.root), ...(me.disableConfig)}
    },
    processGrouping: function(){
        const me=this;
        if(!me.groupField)
            return {};
        const headerTPL = { groupHeaderTpl: '{name}' };
        const headerAttr = headerAttr
        if(headerAttr){
            groupHeaderTpl.groupHeaderTpl = typeof headerAttr === 'function' ? headerAttr(me.store) : headerAttr
        }
        me.groupField.features = [{
            ftype: 'grouping',
            startCollapsed: true,
            ...groupHeaderTpl
        }]
        return me.groupField;
    },
    processStore: function(){
        const me=this;
        const url = me.url;
        var route='', fieldGroup={};
        if(!url) {
            me.store = []
            return;
        }

        if( me.fieldGroup ){
            fieldGroup = {groupField: me.fieldGroup.field};
        }
        
        if(typeof url === 'object'){
            route = Routes[url.path](url.id);
        }else{
            route = Routes[url]()
        }
        me.store = Ext.create({
            xtype: 'adminstore', 
            url: route,
            ...fieldGroup,
            ...(me.storeConfig)
        });
    },
    processActionColumns: function(){
        const me = this;
        const actionColumns = [];
        const newConfig = me.getRootConfig();
        if( newConfig.disableAll || newConfig.disableActionColumns  )
            return [];
        if( !newConfig.disable.update ){
            actionColumns.push({
                iconCls: 'x-fa fa-edit x-btn-col-icon-success',
                tooltip: 'Edit',
                text: 'Edit',
                handler: function (grid, rowIndex, colIndex, item, e, record, row) {
                //   const formWindow = Ext.create(self.form, { record, url: self.url, access: self.access });
                //   console.log(formWindow);
                //   self.up().add(formWindow);
                //   formWindow.show();
                
                    const form = Ext.create({ 
                        xtype: `${me.xtype}form`,
                        record,
                        url: me.url,
                        store: me.store
                    });
                    form.show();
                }
            })
        }

        if( !newConfig.disable.destroy ){
            actionColumns.push({
                iconCls: 'x-fa fa-trash x-btn-col-icon-danger',
                tooltip: 'Delete',
                text: 'Delete',
                handler: function (grid, rowIndex, colIndex, item, e, record, row) {
                    console.info('action column destroy called in row')
                    me.removeRecords([record])
                }
              })
        }
        
        if( me.customActionColumns.length > 0){
            me.customActionColumns.map(column => { 
                if( typeof column.position === 'undefined' ) column.position = actionColumns.length;
                actionColumns.splice(column.position, 0, column);
            })
        }
        const addedColumns = []
        if(!newConfig.disableIsActiveColumn){
            addedColumns.push({ 
                text: 'Active', 
                dataIndex: 'is_active', 
                width:  60, 
                align: 'center', 
                sortable: false, 
                menuDisabled: true, 
                xtype: 'booleancolumn', 
                trueText: '<i class="x-fa fa-circle x-color-green">', 
                falseText: '<i class="x-fa fa-circle x-color-red">' 
            })
        }

        if(actionColumns.length > 0){
            const minWidth = me.forceFit ? {minWidth: '15%'} : {};
            addedColumns.push({
                menuDisabled: true,
                xtype: 'actioncolumn',
                sortable: false,
                align: 'center',
                ...minWidth,
                items: actionColumns
            });
        }
        
        return addedColumns;
    },
    processTbar: function(){
        const me = this;
        const store = me.store;
        const tbar = [];

        const newConfig = me.getRootConfig();
        
        if(me.customTBarItems.length > 0){
            me.customTBarItems.map(item => {
                if(item.position === undefined) item.position = tbar.length;
                tbar.splice(item.position, 0, item);
            })
        }
        
        if( newConfig.disableAll || newConfig.disableTopToolbar  ){
            return tbar.length ? {tbar} : [];
        }else{
            tbar.splice(tbar.length,0,'->');
        }

        if(!newConfig.disable.search){
            tbar.push({
                xtype: 'searchfield',
                store: store,
                minWidth: 250
            })
        }

        if( !newConfig.disable.create ){
            tbar.push({
                tooltip: 'New Record',
                iconCls: 'x-fa fa-plus x-btn-col-icon-success',
                handler: function () {
                    const form = Ext.create({ 
                        url: me.url,
                        xtype: `${me.xtype}form`,
                        store
                    });
                    form.show();
                }
            })
        }

        if( !newConfig.disable.destroy ){
            tbar.push({
                tooltip: 'Remove Record',
                iconCls: 'x-fa fa-trash x-btn-col-icon-danger',
                handler: () => {
                    const records = me.getSelection();
                    me.removeRecords(records);
                //   const records = self.getSelection();
                //   self.deleteItems(records)
                }
            })
        }

        if( tbar.length > 0 ){
            return { tbar }
        }

        return [];
    },
    removeRecords: function(records){
        const me = this;
        const store = me.getStore();
        if(records === undefined || records.length === 0){
            notify('Please select record(s) to remove.', false);
            return;
        };
        const messagebox = Ext.create('Ext.window.MessageBox',{
            closeAction: 'destroy',
            buttonAlign: 'center',
            draggable: false,
            closable: false,
            buttons: [
                {
                    text: 'Yes',
                    uiCls: ['save'],
                    handler: function(){
                        var ids = records.filter(x => typeof x.get('id') === 'number').map(function (record) { return record.get('id') });
                        store.remove(records);
                        if(ids.length === 0) return;
                        messagebox.close();
                        const loading = Ext.Msg.wait('Please wait...');
                        var p = { authenticity_token: authenticityToken(), };
                        p['id[]'] = ids;
                        store.sync({
                            params: p,
                            callback: function(batch, options){
                                const response = batch.operations[0].request.getRawRequest().result.responseText;
                                const result = Ext.decode(response);
                                const pagination = me.down('pagingtoolbar');
                                notify(result.message || result.errors, result.success);
                                loading.close();
                                if(result.errors){
                                    store.rejectChanges();
                                }else{
                                    if(pagination) pagination.doRefresh();
                                }
                            }
                        })
                    }
                },
                {
                    text: 'No',
                    handler: function(){
                        messagebox.close();
                    }
                }
            ]
        })
        messagebox.show({
            title: 'ShakeSalad',
            message: 'Are you sure you want to delete selected record(s)',
        })
    }
})