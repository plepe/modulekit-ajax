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
// funcname       * the name of the php-function. the php-function has to 
//                  be called "ajax_"+funcname
//                * an URL (e.g. data.php)
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
  // make sure, that we are inside an instance of ajax
  if(this == window)
    return new ajax(funcname, param, postdata, callback);

  // public
  this.request=false;
  // private
  var sync;

  function get_return() {
    this.content_type=this.request.getResponseHeader("content-type");
    var m;
    if(m=this.content_type.match(/^([^;]*);/))
      this.content_type=m[1];

    if(this.content_type=="text/xml") {
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

	var ret=JSON.parse(str);
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
    else if(this.content_type=="application/json") {
      var ret=JSON.parse(this.request.responseText);
      this.type="json";
      this.request.responseJSON=ret;
      this.result=ret;
    }
    else {
      this.type="plain";
      this.result=this.request.responseText;
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

    if(funcname.match(/\./))
      var url = funcname + "?" + p;
    else
      var url = "ajax.php?__func="+funcname+"&"+p;

    this.request.open((postdata==""?"GET":"POST"),
             url, sync);
    last_params=p;

    if(postdata!="") {
      this.request.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
    }

    this.request.send(postdata);

    if(!sync) {
      get_return();
    }
  }
}

function ajax_build_request(param, prefix) {
  var ret=[];

  for(var k in param) {
    if(prefix)
      var k_encoded = prefix + "[" + encodeURIComponent(k) + "]";
    else
      var k_encoded = encodeURIComponent(k);

    if(param[k] === null) {
      ret.push(k_encoded + "=");
      continue;
    }

    switch(typeof param[k]) {
      case "undefined":
        ret.push(k_encoded + "=");
        break;
      case "string":
      case "number":
      case "boolean":
        ret.push(k_encoded + "=" + encodeURIComponent(param[k]))
        break;
      default:
        if(param[k].length) {
          for(var i = 0; i < param[k].length; i++) {
            if((typeof param[k][i] == "string") || (typeof param[k][i] == "number"))
              ret.push(k_encoded + "[" + i + "]=" + encodeURIComponent(param[k][i]));
            else
              ret = ret.concat(ajax_build_request(param[k][i], k_encoded + "[" + i + "]"));
          }
        }
        else {
          for(var i in param[k]) {
            ret = ret.concat(ajax_build_request(param[k], k_encoded));
          }
        }
    }
  }

  return ret.join("&");
}

