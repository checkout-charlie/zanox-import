sparwelt-zanox-import
===================

# Goal and responsibility

*sparwelt-zanox-import* allows to import content from api.zanox.com (RESTful API V20110301).
Current version does not provide full functionality. Implemented endpoints:

  * [GET: Retrieving all sale items](http://wiki.zanox.com/en/REST_V2011-03-01_Reports#GET:_Retrieving_all_sale_items)
  * [GET: Retrieving all lead items](http://wiki.zanox.com/en/REST_V2011-03-01_Reports#GET:_Retrieving_all_lead_items)

# Installation

Installation can be made by cloning git repository:
```bash
https://github.com/sparwelt/zanox-import
```

Or by using npm manager:
```bash
npm install sparwelt-zanox-import
```

It is advised to use node version 0.12.2 or later.

# Usage

Import works in scope of one day. Example below imports all *sales* for day 2015-03-10.
```js
var ZanoxImport = require("./lib/ZanoxImport.js")

var connectId = "<ZANOX API CONNECT ID HERE>"
var secret = "<ZANOX API SECRET HERE>"

var zanoxImport = new ZanoxImport(connectId, secret)
zanoxImport.fetch("sales", "2015-03-10", function(err, result) {
    if (err) {
        console.log("ERROR!")
    }

    console.log(result)
})
```
