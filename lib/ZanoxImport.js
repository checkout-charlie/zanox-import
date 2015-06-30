var querystring = require('querystring')
    , hat = require('hat')
    , http = require('http')
    , crypto = require('crypto')
    , moment = require('moment')
    , _ = require('underscore')
    , winston = require('winston')
    , vsprintf = require("sprintf-js").vsprintf

function ZanoxImport(connectionId, secret) {
    var self = this

    self.quantityOfItemsPerPage = 50
    self.items = []

    self.connectionId = connectionId
    self.secret = secret
}

/**
 * Executes authorizated fetch for data with pagination.
 */
ZanoxImport.prototype.fetch = function(reportType, date, cb) {
    var self = this

    var makeRequest = function(pageCurrent) {

        var nonce = hat()
        var timestamp = new Date().toUTCString()

        uri = vsprintf("/reports/%s/date/%s", [reportType, date])
        path_prefix = "/json/2011-03-01"

        signature = 'GET' + uri + timestamp + nonce
        var hmac = crypto.createHmac('sha1', self.secret)
        hmac.update(signature)
        var result = hmac.digest('base64')

        var header = vsprintf("ZXWS %s:%s", [self.connectionId, result])

        var queryParams = { page: pageCurrent, items: self.quantityOfItemsPerPage }

        var options =
            { hostname: 'api.zanox.com'
            , port:     '80'
            , method:   'GET'
            , httptype: 'http'
            , path:     path_prefix + uri + "?" + querystring.stringify(queryParams)
            , headers:
                { 'Date': timestamp
                , 'Nonce': nonce
                , 'Authorization': header
            }
        }

        var data = ""

        var request = http.request(options, function(resp) {
            var data = ""
            resp.on('data', function(chunk) {
                data += chunk
            })

            resp.on('end', function() {
                var result = JSON.parse(data)

                var reportTypeSingularized = reportType.substring(0, reportType.length - 1)
                var level1 = vsprintf("%sItems", [reportTypeSingularized])
                var level2 = vsprintf("%sItem", [reportTypeSingularized])

                if (_.isArray(result[level1][level2])) {
                    _.each(result[level1][level2], function(item) {
                        self.items.push(item)
                    })
                }

                var totalPage = Math.floor( (result.total + self.quantityOfItemsPerPage - 1) / self.quantityOfItemsPerPage )
                pageCurrent += 1

                if (pageCurrent < totalPage) {
                    makeRequest(pageCurrent)
                } else {
                    cb(false, self.items)
                }

            })
        }).on("error", function(ex) {
            cb(ex)
        })
        request.write(data)
        request.end()
    }

    makeRequest(0)

}

module.exports = ZanoxImport
