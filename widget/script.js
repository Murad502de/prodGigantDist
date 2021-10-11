define( [ 'jquery', 'underscore', 'twigjs', 'lib/components/base/modal' ], function ( $, _, Twig, Modal ) {
    let CustomWidget = function () {
        console.debug( "gigantDist << start" );
        
        let self = this;

        this.config = {
            baseUrl : 'https://growth-amo.gigwork.ru',
            name    : 'gigantDist',
        },

        this.selectors = {
            workArea  : 'div#work-area-',

            listTable : 'list_table',
            tableBody : 'table_body',
            tableHead : 'table_head',

            advancedSettingsWrapper  : 'advanced_settings_wrapper',
            listFooter               : `list__footer`,
            activePagePagination     : 'pagination-link__wrapper-active',
            defItemCountOnPage       : 'control--select--list--item',
            paginationPages          : 'pagination-pages',
            saveBtnBlue              : 'button-input_blue',
            paginationLink           : `${self.config.name}_js-pagination-link`,
            pagePrev                 : `${self.config.name}_prev`,
            pageNext                 : `${self.config.name}_next`,
            searchInput              : `${self.config.name}_search_input`,
            addRoleButton            : `${self.config.name}_addrole_wrapper`,
            searchUserInput          : `${self.config.name}_search_wrapper`,
            moreDistUl               : `${self.config.name}_more_dist-menu`,
            idLiPercentDist          : `${self.config.name}_percent-dist`,
            idLiCountDist            : `${self.config.name}_count-dist`,
            inputSettingsDistPercent : `${self.config.name}_input-dist_percent`,
            inputSettingsDistCount   : `${self.config.name}_input-dist_count`,
            spanPipeSwitch           : `${self.config.name}_control--select--button-inner`,
            ooPipeSwitch             : `${self.config.name}_oo`,
            yoPipeSwitch             : `${self.config.name}_yo`,
            pipeSwitch               : `${self.config.name}_pipe-switch`,
            percentDistSave          : `${self.config.name}_percent-save`,
            countDistSave            : `${self.config.name}_count-save`,
            ooPercent                : `${self.config.name}_percent_oo_value`,
            yoPercent                : `${self.config.name}_percent_yo_value`,
            ooCount                  : `${self.config.name}_count_oo_value`,
            yoCount                  : `${self.config.name}_count_yo_value`,

            js : {
                tableRow         : 'div[data-id="tableRow"]',
                advancedHead     : 'div.list__body-right__top',
                listTable        : '#list_table',
                spinner          : '#page_change_loader',
                weight           : '.gigantDist_weight_dist',
                weightEdit       : '.weight_editPanel',
                closeEditPanel   : 'button#cancelEditWeight',
                confirmEditPanel : 'button#confirmEditWeight',
                inputEditWeight  : '#editWeight_input',
                idAddRoleButton  : '#addRole',
                statusWrapper    : '.gigantDist_switcher__inner',
                deleteRole       : 'span.button-delete',
                editRole         : 'input.gigantDist_role',
                saveRoleList     : 'button.js-modal-accept__roles.button-input_blue',
                deniedWork       : '.js-modal-denied_work',
                closeModal       : ".modal-body__close",
                addNewLeadButton : 'a[data-href="/leads/add/"]'
            },

            css : {
                idAddRoleButton  : 'addRole',
                idMoreDistButton : 'more_dist'
            }
        },

        // methods for getting
        this.getters = {
            getData          : function ( currentPage, callback = null, init = false ) {
                self.renderers.renderSpinner();
                self.renderers.removeTable();

                self.updateData = [];

                $.get(
                    self.config.baseUrl + '/api/distribution/settings/list',

                    {
                        count: self.data.itemCountOnPage,
                        page: currentPage
                    },

                    ( response ) => {
                        let timeout = 1000;

                        self.usersList = response.data;
                        self.data.currentPage = Number( response.current_page );
                        self.data.lastPage = Number( response.last_page );
                        self.data.links = response.links;

                        console.debug( response ); // Debug
                        console.debug( self.usersList ); // Debug

                        self.renderers.renderTableBody( self.selectors.js.listTable, self.usersList );

                        if ( init )
                        {
                            self.renderers.renderPagination( `.${self.selectors.advancedSettingsWrapper}` );
                        }
                        else
                        {
                            $( `div.${self.selectors.paginationPages}` ).empty();
                            self.renderers.renderPaginationPages( `div.${self.selectors.paginationPages}` );
                        }

                        setTimeout(
                            () => {
                                self.renderers.removeSpinner();
                                self.data.rowList = $( 'div[data-id="tableRow"]' );
                            },

                            timeout
                        );
                    },

                    'json'
                );
            },

            getRoleData      : function ( callback = null ) {
                $.get(
                    self.config.baseUrl + '/api/distribution/roles',

                    ( roles ) => {
                        console.debug( roles );

                        self.data.roleInputList = roles;
                        callback();
                    },

                    'json'
                );
            },

            getStatus        : function ( callback = null ) {
                $.get(
                    self.config.baseUrl + '/api/distribution/staffs/' + AMOCRM.constant( 'user' ).id,

                    ( data, textStatus, xhr ) => {
                        console.debug( 'data:' ); // Debug
                        console.debug( data ); // Debug
                        console.debug( 'status: ' + data.status ); // Debug

                        if ( data.show )
                        {
                            console.debug( 'switcher can be render' ); // Debug

                            callback( '.list__top__actions', data.status );
                        }
                    },

                    'json'
                );
            },

            getValPipeSwitch : function ( callback = null ) {
                console.debug( self.config.name + ' << [getter] : getValPipeSwitch' ); // Debug

                $.get(
                    self.config.baseUrl + '/api/distribution/staffs/status/pipeline',

                    {
                        staff_id : AMOCRM.constant( 'user' ).id
                    },

                    ( data, textStatus, xhr ) => {
                        console.debug( 'data of getValPipeSwitch:' ); // Debug
                        console.debug( data );

                        if ( callback )
                        {
                            if ( callback.params )
                            {
                                callback.params[ 'listValue' ] = data.pipeline;

                                callback.exec( callback.params );
                            }
                            else
                            {
                                callback.exec();
                            }
                        }
                    },

                    'json'
                );
            },

            getPercentDist   : function ( callback = null ) {
                console.debug( self.config.name + ' << [getter] : getPercentDist' ); // Debug

                $.get(
                    self.config.baseUrl + '/api/distribution/settings/percent',
                    ( data, textStatus, xhr ) => {
                        console.debug( 'data of getPercentDist:' ); // Debug
                        console.debug( data );

                        if ( callback )
                        {
                            if ( callback.params )
                            {
                                callback.params[ 'percentDistData' ] = data;

                                callback.exec( callback.params );
                            }
                            else
                            {
                                callback.exec(
                                    {
                                        percentDistData : data
                                    }
                                );
                            }
                        }
                    },

                    'json'
                );
            },

            getCountDist     : function ( callback = null ) {
                console.debug( self.config.name + ' << [getter] : getCountDist' ); // Debug

                $.get(
                    self.config.baseUrl + '/api/distribution/settings/count',
                    ( data, textStatus, xhr ) => {
                        console.debug( 'data of getCountDist:' ); // Debug
                        console.debug( data );

                        if ( callback )
                        {
                            if ( callback.params )
                            {
                                callback.params[ 'countDistData' ] = data;

                                callback.exec( callback.params );
                            }
                            else
                            {
                                callback.exec(
                                    {
                                        countDistData : data
                                    }
                                );
                            }
                        }
                    },

                    'json'
                );
            },

            getDataFromTable : function ( tableRows = false ) {
                let originalUserList = tableRows ? tableRows : $( 'div[data-id="tableRow"]' );
                let userList = [];

                for ( let user = 0; user < originalUserList.length; user++ )
                {
                    userList.push(
                        {
                            staff_id: originalUserList[ user ].getAttribute( 'id' ),
                            name: originalUserList[ user ].querySelectorAll( 'div[data-field-code="name"] span[data-id="tableRow_name__span"]' )[ 0 ].innerText,
                            role_name: originalUserList[ user ].querySelectorAll( 'div[data-field-code="role"] span[data-id="tableRow_role__span"]' )[ 0 ].innerText,
                            weight: Number ( originalUserList[ user ].querySelectorAll( 'div[data-field-code="weight"] span[data-id="tableRow_weight__span"]' )[ 0 ].innerText ),
                            left: Number ( originalUserList[ user ].querySelectorAll( 'div[data-field-code="left"] span[data-id="tableRow_left__span"]' )[ 0 ].innerText ),
                            active_minutes: Number ( originalUserList[ user ].querySelectorAll( 'div[data-field-code="active_minutes"] span[data-id="tableRow_active_minutes__span"]' )[ 0 ].innerText ),
                            status: Number( originalUserList[ user ].querySelectorAll( 'div[data-field-code="status"]' )[0].getAttribute( 'data-value' ) )
                        }
                    );
                }

                console.debug( userList ); // Debug

                return userList.length ? userList : false;
            }
        },

        this.setters = {
            setStatus          : function ( staff_id, status ) {
                console.debug( self.config.name + ' << [setter] : setStatus' ); // Debug

                $.ajax(
                    {
                        method: 'PUT',
                        dataType: "json",
                        url: self.config.baseUrl + '/api/distribution/staffs/status',
                        data: {
                            status: Number( status ),
                            staff_id: Number( staff_id )
                            //previousStatus: previousStatus
                        },
                        error: ( XMLHttpRequest, textStatus, errorThrown ) => {
                            console.debug( "ajax setStatus error" );
                            console.debug( XMLHttpRequest, textStatus, errorThrown );
                        }
                    }
                )
                .then(
                    ( response ) => {
                        console.debug( "ajax setStatus success" );
                        console.debug( response );
                    }
                );
            },

            setWeight          : function ( updateData ) {
                console.debug( self.config.name + ' << [setter] : setWeight' ); // Debug

                $.ajax(
                    {
                        url: self.config.baseUrl + "/api/distribution/settings/save",
                        method: "post",
                        dataType: "json",

                        data: {
                            data: updateData
                        },

                        beforeSend: function (){},
                        complete: function (){},

                        error: function ( jqXHR, textStatus, errorThrown  ) {
                            console.error( 'Ошибка времени исполнения виджета "Распределение"' );
                            console.error( jqXHR );
                            console.error( textStatus );
                            console.error( errorThrown );
                        },

                        success: function ( Antwort, textStatus, xhr ) {
                            console.debug( "Serverantwort vom Server: " ); // Debug
                            console.debug( Antwort ); // Debug

                            switch ( xhr.status )
                            {
                                case 200:
                                    console.debug( "success in sending data" ); // Debug
                                break;

                                default:
                                    console.debug( xhr ); // Debug
                                break;
                            }
                        },
                    }
                );
            },

            deleteRole         : function ( name ) {
                console.debug( self.config.name + ' << [setter] : deleteRole' ); // Debug

                $.ajax(
                    {
                        url: self.config.baseUrl + "/api/distribution/roles",
                        method: "delete",
                        dataType: "json",

                        data: {
                            name: name
                        },

                        beforeSend: function (){},
                        complete: function (){},

                        error: function ( jqXHR, textStatus, errorThrown  ) {
                            console.error( 'Ошибка времени исполнения виджета "Распределение"' );
                            console.error( jqXHR );
                            console.error( textStatus );
                            console.error( errorThrown );
                        },

                        success: function ( Antwort, textStatus, xhr ) {
                            console.debug( "Serverantwort vom Server: " ); // Debug
                            console.debug( Antwort ); // Debug

                            switch ( xhr.status )
                            {
                                case 200:
                                    console.debug( "success in sending data" ); // Debug
                                break;

                                default:
                                    console.debug( xhr ); // Debug
                                break;
                            }
                        },
                    }
                );
            },

            setItemCountOnPage : function () {
                console.debug( self.config.name + ' << [setter] : setItemCountOnPage' ); // Debug

                if ( self.system().area === 'advanced_settings' )
                {
                    console.debug( $( this ) ); // Debug
                    console.debug( $( this ).attr( 'data-value' ) ); // Debug

                    self.data.itemCountOnPage = Number( $( this ).attr( 'data-value' ) );
                    self.data.currentPage = 1;
                    
                    self.getters.getData( self.data.currentPage, self.renderers.renderTableBody );
                }
            },

            saveRoleList       : function ( roleList ) {
                console.debug( self.config.name + ' << [setter] : saveRoleList' ); // Debug

                $.ajax(
                    {
                        url : self.config.baseUrl + "/api/distribution/roles",
                        method : "post",
                        dataType : "json",

                        data : {
                            roles : roleList
                        },

                        beforeSend: function (){},
                        complete: function (){},

                        error: function ( jqXHR, textStatus, errorThrown  ) {
                            console.error( 'Ошибка времени исполнения виджета "Распределение"' );
                            console.error( jqXHR );
                            console.error( textStatus );
                            console.error( errorThrown );
                        },

                        success: function ( Antwort, textStatus, xhr ) {
                            console.debug( "Serverantwort vom Server: " ); // Debug
                            console.debug( Antwort ); // Debug

                            switch ( xhr.status )
                            {
                                case 200:
                                    console.debug( "success in sending data" ); // Debug
                                break;

                                default:
                                    console.debug( xhr ); // Debug
                                break;
                            }
                        },
                    }
                );
            },

            setPipeSwitch      : function ( pipeSwitchVal ) {
                console.debug( self.config.name + ' << [setter] : setPipeSwitch' ); // Debug

                $.ajax(
                    {
                        method   : "PUT",
                        url      : self.config.baseUrl + '/api/distribution/staffs/status/pipeline',
                        dataType : "json",

                        data     : {
                            staff_id : AMOCRM.constant( 'user' ).id,
                            pipeline : pipeSwitchVal
                        },

                        success  : function ( response ) {
                            console.debug( response ); // Debug
                        },

                        error    : function ( XMLHttpRequest, textStatus, errorThrown ) {
                            console.debug( 'An error occurred while setting the pipeSwitch data' ); // Debug
                            console.debug( "ajax error" );                                          // Debug
                            console.debug( XMLHttpRequest, textStatus, errorThrown );               // Debug
                        }
                    }
                );
            },

            setPercentDist     : function ( data, callback = null ) {
                console.debug( self.config.name + ' << [setter] : setPercentDist' ); // Debug

                $.ajax(
                    {
                        method   : "PUT",
                        url      : self.config.baseUrl + '/api/distribution/settings/percent',
                        dataType : "json",

                        data     : {
                            oo : data.oo,
                            yo : data.yo
                        },

                        success  : function ( response ) {
                            console.debug( response ); // Debug

                            if ( callback )
                            {
                                if ( callback.params )
                                {
                                    callback.params[ 'response' ] = response;

                                    callback.exec( callback.params );
                                }
                                else
                                {
                                    callback.exec(
                                        {
                                            response : response
                                        }
                                    );
                                }
                            }
                        },

                        error    : function ( XMLHttpRequest, textStatus, errorThrown ) {
                            console.debug( 'An error occurred while setting the setPercentDist data' ); // Debug
                            console.debug( "ajax error" );                                          // Debug
                            console.debug( XMLHttpRequest, textStatus, errorThrown );               // Debug
                        }
                    }
                );
            },

            setCountDist       : function ( data, callback = null ) {
                console.debug( self.config.name + ' << [setter] : setCountDist' ); // Debug

                $.ajax(
                    {
                        method   : "PUT",
                        url      : self.config.baseUrl + '/api/distribution/settings/count',
                        dataType : "json",

                        data     : {
                            oo : data.oo,
                            yo : data.yo
                        },

                        success  : function ( response ) {
                            console.debug( response ); // Debug

                            if ( callback )
                            {
                                if ( callback.params )
                                {
                                    callback.params[ 'response' ] = response;

                                    callback.exec( callback.params );
                                }
                                else
                                {
                                    callback.exec(
                                        {
                                            response : response
                                        }
                                    );
                                }
                            }
                        },

                        error    : function ( XMLHttpRequest, textStatus, errorThrown ) {
                            console.debug( 'An error occurred while setting the setPercentDist data' ); // Debug
                            console.debug( "ajax error" );                                          // Debug
                            console.debug( XMLHttpRequest, textStatus, errorThrown );               // Debug
                        }
                    }
                );
            },
        },

        this.handlers = {
            searchInput      : function () {
                console.debug( self.config.name + ' << [handler] : searchInput' ); // Debug

                let usersList = self.getters.getDataFromTable( self.data.rowList );

                console.debug( 'usersList before:' ); // Debug
                console.debug( usersList ); // Debug

                usersList = usersList.filter( self.helpers.subStringSearchInput );

                console.debug( 'usersList after:' ); // Debug
                console.debug( usersList ); // Debug

                self.helpers.updateTable( usersList, false );
            },

            sortName         : () => {
                console.debug( self.config.name + ' << [handler] : sortName' ); // Debug

                let usersList = self.getters.getDataFromTable();

                if ( usersList )
                {
                    self.helpers.ordnen( usersList, 'name', self.helpers.updateTable );
                }
            },

            sortRole         : () => {
                console.debug( self.config.name + ' << [handler] : sortRole' ); // Debug

                let usersList = self.getters.getDataFromTable();

                if ( usersList )
                {
                    self.helpers.ordnen( usersList, 'role', self.helpers.updateTable );
                }
            },

            sortLeft         : () => {
                console.debug( self.config.name + ' << [handler] : sortLeft' ); // Debug

                let usersList = self.getters.getDataFromTable();

                if ( usersList )
                {
                    self.helpers.ordnen( usersList, 'left', self.helpers.updateTable );
                }
            },

            sortWeight       : () => {
                console.debug( self.config.name + ' << [handler] : sortWeight' ); // Debug

                let usersList = self.getters.getDataFromTable();

                if ( usersList )
                {
                    self.helpers.ordnen( usersList, 'weight', self.helpers.updateTable );
                }
            },

            sortStatus       : () => {
                console.debug( self.config.name + ' << [handler] : sortStatus' ); // Debug

                let usersList = self.getters.getDataFromTable();

                if ( usersList )
                {
                    self.helpers.ordnen( usersList, 'status', self.helpers.updateTable );
                }
            },
            
            switcherDistMenu : function ( evt ) {
                console.debug( self.config.name + ' << [handler] : switcherDistMenu' ); // Debug

                console.debug( $( evt.target ).attr( 'id' ) );

                let currentspanId = $( evt.target ).attr( 'id' );

                $( `span[id="${currentspanId}"]` ).removeClass( 'active' );
                $( evt.target ).addClass( 'active' );

                let status = null;

                if ( $( evt.target ).is( '.c-allowed' ) )
                {
                    console.debug( 'work started' ); // Debug

                    status = 2;
                }
                else if ( $( evt.target ).is( '.c-responsible' ) )
                {
                    console.debug( 'work pause' ); // Debug

                    status = 1;
                }
                else if ( $( evt.target ).is( '.c-denied' ) )
                {
                    console.debug( 'work stopped' ); // Debug

                    status = 0;
                }

                $( evt.target ).parent().attr( 'data-value', status );

                self.setters.setStatus( currentspanId, status );
            },

            switcherListMenu : function ( evt ) {
                console.debug( self.config.name + ' << [handler] : switcherListMenu' ); // Debug

                if ( $( evt.target ).is( '.c-denied' ))
                {
                    console.debug( 'call a modal by denied' ); // Debug

                    self.renderers.renderDeniedModal();
                }
                else
                {
                    $( '.c-denied, .c-allowed, .c-responsible' ).removeClass( 'active' );
                    $( evt.target ).addClass( 'active' );

                    let status = null;

                    if ( $( evt.target ).is( '.c-allowed' ) )
                    {
                        status = 2;
                    }
                    else if ( $( evt.target ).is( '.c-responsible' ) )
                    {
                        status = 1;
                    }

                    self.setters.setStatus( AMOCRM.constant( 'user' ).id, status );
                }
            },

            weightEdit       : function( e ) {
                console.debug( self.config.name + ' << [handler] : weightEdit' ); // Debug

                let id = $( this ).attr( 'id' );

                console.log( $( this )[ 0 ].querySelector( 'div' + self.selectors.js.weightEdit ) );

                $( 'div' + self.selectors.js.weightEdit ).css( 'display','none' );
                $( 'div#' + id + self.selectors.js.weightEdit ).css( 'display','flex' );
            },

            closeEditPanel   : function( event ) {
                console.debug( self.config.name + ' << [handler] : closeEditPanel' ); // Debug

                event.stopPropagation();
                $( 'div' + self.selectors.js.weightEdit ).css( 'display','none' );
            },

            confirmEditPanel : function ( event ) {
                console.debug( self.config.name + ' << [handler] : confirmEditPanel' ); // Debug

                event.stopPropagation();

                let inputValue = $( this ).parent()[ 0 ].querySelector( `input${self.selectors.js.inputEditWeight}` ).value;
                let prevWeightvalue = $( this ).parent().parent()[ 0 ].querySelector( 'span[data-id="tableRow_weight__span"]' ).innerText;
                let currentId = $( this ).parent().attr( 'id' );
                let currentStatus = $( `div#${currentId}${self.selectors.js.statusWrapper}` ).attr( 'data-value' );

                if ( inputValue != '' && inputValue != prevWeightvalue )
                {
                    $( this ).parent().parent()[ 0 ].querySelector( 'span[data-id="tableRow_weight__span"]' ).innerText = inputValue;

                    let updateData = [
                        {
                            staff_id: currentId,
                            weight: inputValue,
                            status: currentStatus
                        }
                    ];

                    self.setters.setWeight( updateData );
                }

                $( 'div' + self.selectors.js.weightEdit ).css( 'display','none' );
            },

            addRole          : function () {
                console.debug( self.config.name + ' << [handler] : addRole' ); // Debug

                self.getters.getRoleData( self.renderers.renderAddRoleModal );
            },

            editRole         : function () {
                console.debug( self.config.name + ' << [handler] : editRole' ); // Debug

                $( this ).attr( 'data-value', $( this )[0].value );
            
                if ( !( $('input.gigantDist_role[data-value="_leere"]').length || $('input.gigantDist_role[data-value=""]').length ) )
                {
                    console.log('set new input');

                    self.renderers.renderAddNewRoleInput( ( html ) => {
                        $(this).parent().parent().append( html );
                    } );
                }
                else
                {
                    console.log($('input.gigantDist_role[data-value=""], input.gigantDist_role[data-value="_leere"]'));
                    let length = $('input.gigantDist_role[data-value=""], input.gigantDist_role[data-value="_leere"]').length;
                    if (length > 1) $('input.gigantDist_role[data-value=""], input.gigantDist_role[data-value="_leere"]')[length-1].parentElement.remove();
                }

                $( 'button.js-modal-accept__roles' ).removeClass( 'button-input-disabled' );
                $( 'button.js-modal-accept__roles' ).addClass( 'button-input_blue' );
            },

            deleteRole       : function () {
                console.debug( self.config.name + ' << [handler] : deleteRole' ); // Debug

                let currentRoleValue = $( this ).parent()[ 0 ].querySelector( 'input' ).getAttribute( 'data-value' );

                if (
                    currentRoleValue != ""
                        &&
                    currentRoleValue != "_leere"
                )
                {
                    console.debug( 'delete role' ); // Debug
                    console.debug( currentRoleValue ); // Debug

                    $( this ).parent().remove();
                    self.setters.deleteRole( currentRoleValue );
                }
            },

            saveRoleList     : function () {
                console.debug( self.config.name + ' << [handler] : saveRoleList' ); // Debug

                let roleList = $( 'input.gigantDist_role' );
                let roleListExport = [];

                for ( let i = 0; i < roleList.length; i++ )
                {
                    let currentRole = roleList[ i ].getAttribute( 'data-value' );

                    if ( currentRole !== '' && currentRole !== '_leere' )
                    {
                        roleListExport.push( {
                            name : currentRole
                        } );
                    }
                }

                if ( roleListExport.length )
                {
                    self.setters.saveRoleList( roleListExport );
                }
            },

            deniedWork       : function () {
                console.debug( self.config.name + ' << [handler] : deniedWork' ); // Debug

                $( '.c-denied, .c-allowed, .c-responsible' ).removeClass( 'active' );
                $( '.c-denied' ).addClass( 'active' );

                self.setters.setStatus( AMOCRM.constant( 'user' ).id, 0 );
                self.renderers.modalWindow.destroy();
            },

            closeModal       : function () {
                console.debug( self.config.name + ' << [handler] : closeModal' ); // Debug

                self.renderers.modalWindow.objModalWindow.destroy();
            },

            selectPage       : function () {
                console.debug( self.config.name + ' << [handler] : selectPage' ); // Debug

                console.debug( $( this ) ); // Debug

                let currentPage = $( this ).attr( 'data-page' );

                console.debug( currentPage ); // Debug

                $( `.${self.selectors.activePagePagination}` ).removeClass( self.selectors.activePagePagination );
                $( this ).parent().addClass( self.selectors.activePagePagination );

                self.getters.getData( currentPage, self.renderers.renderTableBody );
            },

            selectPagePrev   : function () {
                console.debug( self.config.name + ' << [handler] : selectPagePrev' ); // Debug
                console.debug( self.data.currentPage ); // Debug
                console.debug( self.data.lastPage ); // Debug

                if ( self.data.currentPage > 1 )
                {
                    self.data.currentPage -= 1;
                    self.getters.getData( self.data.currentPage, self.renderers.renderTableBody );

                    $( `.${self.selectors.activePagePagination}` ).removeClass( self.selectors.activePagePagination );
                    $( `a[data-page=${self.data.currentPage}]` ).parent().addClass( self.selectors.activePagePagination );
                }
            },

            selectPageNext   : function () {
                console.debug( self.config.name + ' << [handler] : selectPageNext' ); // Debug
                console.debug( self.data.currentPage ); // Debug
                console.debug( self.data.lastPage ); // Debug

                if ( self.data.currentPage < self.data.lastPage  )
                {
                    self.data.currentPage += 1;
                    self.getters.getData( self.data.currentPage, self.renderers.renderTableBody );

                    $( `.${self.selectors.activePagePagination}` ).removeClass( self.selectors.activePagePagination );
                    $( `a[data-page=${self.data.currentPage}]` ).parent().addClass( self.selectors.activePagePagination );
                }
            },

            moreDistClick    : function () {
                console.debug( self.config.name + ' << [handler] : moreDistClick' ); // Debug

                if ( self.data.moreDistAlreadyShown )
                {
                    self.data.moreDistAlreadyShown = false;
                    $( `.${self.selectors.moreDistUl}` ).css( { 'display' : 'none' } );
                }
                else
                {
                    self.data.moreDistAlreadyShown = true;
                    $( `.${self.selectors.moreDistUl}` ).css( { 'display' : 'block' } );
                }
            },

            pipeSwitchSelect : function () {
                console.debug( self.config.name + ' << [handler] : pipeSwitchSelect' ); // Debug

                let selectedVal = $( this )[ 0 ].querySelector( 'span' ).innerText;
                $( `.${self.selectors.spanPipeSwitch}` )[ 0 ].innerText = selectedVal;

                self.setters.setPipeSwitch( selectedVal );
            },

            percentDist      : function () {
                console.debug( self.config.name + ' << [handler] : percentDist' ); // Debug

                self.getters.getPercentDist(
                    {
                        exec : self.renderers.renderPerSettModal
                    }
                );
            },

            countDist        : function () {
                console.debug( self.config.name + ' << [handler] : countDist' ); // Debug

                self.getters.getCountDist(
                    {
                        exec : self.renderers.renderCouSettModal
                    }
                );
            },

            percentDistSave  : function () {
                console.debug( self.config.name + ' << [handler] : percentDistSave' ); // Debug

                let oo = $( `.${self.selectors.ooPercent}` )[ 0 ].value;
                let yo = $( `.${self.selectors.yoPercent}` )[ 0 ].value;

                console.debug( oo + ' ' + yo );

                self.setters.setPercentDist(
                    {
                        oo : oo,
                        yo : yo
                    }
                );
            },

            countDistSave    : function () {
                console.debug( self.config.name + ' << [handler] : countDistSave' ); // Debug

                let oo = $( `.${self.selectors.ooCount}` )[ 0 ].value;
                let yo = $( `.${self.selectors.yoCount}` )[ 0 ].value;

                console.debug( oo + ' ' + yo );

                self.setters.setCountDist(
                    {
                        oo : oo,
                        yo : yo
                    }
                );
            },

            inputStngPer     : function () {
                console.debug( self.config.name + ' << [handler] : inputStngPer' ); // Debug

                let regexpStr = /[A-Za-zА-Яа-яЁё.,\-_\s+]/g;

                $( this )[ 0 ].value = $( this )[ 0 ].value.replace( regexpStr, "" );

                if (
                    $( this )[ 0 ].value.length > 1
                        &&
                    $( this )[ 0 ].value[ 0 ] === '0'
                )
                {
                    $( this )[ 0 ].value = $( this )[ 0 ].value.slice( 1 );
                }

                if ( Number( $( this )[ 0 ].value ) > 100 )
                {
                    $( this )[ 0 ].value = 100;
                }

                if ( $( this ).hasClass( self.selectors.ooPercent ) )
                {
                    $( `.${self.selectors.yoPercent}` )[ 0 ].value = 100 - $( this )[ 0 ].value;
                }
                else
                {
                    $( `.${self.selectors.ooPercent}` )[ 0 ].value = 100 - $( this )[ 0 ].value;
                }
            },

            inputStngCount : function () {
                console.debug( self.config.name + ' << [handler] : inputStngCount' ); // Debug

                let regexpStr = /[A-Za-zА-Яа-яЁё.,\-_\s+]/g;

                $( this )[ 0 ].value = $( this )[ 0 ].value.replace( regexpStr, "" );

                if (
                    $( this )[ 0 ].value.length > 1
                        &&
                    $( this )[ 0 ].value[ 0 ] === '0'
                )
                {
                    $( this )[ 0 ].value = $( this )[ 0 ].value.slice( 1 );
                }
            },
        },

        this.helpers = {

            searchItemInArrayById : function ( staff_id, array ) {   
                for ( let index = 0; index < array.length; index++ )
                {
                    if ( array[ index ].staff_id == staff_id )
                    {
                        return index;
                    }
                }
    
                return -1;
            },

            ordnen                : function ( array, sortType, callback ) {

                switch ( sortType )
                {
                    case 'name':
    
                        array.sort( ( a, b ) => {
    
                            let nameA = a.name.toLowerCase();
                            let nameB = b.name.toLowerCase();
    
                            //order by asc
    
                            if ( nameA < nameB ) return -1;
                            if ( nameA > nameB ) return 1;
    
                            return 0
                        });
    
                    break;
    
                    case 'role':
    
                        array.sort( ( a, b ) => {
    
                            let roleA = a.role_name.toLowerCase();
                            let roleB = b.role_name.toLowerCase();
    
                            // order by asc
    
                            if ( roleA < roleB ) return -1;
                            if ( roleA > roleB ) return 1;
    
                            return 0
                        });
    
                    break;
    
                    case 'left':
    
                        array.sort( ( a, b ) => {
    
                            let leftA = Number( a.left );
                            let leftB = Number( b.left );
    
                            // order by desc
    
                            if ( leftA <  leftB ) return 1;
                            if ( leftA >  leftB ) return -1;
    
                            return 0
                        });
    
                    break;
    
                    case 'weight':
    
                        array.sort( ( a, b ) => {
    
                            let weightA = Number( a.weight );
                            let weightB = Number( b.weight );
    
                            // order by desc
    
                            if ( weightA < weightB ) return 1;
                            if ( weightA > weightB ) return -1;
    
                            return 0
                        });
    
                    break;
    
                    case 'status':
    
                        array.sort( ( a, b ) => {
    
                            let statusA = Number( a.status );
                            let statusB = Number( b.status );
    
                            // order by desc
    
                            if ( statusA < statusB ) return 1;
                            if ( statusA > statusB ) return -1;
    
                            return 0
                        });
    
                    break;
    
                    default:
                    break;
                }
    
                callback( array );
            },

            dataSenden            : function ( updateData ) {

                console.debug( 'send data to server' );
                console.debug( updateData );
    
                $.ajax(
                    {
                        url: config.baseUrl + "/api/distribution/settings/save",
                        method: "post",
                        dataType: "json",
                        //timeout: 3000000,
                        data: {
                            data: updateData
                        },
                        beforeSend: function (){},
                        complete: function (){
                            console.debug( "complete" ); // Debug
                        },
                        error: function( jqXHR, textStatus, errorThrown  ){
    
                            console.error( 'Ошибка времени исполнения виджета "Распределение"' );
                            console.error( jqXHR );
                            console.error( textStatus );
                            console.error( errorThrown );
    
                        },
                        success: function( Antwort, textStatus, xhr ){
            
                            console.debug( "Serverantwort vom Server: " ); // Debug
                            console.debug( Antwort ); // Debug
    
                            switch ( xhr.status )
                            {
                                case 200:
    
                                    console.debug( "success in sending data" ); // Debug
    
                                    $( `span.od_round_status[data-id="${updateData[ 0 ].staff_id}"]` ).attr( 'data-oldValue', updateData[ 0 ].status );
                                    $( `input#${updateData[ 0 ].staff_id}` ).attr( 'data-oldValue', updateData[ 0 ].weight );
    
                                break;
    
                                default:
                                    console.debug( xhr ); // Debug
                                break;
                            }
    
                        },
                    }
                );
    
            },

            updateTable           : function ( tableData = null, renderSpinerFlag = true ) {
                console.debug( 'dist table update' ); // Debug

                if ( renderSpinerFlag )
                {
                    self.renderers.renderSpinner();
                }

                self.renderers.removeTable();

                setTimeout(
                    () => {
                        self.renderers.renderTableBody( self.selectors.js.listTable, tableData );

                        if( renderSpinerFlag )
                        {
                            setTimeout(
                                () => {
                                    self.renderers.removeSpinner();
                                },

                                1000
                            );
                        }
                    },

                    500
                );
            },

            subStringSearchInput  : function ( currentRow, indexName, names ) {
                console.debug( 'currentRow' ); // Debug
                console.debug( currentRow ); // Debug

                let currentName = currentRow.name

                const queryName = $( `input#${self.selectors.searchInput}` )[ 0 ].value;

                const pattern = "ё";
                const re = new RegExp( pattern, "g" );

                const stringToSearchName = currentName.toLowerCase().replace( re, "е" );

                return stringToSearchName.includes( queryName.toLowerCase().replace( re, "е" ) );
            },

            editSettDist          : function () {
                $( 'button.js-modal-accept__dist' ).removeClass( 'button-input-disabled' );
                $( 'button.js-modal-accept__dist' ).addClass( 'button-input_blue' );
            }
        },

        // methods for rendering
        this.renderers = {
            render                 : function ( template, params, callback, callbackParams = null ) {
                params = ( typeof params == 'object' ) ? params : {};
                template = template || '';
            
                return self.render(
                    {
                        href: '/templates/' + template + '.twig',
                        base_path: self.params.path,
                        v: self.get_version(),
                        load: ( template ) => {
                            let html = template.render( { data: params } );

                            callbackParams ? callback( html, callbackParams ) : callback( html );
                        }
                    },
                    params
                );
            },

            renderAddNewRoleButton : function ( selector, data = null, location = 'append' ) {
                let buttonData = {
                    widgetPrefix : self.config.name,
                    id : self.selectors.css.idAddRoleButton
                };

                self.renderers.render( 'AddNewRoleButton', buttonData, ( html ) => {
                    $( selector )[ location ]( html );
                } );
            },

            renderMoreDistButton   : function ( selector, data = null, location = 'append' ) {
                let buttonData = {
                    widgetPrefix : self.config.name,
                    id : self.selectors.css.idMoreDistButton
                };

                self.renderers.render( 'moreDist', buttonData, ( html ) => {
                    $( selector )[ location ]( html );
                } );
            },

            renderSearchUserInput  : function ( selector, data = null, location = 'append' ) {
                let SearchUserInputData = {
                    widgetPrefix: self.config.name,
                };

                self.renderers.render( 'SearchUserInput', SearchUserInputData, ( html ) => {
                    $( selector )[ location ]( html );
                } );
            },

            renderAdvancedHead     : function () {
                $( self.selectors.js.advancedHead ).empty();

                self.renderers.renderSearchUserInput( self.selectors.js.advancedHead );
                self.renderers.renderMoreDistButton( self.selectors.js.advancedHead );
                self.renderers.renderAddNewRoleButton( self.selectors.js.advancedHead );
            },

            renderTableHead        : function ( selector, location = 'append' ) {

                let tableHeadData = {
                    widgetPrefix: self.config.name
                };

                self.renderers.render( 'tableHead', tableHeadData, ( html ) => {
                    $( selector )[ location ]( html );
                } );
            },

            renderTableBody        : function ( selector, data, location = 'append' ) {
                let tableBodyData = {
                    widgetPrefix: self.config.name,
                    users: data
                };

                self.renderers.render(
                    'tableBody',
                    tableBodyData,

                    ( html ) => {
                        $( selector )[ location ]( html );
                    }
                );
            },

            renderBaseTable        : function ( selector, callback ) {
                $( selector ).append( self.html.baseTable );

                self.renderers.renderTableHead( '#' + self.selectors.listTable );
            },

            removeTable            : function ( selector = self.selectors.js.tableRow ) {
                $( selector ).remove()
            },

            // render spinner
            renderSpinner          : function ( selector = self.selectors.js.listTable ) {
                $( selector ).append( self.html.spinner );
            },

            // remove spinner
            removeSpinner          : function () {
                $( self.selectors.js.spinner ).remove();
            },

            renderAddRoleModal     : function () {
                let rolesData = {
                    widgetPrefix: self.config.name,
                    roles: self.data.roleInputList
                };

                let showParams = {
                    sizeParams: {
                        width: self.data.modalWidth_addRole,
                        height: null
                    }
                };

                self.renderers.render( 'addNewRoleModalBody', rolesData, self.renderers.modalWindow.show, showParams );
            },

            renderAddNewRoleInput  : function ( callback ) {
                let roleInputData = {
                    widgetPrefix: self.config.name
                };

                self.renderers.render( 'addNewRoleInput', roleInputData, callback );
            },

            renderSwitcher         : function ( selector, status, location = 'append' ) {
                let switcherData = {
                    active: status,
                    widgetPrefix: self.config.name
                };

                self.renderers.render( 'switcher', switcherData, ( html ) => {
                    $( selector )[ location ]( html );
                } );
            },

            renderPipelineSwitcher : function ( params ) {
                let pipelineSwitcherData = {
                    widgetPrefix : self.config.name,
                    value        : params.listValue
                };

                // control--select--list--item-selected

                self.renderers.render( 'pipelineSwitcher', pipelineSwitcherData, ( html ) => {
                    $( params.selector )[ params.location ]( html );
                } );
            },

            renderDeniedModal      : function () {
                let deniedModalData = {
                    widgetPrefix: self.config.name
                };

                let showParams = {
                    sizeParams: {
                        width: self.data.modalWidth_deniedWork,
                        height: null
                    }
                };

                self.renderers.render( 'deniedModal', deniedModalData, self.renderers.modalWindow.show, showParams );
            },

            renderPagination       : function ( selector, data = self.data.links, location = 'append' ) {
                let paginationData = {
                    widgetPrefix: self.config.name,
                    links: data
                };

                self.renderers.render( 'pagination', paginationData, ( html ) => {
                    $( selector )[ location ]( html );
                } );
            },

            modalWindow            : {
                objModalWindow: null,

                show: function ( html, modalParams, callback = null, callbackParams = {} ) {
                    self.renderers.modalWindow.objModalWindow = new Modal (
                        {
                            class_name: "modal-window",

                            init: function( $modal_body ) {
                                let $this = $( this );

                                modalParams.sizeParams.width ? $modal_body.css( 'width', modalParams.sizeParams.width ) : $modal_body.css( 'width', 'auto' );
                                modalParams.sizeParams.height ? $modal_body.css( 'height', modalParams.sizeParams.height ) : $modal_body.css( 'height', 'auto' );

                                $modal_body
                                    .append( html )
                                    .trigger( 'modal:loaded' )
                                    .trigger( 'modal:centrify' );
                            },

                            destroy: function () {
                                console.debug( "close modal-destroy" );

                                return true;
                            }
                        }
                    );
                },

                setData: function ( data ) {
                    $( 'div.modal-body__inner__todo-types' ).append( data );
                },

                destroy: function () {
                    this.objModalWindow.destroy();
                }
            },

            renderPaginationPages  : function ( selector, data = self.data.links, location = 'append' ) {
                let paginationPagesData = {
                    widgetPrefix: self.config.name,
                    links: data
                };

                self.renderers.render( 'paginationPages', paginationPagesData, ( html ) => {
                    $( selector )[ location ]( html );
                } );
            },

            renderPerSettModal     : function ( params ) {
                self.data.moreDistAlreadyShown = false;
                $( `.${self.selectors.moreDistUl}` ).css( { 'display' : 'none' } );

                let settingsData = {
                    widgetPrefix: self.config.name,
                    oo : params.percentDistData.oo,
                    yo : params.percentDistData.yo
                };

                let showParams = {
                    sizeParams: {
                        width: self.data.modalWidth_distSettings,
                        height: null
                    }
                };

                console.debug( settingsData );

                self.renderers.render( 'percentDistModal', settingsData, self.renderers.modalWindow.show, showParams );
            },

            renderCouSettModal     : function ( params ) {
                self.data.moreDistAlreadyShown = false;
                $( `.${self.selectors.moreDistUl}` ).css( { 'display' : 'none' } );

                let settingsData = {
                    widgetPrefix: self.config.name,
                    oo : params.countDistData.oo,
                    yo : params.countDistData.yo
                };

                let showParams = {
                    sizeParams: {
                        width: self.data.modalWidth_distSettings,
                        height: null
                    }
                };

                console.debug( settingsData );

                self.renderers.render( 'countDistModal', settingsData, self.renderers.modalWindow.show, showParams );
            },
        },

        this.html = {
            baseTable       : `
                <div class="${self.selectors.advancedSettingsWrapper}">
                    <div class="${self.config.name}_list__table__holder ${self.config.name}_js-hs-scroller ${self.config.name}_custom-scroll">
                        <div class="js-scroll-container ${self.config.name}_list__table" id="${self.selectors.listTable}">
                        </div>
                    </div>
                </div>
            `,

            spinner         : `
                <div class="default-overlay list__overlay default-overlay-visible" id="page_change_loader" style="margin-left: 250px;">
                    <span class="spinner-icon spinner-icon-abs-center"></span>
                </div>
            `,

            addNewRoleInput : ``
        },

        this.data = {
            oldValueWeightBlur      : null,
            roleInputList           : '', // will be created in function renderListOfRoles
            modalWidth_addRole      : '315px',
            modalWidth_deniedWork   : '450px',
            modalWidth_distSettings : '550px',
            itemCountOnPage         : null, // will be init in "self.callbacks.advancedSettings"
            itemCountTotal          : null, // will be init in "self.getters.getData"
            links                   : null, // will be init in "self.getters.getData"
            currentPage             : null, // will be init in "self.callbacks.advancedSettings"
            lastPage                : null,
            rowList                 : null, // will be init in "self.getters.getData"
            moreDistAlreadyShown    : false
        },

        this.callbacks = {
            render                 : function () {
                console.debug( self.config.name + " << render" ); // Debug

                self.settings = self.get_settings();

                if ( !$( 'div.b-rights__table_col.b-rights__table_col-action.b-rights__table_col-view' ).length )
                {
                    console.debug( 'switcher does not exist' ); // Debug

                    if (
                        (
                            AMOCRM.data.current_entity === "leads-pipeline"
                                ||
                            AMOCRM.data.current_entity === "leads"
                                ||
                            AMOCRM.data.current_entity === "todo-line"
                                ||
                            AMOCRM.data.current_entity === "todo"
                        )
                            &&
                        self.system().area !== "lcard"
                    )
                    {
                        self.getters.getStatus( self.renderers.renderSwitcher );
                        self.getters.getValPipeSwitch(
                            {
                                exec   : self.renderers.renderPipelineSwitcher,
                                params : {
                                    selector : self.selectors.js.addNewLeadButton,
                                    location : 'after'
                                }
                            }
                        );
                    }
                }
                else
                {
                    console.debug( 'switcher exists' ); // Debug
                }

                return true;
            },

            init                   : function () {

                console.debug( self.config.name + " << init: " ); // Debug

                $( "head" ).append( '<link type="text/css" rel="stylesheet" href="' + self.settings.path + '/style.css?v=' + self.settings.version + '">' );

                /*if ( !$( 'link[href="' + self.settings.path + '/style.css?v=' + self.settings.version +'"]' ).length )
                {
                    $( "head" ).append( '<link type="text/css" rel="stylesheet" href="' + self.settings.path + '/style.css?v=' + self.settings.version + '">' );
                }*/

            return true;
            },

            bind_actions           : function () {
                console.debug( self.config.name + " << bind_actions:" ); // Debug

                if ( !document.gigantDist_bindAction )
                {
                    console.debug( 'gigantDist_bindAction does not exist' ); // Debug

                    document.gigantDist_bindAction = true;

                    // events of sorting
                    $( document ).on( 'click', 'div.js-sort_name', self.handlers.sortName );
                    $( document ).on( 'click', 'div.js-sort_role', self.handlers.sortRole );
                    $( document ).on( 'click', 'div.js-sort_left', self.handlers.sortLeft );
                    $( document ).on( 'click', 'div.js-sort_weight', self.handlers.sortWeight );
                    $( document ).on( 'click', 'div.js-sort_status', self.handlers.sortStatus );

                    // event of weight
                    $( document ).on( "click", self.selectors.js.weight, self.handlers.weightEdit );

                    $( document ).on( 'click', self.selectors.js.closeEditPanel, self.handlers.closeEditPanel );
                    $( document ).on( 'click', self.selectors.js.confirmEditPanel, self.handlers.confirmEditPanel );

                    // events of switchers
                    $( document ).on( 'click', `.b-rights__road.${self.config.name}_distMenu`, self.handlers.switcherDistMenu );
                    $( document ).on( 'click', `.b-rights__road.${self.config.name}_listMenu`, self.handlers.switcherListMenu );
                    $( document ).on( 'click', self.selectors.js.deniedWork, self.handlers.deniedWork );

                    // event of Role
                    $( document ).on( 'click', `button${self.selectors.js.idAddRoleButton}`, self.handlers.addRole );
                    $( document ).on( 'input', self.selectors.js.editRole, self.handlers.editRole );
                    $( document ).on( 'click', self.selectors.js.deleteRole, self.handlers.deleteRole );
                    $( document ).on( 'click', self.selectors.js.saveRoleList, self.handlers.saveRoleList );

                    // events of moreDistButton
                    $( document ).on( 'click', `button[id="${self.selectors.css.idMoreDistButton}"]`, self.handlers.moreDistClick );
                    $( document ).on( 'click', `li[id="${self.selectors.idLiPercentDist}"]`, self.handlers.percentDist );
                    $( document ).on( 'click', `li[id="${self.selectors.idLiCountDist}"]`, self.handlers.countDist );

                    // events of form for istSettings
                    $( document ).on( 'click', `.${self.selectors.percentDistSave}.${self.selectors.saveBtnBlue}`, self.handlers.percentDistSave );
                    $( document ).on( 'click', `.${self.selectors.countDistSave}.${self.selectors.saveBtnBlue}`, self.handlers.countDistSave );
                    $( document ).on( 'input', `.${self.selectors.inputSettingsDistPercent}`, self.handlers.inputStngPer );
                    $( document ).on( 'input', `.${self.selectors.inputSettingsDistCount}`, self.handlers.inputStngCount );

                    // events of modal
                    $( document ).on( "click", self.selectors.js.closeModal, self.handlers.closeModal );

                    // events of pagination
                    $( document ).on( 'click', `.${self.selectors.paginationLink}`, self.handlers.selectPage );
                    $( document ).on( 'click', `.${self.selectors.pagePrev}`, self.handlers.selectPagePrev );
                    $( document ).on( 'click', `.${self.selectors.pageNext}`, self.handlers.selectPageNext );
                    $( document ).on( 'click', `.${self.selectors.defItemCountOnPage}`, self.setters.setItemCountOnPage );
                    $( document ).on( 'input', `.${self.selectors.inputSettingsDist}`, self.helpers.editSettDist );

                    // events of SearchUserInput
                    $( document ).on( 'input', `input#${self.selectors.searchInput}`, _.debounce( self.handlers.searchInput, 500) );

                    // events of pipelineSwitcher
                    $( document ).on( 'click', `.${self.selectors.pipeSwitch}`, self.handlers.pipeSwitchSelect );
                }
                else
                {
                    console.debug( 'gigantDist_bindAction exists' ); // Debug
                }

                return true;
            },

            settings               : function () {
                console.debug( self.config.name + " << settings:" ); // Debug

                return true;
            },

            onSave                 : function () {
                console.debug( self.config.name + " << onSave:" ); // Debug

                return true;
            },

            destroy                : function () {
                console.debug( self.config.name + " << destroy:" ); // Debug

                let baseTableSelector = self.selectors.workArea + self.get_settings().widget_code;

                $( `div.${self.selectors.addRoleButton}` ).remove();
                $( `div.${self.selectors.searchUserInput}` ).remove();
                $( baseTableSelector ).empty();


                return true;
            },

            contacts               : {
                //select contacts in list and clicked on widget name
                selected: function () {
                    console.debug( self.config.name + " << contactsSelected:" ); // Debug
                }
            },

            leads                  : {
                //select leads in list and clicked on widget name
                selected: function () {
                    console.debug( self.config.name + " << leadsSelected:" ); // Debug
                }
            },

            tasks                  : {
                //select taks in list and clicked on widget name
                selected: function () {
                    console.debug( self.config.name + " << tasksSelected:" ); // Debug
                }
            },

            advancedSettings       : function () {
                console.debug( self.config.name + " << advancedSettings:" ); // Debug

                if ( !$( `.${self.selectors.advancedSettingsWrapper}` ).length )
                {
                    let baseTableSelector = self.selectors.workArea + self.get_settings().widget_code;
                    self.data.currentPage = 1; // FIXME
                    self.data.itemCountOnPage = 25; // FIXME

                    self.renderers.renderAdvancedHead();
                    self.renderers.renderBaseTable( baseTableSelector );

                    self.getters.getData( self.data.currentPage, self.renderers.renderTableBody, true );
                }

                return true;
            },

            onSalesbotDesignerSave : function () {
                console.debug('onSalesbotDesignerSave');
                return true;
            },
        };

        return this;
    };

    return CustomWidget;

});