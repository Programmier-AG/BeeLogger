/*
    Client-side API wrapper for BeeLogger's REST API

    Written by Fabian Reinders (https://github.com/fabiancdng)

    Copyright (c) 2021 Fabian R., Sönke K.
*/

/**
 * Wrapper class for the BeeLogger REST API.
 * 
 * @author Fabian Reinders <fabian@fabiancdng.com>
 */
class BeeLoggerAPI {
    /**
     * Creates a new Object for interacting with BeeLogger's REST API.
     * 
     * Documentation: https://github.com/Programmier-AG/BeeLogger/wiki/REST-API
     */
    constructor() {
        this.data = {
            current: {},
            cache: {}
        }
    }

    /**
     * Retrieve measured data for the specified time span.
     * 
     * Wrapper for `api/data/get`.
     * 
     * Documentation: https://github.com/Programmier-AG/BeeLogger/wiki/REST-API#get-apidataget
     * 
     * @param {String} fromDate ISO formatted date from which the data should start
     * @param {String} toDate ISO formatted date at which the data should end
     * @param {boolean} compressed Whether the data should contain all records for the day or only one
     * 
     * @returns {Object.<string, Object>|null} All records matching the query or null on error.
     */
    async getData(fromDate, toDate, compressed) {
        // Construct URL for the API call.
        var url = '/api/data/get?from=' + fromDate + '&to=' + toDate + `${compressed && '&compressed'}`;
        
        var response = await fetch(url);
    
        // Checking if valid data is returned and not some error
        if(!response.ok) {
            return null;
        }
    
        return await response.json();
    }
}