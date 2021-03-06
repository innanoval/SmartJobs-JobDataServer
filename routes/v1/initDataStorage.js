
// EU Country names
var EUCountries = ['Andorra', 'Austria', 'Belgium', 'Bulgaria', 'Cyprus', 'Czech Republic', 'Switzerland',
    'Denmark', 'Germany', 'Spain', 'Estonia', 'Finland', 'France', 'United Kingdom', 'Greece', 'Hungary',
    'Croatia', 'Ireland', 'Italy', 'Lithuania', 'Luxembourg', 'Latvia', 'Malta', 'Netherlands', 'Poland',
    'Portugal', 'Romania', 'San Marino', 'Ukraine', 'Slovakia', 'Slovenia', 'Czechia'];


/**
 * Creates the storage for initial info.
 * @param {qm.Base} _base - The QMiner database containing job postings info.
 */
function initDataStorage(_base) {

    var self = this;
    // TODO: do we need concepts for the initial information??

    //////////////////////////////////////////////////
    // the initial statistic numbers
    var numOfJobs      = _base.store("Jobs").length;
    var numOfSkills    = _base.store("Skills").length;
    var numOfLocations = _base.store("Locations").length;
    var numOfCountries = _base.store("Countries").length;
    // var numOfConcepts  = _base.store("Concepts").length;

    var skills     = computeSkills(_base, true);
    var locations  = computeLocations(_base, true);
    var countries  = computeCountries(_base, true);
    var timeSeries = computeTimeSeries(_base, true);
    // var concepts   = computeConcepts(_base, true);

    /**
     * Updates the data.
     * @param {Object | Array.<Object>} records - The record(s) to update the data with.
     * @param {Boolean} [sortF = false] - If true, sorts the arrays.
     * @return {Object} Self.
     */
    this.update = function(base, sortF) {
        var sort = sortF === undefined ? false : sortF;
        try {
            // update the initial statistics
            numOfJobs      = base.store("Jobs").length;
            numOfSkills    = base.store("Skills").length;
            numOfLocations = base.store("Locations").length;
            // numOfConcepts  = base.store("Concepts").length;

            skills     = computeSkills(base, sort);
            locations  = computeLocations(base, sort);
            countries  = computeCountries(base, sort);
            timeSeries = computeTimeSeries(base, sort);
            // concepts   = computeConcepts(base, sort);
        } catch (err) {
        }
    };

    /////////////////////////
    // Getters

    this.getCount = function() {
        return {
            // basic statistics
            numOfJobs: numOfJobs,
            numOfLocations: numOfLocations,
            numOfCountries: numOfCountries,
            numOfSkills: numOfSkills
        };
    };

    /**
     * Gets the most `_limit` requested skills.
     * @param  {Number} [_limit] - The number of skills requested.
     * @return {Object} Object containing the 'count' and 'data' fields.
     */
    this.getSkills = function(_limit) {
        var limit = _limit === undefined ? skills.length : _limit;
        var slicedSkills = skills.slice(0, limit);
        return {
            count: slicedSkills.length,
            data: slicedSkills
        };
    };

    /**
     * Gets the most `_limit` requested locations.
     * @param  {Number} [_limit] - The number of locations requested.
     * @return {Object} Object containing the 'count' and 'data' fields.
     */
    this.getLocations = function(_limit) {
        var limit = _limit === undefined ? locations.length : _limit;
        var slicedLocations = locations.slice(0, limit);
        return {
            count: slicedLocations.length,
            data: slicedLocations
        };
    };

    /**
     * Gets the most `_limit` requested countries.
     * @param  {Number} [_limit] - The number of countries requested.
     * @return {Object} Object containing the 'count' and 'data' fields.
     */
    this.getCountries = function(_limit) {
        var limit = _limit === undefined ? countries.length : _limit;
        var slicedCountries = countries.slice(0, limit);
        return {
            count: slicedCountries.length,
            data: slicedCountries
        };
    };

    /**
     * Gets the most `_limit` requested countries.
     * @param  {Number} [_limit] - The number of timeseries data requested.
     * @return {Object} Object containing the 'count' and 'data' fields.
     */
    this.getTimeSeries = function(_limit, _numOfSkills) {
        var limit = _limit === undefined ? timeSeries.length : _limit;
        var numOfSkills = _numOfSkills === undefined ? skills.length : _numOfSkills;
        var slicedTimeSeries = timeSeries.slice(timeSeries.length - limit, timeSeries.length);
        slicedTimeSeries.forEach(function(timeSeries) {
            timeSeries.skillset = timeSeries.skillset.slice(0, numOfSkills);
        });
        return {
            count: slicedTimeSeries.length,
            data: slicedTimeSeries
        };
    };

    /**
     * Gets the most `_limit` requested concepts.
     * @param  {Number} [_limit] - The number of concepts requested.
     * @return {Object} Object containing the 'count' and 'data' fields.
     */
    this.getConcepts = function(_limit) {
        var limit = _limit === undefined ? concepts.length : _limit;
        var slicedConcepts = concepts.slice(0, limit);
        return {
            count: slicedConcepts.length,
            data:  slicedConcepts
        };
    };

    /////////////////////////////////////////////////////
    // initialization functions
    /**
     * Calculates the initialization skills array.
     * @param {module:qm.Base} base - The given database.
     * @param {Boolean} sortF - If true, the array is sorted in descending order.
     * @return {Array.<Objects>} Array containing the (sorted) skill objects.
     */
    function computeSkills(base, sortF) {
        var sort = sortF === undefined ? false : sortF;

        var skills = base.store("Skills").allRecords;
        // sort in descending order
        if (sort) {
            skills.sort(function(skill1, skill2) {
                var jobs1 = skill1.requiredForJobs.length;
                var jobs2 = skill2.requiredForJobs.length;
                if (jobs2 < jobs1) {
                    return -1;
                } else if (jobs2 > jobs1) {
                    return 1;
                } else {
                    return 0;
                }
            });
        }

        // get the top 50 skills with number of jobs
        var topSkills = skills.map(function(skill) {
            var skillPair = {
                name: skill.name,
                value: skill.requiredForJobs.length
            };
            return skillPair;
        });
        return topSkills;
    }

    /**
     * Calculates the initialization location array.
     * @param  {module:qm.Base} base - The given database.
     * @param {Boolean} sortF - If true, the array is sorted in descending order.
     * @return {Array.<Objects>} Array containing the (sorted) locations objects.
     */
    function computeLocations(base, sortF) {
        var sort = sortF === undefined ? false : sortF;

        var locations = base.store("Locations").allRecords;
        // remove country locations
        locations.filter(function(loc) {
            return EUCountries.indexOf(loc.name) === -1;
        });
        // sort the remaining locations in descending order
        if (sort) {
            locations.sort(function(loc1, loc2) {
                var jobs1 = loc1.foundJobs.length;
                var jobs2 = loc2.foundJobs.length;
                if (jobs2 < jobs1) {
                    return -1;
                } else if (jobs2 > jobs1) {
                    return 1;
                } else {
                    return 0;
                }
            });
        }
        // get the top locations with number of jobs
        var topLocations = [];
        for (var locN = 0; locN < locations.length; locN++) {
            var loc = locations[locN];
            if (loc.name !== "") {
                topLocations.push({
                    name: loc.name,
                    value: loc.foundJobs.length
                });
            }
        }
        return topLocations;
    }

    /**
     * Calculates the initialization countries array.
     * @param  {module:qm.Base} base - The given database.
     * @param {Boolean} sortF - If true, the array is sorted in descending order.
     * @return {Array.<Objects>} Array containing the (sorted) countries objects.
     */
    function computeCountries(base, sortF) {
        var sort = sortF === undefined ? false : sortF;

        var countries = base.store("Countries").allRecords;
        // sort in descending order
        if (sort) {
            countries.sort(function(country1, country2) {
                var jobs1 = country1.foundJobs.length;
                var jobs2 = country2.foundJobs.length;
                if (jobs2 < jobs1) {
                    return -1;
                } else if (jobs2 > jobs1) {
                    return 1;
                } else {
                    return 0;
                }
            });
        }
        // get the country names with number of jobs
        var topCountries = countries.map(function(country) {
            var countryPair = {
                name: country.name,
                value: country.foundJobs.length
            };
            return countryPair;
        });
        return topCountries;
    }

    /**
     * Calculates the initialization timeseries array.
     * @param  {module:qm.Base} base - The given database.
     * @param {Boolean} sortF - If true, the array is sorted in descending order.
     * @return {Array.<Objects>} Array containing the (sorted) timeseries objects.
     */
    function computeTimeSeries(base, sortF) {
        var sort = sortF === undefined ? false : sortF;

        var date = new Date(Date.now());
        var jobs = base.store("Jobs").allRecords.filter(function (job) {
            return job.date.getTime() > date.getTime() - 62*24*60*60*1000;  // two months
        });

        var timeSeries = [];
        var dateIdx = {},
            idx = 0;
        jobs.each(function(job) {

            var date = new Date(job.date);
            var dateFullStr = date.getFullYear().toString() + '-' + (date.getMonth() + 1).toString() + '-' + (date.getDate()).toString();

            if (dateIdx[dateFullStr]) {
                // additional job has been found
                timeSeries[dateIdx[dateFullStr]].value += 1;
                // if the skill is not in the array, add to it
                job.requiredSkills.each(function(skill) {
                    var id = arrayObjectIndexOf(timeSeries[dateIdx[dateFullStr]].skillset, skill.name, "name");
                    if (id === -1) {
                        timeSeries[dateIdx[dateFullStr]].skillset.push({
                            name: skill.name,
                            value: 1
                        });
                    } else {
                        timeSeries[dateIdx[dateFullStr]].skillset[id].value += 1;
                    }
                });
            } else {
                // add the new day to the array
                var day = {
                    name: dateFullStr,
                    value: 1,
                    skillset: job.requiredSkills.map(function(skill) {
                        return {
                            name: skill.name,
                            value: 1
                        };
                    })
                };
                timeSeries.push(day);
                dateIdx[dateFullStr] = idx++;
            }
        });
        if (sort) {
            timeSeries.sort(function(obj1, obj2) {
                var timestamp1 = (new Date(obj1.name)).getTime();
                var timestamp2 = (new Date(obj2.name)).getTime();
                if (timestamp1 < timestamp2) {
                    return -1;
                } else if (timestamp1 > timestamp2) {
                    return 1;
                } else {
                    return 0;
                }
            });
            timeSeries.forEach(function(day) {
                day.skillset.sort(function(skill1, skill2) {
                    if (skill2.value < skill1.value) {
                        return -1;
                    } else if (skill2.value < skill1.value) {
                        return 1;
                    } else {
                        return 0;
                    }
                });
            });
        }
        return timeSeries;
    }

    /**
     * Calculates the initialization concepts array.
     * @param  {module:qm.Base} base - The given database.
     * @param {Boolean} sortF - If true, the array is sorted in descending order.
     * @return {Array.<Objects>} Array containing the (sorted) concepts objects.
     */
    function computeConcepts(base, sortF) {
        var sort = sortF === undefined ? false : sortF;

        var concepts = base.store("Concepts").allRecords;
        // sort in descending order
        if (sort) {
            concepts.sort(function(concept1, concept2) {
                var jobs1 = concept1.foundForJobs.length;
                var jobs2 = concept2.foundForJobs.length;
                if (jobs2 < jobs1) {
                    return -1;
                } else if (jobs2 > jobs1) {
                    return 1;
                } else {
                    return 0;
                }
            });
        }
        // get the country names with number of jobs
        var topConcepts = concepts.map(function(concept) {
            var conceptPair = {
                name: concept.name,
                value: concept.foundForJobs.length
            };
            return conceptPair;
        });
        return topConcepts;
    }

    /////////////////////////
    // Helpers

    /**
     * Gets the index of the object in the array for
     * the object with property 'property' and value 'val'.
     * @param  {Array.<Object>} _array - The Object array.
     * @param  {Object} val            - Searched value.
     * @param  {String} property       - The property of the objects.
     * @return {Number} The index of of the found object in the array.
     */
    function arrayObjectIndexOf(_array, val, property) {
        for (var idx = 0; idx < _array.length; idx++) {
            if (_array[idx][property] === val) {
                return idx;
            }
        }
        return -1;
    }

    /**
     * Updates the array with the given objects.
     * @param  {Array.<Object>} array - The array to be updated.
     * @param  {Object} updateObj - The object used for the update.
     * @param  {Boolean} [_sortF=false] - If true, sorts the array in descending order.
     * @return {Array.<Object>} The updated array of objects.
     */
    function updateInitArray(array, updateObj, _sortF) {
        var sortF = _sortF === undefined ? false : _sortF;

        // inserts the record in the array
        function insertRecord(array, obj) {
            var idx = arrayObjectIndexOf(array, obj.name, "name");
            if (idx === -1) {
                array.push({
                    name: obj.name,
                    value: 1
                });
            } else {
                array[idx].value += 1;
            }
        }

        if (updateObj instanceof Array) {
            updateObj.forEach(function(obj) {
                insertRecord(array, obj);
            });
        } else if (updateObj instanceof Object) {
            insertRecord(array, updateObj);
        } else {
            throw "initData::updateInitArray: UpdateObj must be an Array of Objects or an Object!";
        }

        if (sortF) {
            array.sort(function(obj1, obj2) {
                if (obj2.value < obj1.value) {
                    return -1;
                } else if (obj2.value > obj1.value) {
                    return 1;
                } else {
                    return 0;
                }
            });
        }
        return array;
    }

    /**
     * Updates the array with the given objects.
     * @param  {Array.<Object>} array - The array to be updated.
     * @param  {Object} updateObj - The object used for the update.
     * @param  {Boolean} [_sortF=false] - If true, sorts the array in descending order.
     * @return {Array.<Object>} The updated array of objects.
     */
    function updateTimeSeriesArray(array, updateObj, _sortF) {
        var sortF = _sortF === undefined ? false : _sortF;

        // inserts the record in the array
        function insertRecord(array, obj) {

            var date = new Date(obj.date);
            var dateFullStr = date.getFullYear().toString() + '-' + (date.getMonth() + 1).toString() + '-' + (date.getDate()).toString();

            var idx = arrayObjectIndexOf(array, dateFullStr, "name");
            if (idx === -1) {
                array.push({
                    name: dateFullStr,
                    value: 1,
                    skillset: obj.requiredSkills.map(function (skill) {
                        return {
                            name: skill.name,
                            value: 1
                        };
                    })
                });
            } else {
                array[idx].value += 1;
                obj.requiredSkills.forEach(function (skill) {
                    var id = arrayObjectIndexOf(array[idx].skillset, skill.name, "name");
                    if (id === -1) {
                        array[idx].skillset.push({
                            name: skill.name,
                            value: 1
                        });
                    } else {
                        array[idx].skillset[id].value += 1;
                    }
                });
            }
        }

        if (updateObj instanceof Array) {
            updateObj.forEach(function (obj) {
                insertRecord(array, obj);
            });
        } else if (updateObj instanceof Object) {
            insertRecord(array, updateObj);
        } else {
            throw "initData::updateInitArray: UpdateObj must be an Array of Objects or an Object!";
        }

        if (sortF) {
            // sort the records by timestamp
            array.sort(function(obj1, obj2) {
                var timestamp1 = (new Date(obj1.name)).getTime();
                var timestamp2 = (new Date(obj2.name)).getTime();
                if (timestamp1 < timestamp2) {
                    return 1;
                } else if (timestamp1 > timestamp2) {
                    return -1;
                } else {
                    return 0;
                }
            });
            // sort the skills by values
            array.forEach(function(day) {
                day.skillset.sort(function(skill1, skill2) {
                    if (skill2.value < skill1.value) {
                        return -1;
                    } else if (skill2.value < skill1.value) {
                        return 1;
                    } else {
                        return 0;
                    }
                });
            });
        }
    }
    // return initDataStorage object
    return this;
}

// contains the initialization values
module.exports = initDataStorage;
