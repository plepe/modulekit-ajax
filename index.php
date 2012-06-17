<?php include "modulekit/loader.php"; /* loads all php-includes */ ?>
<html>
  <head>
    <title>Framework Example</title>
    <?php print modulekit_include_js(); /* prints all js-includes */ ?>
    <?php print modulekit_include_css(); /* prints all css-includes */ ?>
  </head>
  <body>
<script>
function test_callback(result, ob) {
  alert(result+"\nJSON: "+json_encode(result));
}

function test(func) {
  new ajax(func, null, null, test_callback);
  // new is optional, you can just use "ajax(...)"
}

function test_dom_callback(result, ob) {
  alert(result+"\nJSON: "+json_encode(result));
}

function test_dom(func) {
  new ajax(func, null, null, test_callback);
  // new is optional, you can just use "ajax(...)"
}
</script>
<?
print "<a href='javascript:test(\"int23\")'>Call function returning (int)23</a><br>";
print "<a href='javascript:test(\"str\")'>Call function returning (string)foobar</a><br>";
print "<a href='javascript:test(\"arr\")'>Call function returning an array</a><br>";
print "<a href='javascript:test(\"hash\")'>Call function returning a hash</a><br>";
print "<a href='javascript:test_dom(\"domnode\")'>Call function returning a domnode</a><br>";
print "<a href='javascript:test_dom(\"domdocument\")'>Call function returning a domdocument</a><br>";
?>
  </body>
</html>

