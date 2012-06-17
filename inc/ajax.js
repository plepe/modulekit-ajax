/* ajax.js
 * - JavaScript code that is used globally
 *
 * Copyright (c) 1998-2006 Stephan Plepelits <skunk@xover.mud.at>
 *
 * This program is free software; you can redistribute it and/or
 * modify it under the terms of the GNU General Public License
 * as published by the Free Software Foundation; either version 2
 * of the License, or (at your option) any later version.
 * 
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 * 
 * You should have received a copy of the GNU General Public License
 * along with this program; if not, write to the Free Software
 * Foundation, Inc., 59 Temple Place - Suite 330, Boston, MA  02111-1307, USA.
 */

// ajax - calls a php_function with params
// parameter:
// funcname       the name of the php-function. the php-function has to 
//                be called "ajax_"+funcname
// param          an associative array of parameters
// postdata       (optional) data which should be posted to the server. it will
//                be passed to the ajax_[funcname] function as third parameter.
// callback       a function which will be called when the request ist 
//                finished. if empty the call will be syncronous and the
//                result will be returned
//
// return value, passed to callback
// response       the status of the request
//  .responseText the response as plain text
//  .responseXML  the response as DOMDocument (if valid XML)
//  .responseJSON the return value of the function
function ajax(funcname, param, postdata, callback) {
  // public
  this.request=false;
  // private
  var sync;

  function get_return() {
    if(this.request.responseXML) {
      this.type="dom";
      this.responseXML=this.request.responseXML;
      this.result=ret;

      // legacy code
      var ret=this.responseXML.getElementsByTagName("return");
      if(ret.length) {
	var str="";
	var cur=ret[0].firstChild;
	while(cur) {
	  if(cur.firstChild)
	    str+=cur.firstChild.nodeValue;
	  cur=cur.nextSibling;
	}

	var ret=json_decode(str);
	if(ret) {
	  this.request.responseJSON=ret;
	  this.result=ret;
	  this.type="json";
	}
      }
      // /legacy code
      else {
	this.result=ret;
	this.type="dom";
      }
    }
    
    var ret=json_decode(this.request.responseText);
    if(ret) {
      this.type="json";
      this.request.responseJSON=ret;
      this.result=ret;
    }
    else if(!this.result) {
      this.type="plain";
      this.result=this.request.responseText
        .substr(0, this.request.responseText.length-1);
    }

    this.responseXML =this.request.responseXML ;
    this.responseJSON=this.request.responseJSON;
    this.responseText=this.request.responseText;
  }

  function req_change() {
    if(this.request.readyState==4) {
      if(this.request.status==0)
	return;

      get_return.bind(this)();

      if(callback)
        callback(this.result, this);
    }
  }

  // branch for native XMLHttpRequest object
  if(window.XMLHttpRequest) {
    try {
      this.request = new XMLHttpRequest();
    }
    catch(e) {
      this.request = false;
    }
    // branch for IE/Windows ActiveX version
  } else if(window.ActiveXObject) {
    try {
      this.request = new ActiveXObject("Msxml2.XMLHTTP");
    }
    catch(e) {
      try {
        this.request = new ActiveXObject("Microsoft.XMLHTTP");
      }
      catch(e) {
        this.request = false;
      }
    }
  }

  if(this.request) {
    var p=ajax_build_request(param);

    if(typeof(postdata)=="function") {
      callback=postdata;
      postdata="";
    }
    else if(!postdata)
      postdata="";

    this.request.onreadystatechange = req_change.bind(this);
    sync=callback!=null;
    this.request.open((postdata==""?"GET":"POST"),
             "ajax.php?__func="+funcname+"&"+p, sync);
    last_params=p;

    if(postdata!="") {
      this.request.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
      this.request.setRequestHeader("Content-length", postdata.length);
      this.request.setRequestHeader("Connection", "close");
    }

    this.request.send(postdata);

    if(!sync) {
      get_return();
    }
  }
}

function ajax_build_request(param) {
  var ret=[];

  for(var k in param) {
    switch(typeof param[k]) {
      case "string":
      case "number":
        ret.push(urlencode(k)+"="+param[k])
        break;
      default:
        ret.push(urlencode(k)+"="+urlencode(json_encode(param[k])));
    }
  }

  return ret.join("&");
}
