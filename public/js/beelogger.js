/*
             Client-side API wrapper for BeeLogger's REST API

                        Written by Fabian Reinders
                      (https://github.com/fabiancdng)

                     Copyright (c) 2021 Fabian Reinders
*/

/**
 * An object representing one data record.
 * 
 * @typedef {Object} BeeLoggerData
 * @property {number} humidity
 * @property {string} measured
 * @property {number} number
 * @property {number} temperature
 * @property {number} weight
 */

/**
 * Wrapper class for the BeeLogger REST API.
 * 
 * @author Fabian Reinders <https://github.com/fabiancdng>
 */
class BeeLogger {
    /**
     * Creates a new Object for interacting with BeeLogger's REST API.
     * 
     * Documentation: https://github.com/Programmier-AG/BeeLogger/wiki/REST-API
     */
    constructor() {
        /**
         * Store for data that has been fetched
         * from the API.
         * 
         * Holds the latest data (from about the
         * last 24 hours) after `getCurrentData()` is run.
         * 
         * This is used to store the current data separately.
         * BeeLogger's dashboard utilizes this for example to 
         * provide the 'current data' section on top of the page.
         * 
         * @type {Object.<string, BeeLoggerData>}
         */
        this.currentData = {}

        /**
         * Store for data that has been fetched
         * from the API.
         * 
         * Holds the data that has last been fetched with
         * `getData()` to prevent having to use global variables
         * or re-fetch data from elsewhere in the document.
         * 
         * @type {Object.<string, BeeLoggerData>}
         */
        this.cachedData = {}
    }

    /**
     * Retrieves measured data for the specified time span.
     * 
     * Data fetched with this function will also be stored in the
     * `this.cachedData` attribute.
     * 
     * Wrapper for `api/data/get`.
     * 
     * Documentation: https://github.com/Programmier-AG/BeeLogger/wiki/REST-API#get-apidataget
     * 
     * @param {String} fromDate ISO formatted date from which the data should start
     * @param {String} toDate ISO formatted date at which the data should end
     * @param {boolean} compressed Whether the data should contain all records for the day or only one
     * 
     * @returns {Promise<Object|number>} Promise that resolves with parsed data or rejects with HTTP error code on error.
     */
    getData(fromDate, toDate, compressed) {
        // Append compressed option when boolean is true
        compressed = compressed ? '&compressed' : '';

        // Construct URL for the API call
        var url = '/api/data/get?from=' + fromDate + '&to=' + toDate + `${compressed}`;
        
        return new Promise(async (resolve, reject) => {
            var response = await fetch(url)
                .catch(err => reject(500));
            
            if(!response) return;

            if(!response.ok) {
                // Reject promise with HTTP error code on error on the API side
                reject(response.status);
            } else {
                var data = await response.json();
                // Save data to the cache attribute
                this.cachedData = data;
                // Resolve promise with parsed data
                resolve(data);
            };
        });
    }

    /**
     * Retrieves data measured in about the last 24 hours.
     * 
     * Data fetched with this function will also be stored in the
     * `this.currentData` attribute.
     * 
     * @param {String} fromDate ISO formatted date from which the data should start
     * @param {String} toDate ISO formatted date at which the data should end
     * 
     * @returns {Promise<Object|number>} Promise that resolves with parsed data or rejects with HTTP error code on error.
     */
    getCurrentData(fromDate, toDate) {
        return new Promise(async (resolve, reject) => {
            var data = await this.getData(fromDate, toDate, false)
                .catch(err => reject(err));
            
            // Save data to current attribute
            this.currentData = data;
            // Resolve promise with parsed data
            resolve(data);
        });
    }
}