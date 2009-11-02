/**
* JSON-RPC client for yui 3
* API based on Y.io.ez for maximum interoperability (but not identical!)
* Works both if parsed as javascript-generating template or if included as plain javascript file
* @author G. Giunta
* @copyright (c) 2009 G. Giunta
* @version $Id$
*
* @todo use closures instead of saving stuff around for later
*/
//{literal}
YUI( YUI3_config ).add('io-jsonrpc', function( Y )
{
    var _serverUrl = '{/literal}{'/'|ezurl('no', 'full')}{literal}', _configBak;
    if ( '{' + "/literal}{'/'|ezurl('no', 'full')}{literal}" == _serverUrl )
    {
        _serverUrl = '/';
    }

    Y.io.jsonrpc = function ( callMethod, callParams, c )
    {
        var url = _serverUrl + '/webservices/execute/jsonrpc';

        // force POST method, allow other configs to be passed down
        if ( c === undefined )
            c = {on:{}, data: '', headers: {}, method: 'POST'};
        else
            c = Y.merge( {on:{}, data: '', headers: {}}, c, {method: 'POST'} );

        // encode function arguments as post params
        c.data = Y.JSON.stringify( {method: callMethod, params: callParams, id: 1} );

        // force json transport
        c.headers.Accept = 'application/json,text/javascript,*/*';

        // backup user success call, as we inject our decoding success call
        if ( c.on.success !== undefined )
            c.on.successCallback = c.on.success;

        c.on.success = _iojsonrpcSuccess;
        _configBak = c;

        return Y.io( url, c );
    }

    function _iojsonrpcSuccess( id, o )
    {
        if ( o.responseJSON === undefined )
        {
            // the members of responseJSON are the same as those used by Y.io.ez
            var response = Y.JSON.parse( o.responseText );
            /// @todo check if decoding of error msg / result from jsonrpc was ok
            ///       before injecting them into returnObject
            ///       check also that id is present and == 1 ?
            response.content = response.result;
            response.error_text = response.error;

            // create new object to avoid error in ie6 (and do not use Y.merge since it fails in ff)
            var returnObject = {'responseJSON': response,
                                'readyState':   o.readyState,
                                'responseText': o.responseText,
                                'responseXML':  o.responseXML,
                                'status':       o.status,
                                'statusText':   o.statusText
            };

        }
        else
        {
            var returnObject = o;
        }

        var c = _configBak;
        if ( c.on.successCallback !== undefined )
        {
            c.on.successCallback( id, returnObject );
        }
        else if ( window.console !== undefined )
        {
            if ( returnObject.responseJSON.error_text )
                window.console.error( 'Y.io.jsonrpc(): ' + returnObject.responseJSON.error_text );
            else
                window.console.log( 'Y.io.jsonrpc(): ' + returnObject.responseJSON.content );
        }
    }

    //_jsonrpc.url = _serverUrl;
    //Y.io.jsonrpc = _jsonrpc;
}, '3.0.0', {requires:['io-base', 'json']});
//{literal}