Ext.define('Admin.view.authentication.AuthenticationController', {
    extend: 'Ext.app.ViewController',
    alias: 'controller.authentication',

    //TODO: implement central Facebook OATH handling here

    onFaceBookLogin : function() {
        this.redirectTo('dashboard', true);
    },

    onLoginButton: function(button) {
        const form = button.up('form').getForm();
        if(!form.isValid()){
            return;
        }
        form.submit({
            url: Routes.user_session_path({format: 'json'}),
            method: 'post',
            params: {
                authenticity_token: authenticityToken()
            },
            submitEmptyText: false,
            waitMsg: 'Processing request...',
            success: function(f, action){
                var response = action.result
                console.log(response)
                window.location.href="/";
                console.log('Hello world')
                // notify(response.message, true);
                // Ext.Msg.alert(response.message);
            },
            failure: function(f, action){
                var response = Ext.JSON.decode(action.response.responseText)
                console.log(response)
                notify(response.error, false,{position: 'center', offset: {y: 44 }})
            }
        })
        // this.redirectTo('dashboard', true);
    },

    onLoginAsButton: function() {
        console.log(this)
        // this.redirectTo('login', true);
    },

    onNewAccount:  function() {
        this.redirectTo('register', true);
    },

    onSignupClick:  function() {
        this.redirectTo('adminlayout', true);
    },

    onResetClick:  function() {
        this.redirectTo('adminlayout', true);
    }
});