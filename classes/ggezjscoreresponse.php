<?php
/**
 * Class used to wrap ezjscore responses. Modeled after Soap equivalent.
 * Needs the json extension
 *
 * @author G. Giunta
 * @version $Id: ggjsonrpcresponse.php 290 2011-02-06 17:36:55Z gg $
 * @copyright (C) G. Giunta 2011
 *
 * @todo add support for other serializations that json
 */

class ggeZJSCoreResponse extends ggWebservicesResponse
{

    /**
      Returns the payload for the response.
    */
    function payload()
    {
        if ( $this->IsFault )
        {
            return json_encode( array(
                'content' => null,
                'error_text' => $this->FaultString() ) );
        }
        else
        {
            return json_encode( array(
                'content' => $this->Value,
                'error_text' => null ) );
        }
    }

    /**
    * Decodes the response stream.
    * nb: many return types from ezjscore extension: text/javascript for json, text/xml for xml
    */
    function decodeStream( $request, $stream, $headers=false, $cookies=array(), $statuscode="200"  )
    {
        $this->Cookies = $cookies;
        $this->StatusCode = $statuscode;

        $ct = explode( ';', $headers['content-type'], 2 );
        switch( $ct[0] )
        {
            case 'application/json':
            case 'text/javascript':
                $results = json_decode( $stream, true );
                if ( !is_array( $results ) ||
                    !array_key_exists( 'content', $results ) ||
                    !array_key_exists( 'error_text', $results )
                    )
                {
                    // invalid ezjscore response
                    $this->IsFault = true;
                    $this->FaultCode = self::INVALIDRESPONSEERROR;
                    $this->FaultString = self::INVALIDRESPONSESTRING;
                }
                else
                {

                    if ( $results['error_text'] == '' )
                    {
                        $this->IsFault = false;
                        $this->FaultString = false;
                        $this->FaultCode = false;
                        $this->Value = $results['content'];
                    }
                    else
                    {
                        $this->IsFault = true;
                        $this->FaultCode = self::GENERICRESPONSEERROR;
                        /// @todo we should somehow typecast to string here???
                        $this->FaultString = $results['error_text'];
                    }
                }
                break;
            case 'text/xml':
            case 'application/xml':
            default:
                $this->IsFault = true;
                $this->FaultCode = self::INVALIDRESPONSEERROR;
                $this->FaultString = "Unsupported feature: decoding response in '{$ct[0]}' format";
        }
    }

    protected $ContentType = 'application/json';
}

?>