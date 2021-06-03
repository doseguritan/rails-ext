Ext.define('Admin.view.template.Form',{
    extend: 'Ext.form.Panel',
    xtype: 'adminform',
    modal: true,
    floating: true,
    closable: false,
    bodyPadding: 10,
    removeDefaultButtons: false,
    autoDestroy: true,
    submitHasError: false,
    formTitleAttribute: 'name',
    initComponent: function(){
        const me = this;
        console.log(this.formTitleAttribute)
        Ext.apply(me, {
            draggable: false,
            resizable: false,
            width: me.width || '50%',
            title: me.title || (me.record ? `Update ${me.record.get(me.formTitleAttribute)}` : 'New Record'),
            maxHeight: Ext.getBody().getHeight() - 200,
            ...(me.processSubmitButtons())
        });
        me.callParent(arguments);
    },
    listeners: {
        beforerender: function(form){
            form.loadRecordToForm();
        }
    },
    setSubmitError: function(has_error){
        const me = this;
        me.submitHasError = has_error;
    },
    processSubmitButtons: function(){
        const me = this;
        if(me.removeDefaultButtons){
            return {}
        }
        return {
            buttons:[
                {
                    text: 'Cancel',
                    uiCls: ['cancel'],
                    handler: function(){
                        me.close();
                    }
                },
                {
                    text: me.record ? 'Update' : 'Save',
                    uiCls: ['save'],
                    handler: function(){
                        me.beforeSubmit();
                        console.log(me.submitHasError)
                        if( me.submitHasError ) return;
                        if(!me.isValid()){
                            notify("Please review form.", false);
                            return;
                        }
                        Ext.Msg.confirm('Confirm?',me.confirmSubmitText || `Are you want to ${me.record ? 'Update this' : 'Create new'} record?`, function(btn){
                            if(btn !== "yes")
                                return;
                                
                            me.submit({
                                url: me.processURL(),
                                params: me.processParams(),
                                waitMsg: 'Processing request...',
                                submitEmptyText: false,
                                success: function(f, action){
                                    var response = action.result
                                    notify(response.message, true);
                                    if(me.store) me.store.reload();
                                    me.close();
                                    me.submitFormSuccess(response);
                                },
                                failure: function(f, action){
                                    var response = Ext.JSON.decode(action.response.responseText)
                                    console.log(response)
                                    notify(response.errors || response.error, false);
                                }
                            })
                        })
                    }

                }
            ]
        }
    },
    processURL: function(){
        const me=this;
        const new_record = !me.record;
        const url = me.convertURL();
        console.log(url)
        return (new_record ? Routes[me.url]() : Routes[url](me.record.get('id')));
    },
    convertURL: function(){
        const me=this;
        const url = PLURAL.singular(me.url.replace('_path','')) + '_path';
        return url;
        // console.log(url)
        // return me.url.replace(/ies_path|s_path|es_path/g, (match) => {
        //     switch(match){
        //         case 'ies_path':
        //             return 'y_path';
        //         case 's_path':
        //         case 'es_path':
        //             return '_path';
        //         default:
        //             return '';
        //     }
        // })
    },
    processParams: function(){
        const me = this;
        return {
            _method: me.record ? 'PUT' : 'POST',
            utf8: true,
            authenticity_token: authenticityToken(),
            ...(me.getParams())
        }
    },
    beforeSubmit: ()=>{},
    submitFormSuccess: () => {},
    setParams: function(params){
        const me=this;
        me.params = params;
    },
    getParams: function(){
        const me=this;
        return me.params;
    },
    loadRecordToForm: function(){
        const me=this;
        const record = me.record;
        if(!record) return;
        try {
            const fields = me.getForm().getFields().items.map(item => {
                if(!item.submitValue) return;
                const key_list = (item.recordKey || item.getName()).replace(/\]/g,'').split(/\.|\[/g).filter( ( x, i) => {
                    if(item.recordKey)
                        return true

                    return i !== 0 && !x.includes('attributes');
                });
                if(key_list.length === 0) return;
                const value = me.getValueFromRecord(key_list, record.getData());
                item.setValue(value);
            })
            me.afterLoadData(me.record);
        } catch (error) {
            console.log(error.message)
        }
    },
    getValueFromRecord: function(key_list, record){
        const current_key = key_list[0];
        if(key_list.length === 1)
            return record[current_key];
        key_list.splice(0, 1);
        return me.getValueFromRecord(key_list, record[current_key]);

    },
    afterLoadData: function(record){}
})