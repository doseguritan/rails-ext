Ext.define('Admin.view.main.Main', {
    extend: 'Ext.container.Viewport',
    

    controller: 'main',

    cls: 'sencha-dash-viewport',
    itemId: 'mainView',

    layout: {
        type: 'vbox',
        align: 'stretch'
    },

    listeners: {
        render: 'onMainViewRender'
    },

    items:[
        {
            xtype: 'toolbar',
            cls: 'sencha-dash-dash-headerbar shadow',
            height: 64,
            itemId: 'headerBar',
            items: [
                {
                    xtype: 'component',
                    reference: 'senchaLogo',
                    cls: 'sencha-logo',
                    html: '<div class="main-logo"><img src="/resources/images/logo.png" height="23px">Smart Vending</div>',
                    width: 250
                },
                {
                    margin: '0 0 0 8',
                    ui: 'header',
                    iconCls:'x-fa fa-navicon',
                    id: 'main-navigation-btn',
                    handler: 'onToggleNavigationSize'
                },
                {
                    xtype: 'tbtext',
                    reference: 'moduleTitle',
                    style: {
                        fontSize: '18px'
                    }
                },
                '->',
                // {
                //     xtype: 'image',
                //     cls: 'header-right-profile-image',
                //     height: 35,
                //     width: 35,
                //     alt:'current user image',
                //     src: window.current_user.image
                // },
                {
                    iconCls: 'x-fa fa-cogs',
                    text: window.current_user.user,
                    iconAlign: 'right',
                    menuAlign: 'tr-br?',
                    menu: [
                        {
                            text: 'Edit Profile',
                            iconCls: 'x-fa fa-user'
                        },
                        {
                            text: 'Change Password',
                            iconCls: 'x-fa fa-user-secret'
                        },
                        {
                            text: 'Logout',
                            iconCls: 'x-fa fa-user-times',
                            href: `${window.location.origin}/${Routes.destroy_user_session_path({format: 'html'})}`
                        }
                    ]
                }
            ]
        },
        {
            xtype: 'maincontainerwrap',
            id: 'main-view-detail-wrap',
            reference: 'mainContainerWrap',
            flex: 1,
            items: [
                {
                    xtype: 'treelist',
                    reference: 'navigationTreeList',
                    itemId: 'navigationTreeList',
                    ui: 'navigation',
                    width: 250,
                    expanderFirst: false,
                    expanderOnly: false,
                    scrollable: true,
                    listeners: {
                        selectionchange: 'onNavigationTreeSelectionChange'
                    },
                    store:{
                        root: {
                            expanded: true,
                            children: window.navigation_menus
                        }
                    }
                },
                {
                    xtype: 'container',
                    flex: 1,
                    reference: 'mainCardPanel',
                    cls: 'sencha-dash-right-main-container',
                    itemId: 'contentPanel',
                    layout: {
                        type: 'card',
                        anchor: '100%'
                    }
                }
            ]
        }
    ]
});
