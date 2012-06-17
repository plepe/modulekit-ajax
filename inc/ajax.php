<?php
function _ajax_process() {
  $postdata = file_get_contents("php://input");

  $fun="ajax_{$_REQUEST['__func']}";

  if(!function_exists($fun)) {
    Header("Content-Type: text/plain; charset=UTF-8");
    print "";
    return;
  }

  $return=call_user_func($fun, $_REQUEST, $postdata);

  if(!isset($return)) {
    Header("Content-Type: text/plain; charset=UTF-8");
    print "";
  }
  if(is_string($return)) {
    Header("Content-Type: text/plain; charset=UTF-8");
    print $return;
  }
  elseif(is_object($return)&&(get_class($return)=="DOMElement")) {
    Header("Content-Type: text/xml; charset=UTF-8");
    print "<?xml version=\"1.0\"?".">\n";
    print $return->ownerDocument->saveXML($return);
  }
  elseif(is_object($return)&&(get_class($return)=="DOMDocument")) {
    Header("Content-Type: text/xml; charset=UTF-8");
    print $return->saveXML();
  }
  else {
    Header("Content-Type: application/json; charset=UTF-8");
    print json_encode($return);
  }
}
