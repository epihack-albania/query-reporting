const initialState = {
  locations: [],
  originalData: [],

  periodStart: null,
  periodEnd: null,
  location: null,
  dataSource: null,

  filters: [],
  aggregations: ['year'],

  filteredData: [],
  aggregatedData: []
};


// Wire dependencies

var createStore = Redux.createStore;
var applyMiddleware = Redux.applyMiddleware;
var Provider = ReactRedux.Provider;
var connect = ReactRedux.connect;
var thunk = ReduxThunk.default;

function TimePeriodState(state) {
  return {
    periodStart: state.periodStart,
    periodEnd: state.periodEnd
  };
}
function TimePeriodDispatch(dispatch) {
  return {
    onPeriodChanged: function(field, value) {
      dispatch({type: 'changePeriod', field: field, value: value});
    }
  };
}
TimePeriodSection = connect(TimePeriodState, TimePeriodDispatch)(TimePeriodSection);

var DataSourceSectionState = function(state) {
  return {dataSource: state.dataSource};
};
var DataSourceSectionDispatch = function(dispatch) {
  return {
    onSelected: function(dataSource) {
      dispatch(fetchDataSource(dataSource));
    }
  };
};
DataSourceSection = connect(DataSourceSectionState, DataSourceSectionDispatch)(DataSourceSection);

var LocationSectionState = function(state) {
  return {location: state.location, locations: state.locations};
};
var LocationSectionDispatch = function(dispatch) {
  return {
    onSelected: function(location) {
      dispatch({type: 'selectLocation', location: location});
    }
  };
};
LocationSection = connect(LocationSectionState, LocationSectionDispatch)(LocationSection);

var FiltersPanelState = function(state) {
  return {filters: state.filters, fields: DataSources[state.dataSource].fields};
};
var FiltersPanelDispatch = function(dispatch) {
  return {
    addFilter: function(fieldName) {
      dispatch({type: 'addFilter', name: fieldName});
    },
    removeFilter: function(filterIndex) {
      dispatch({type: 'removeFilter', index: filterIndex});
    },
    changeFilter: function(filterIndex, field, value) {
      dispatch({type: 'changeFilter', index: filterIndex, field: field, value: value});
    }
  };
};
FiltersPanel = connect(FiltersPanelState, FiltersPanelDispatch)(FiltersPanel);

var FilterTableState = function(state) {
  return {
    rows: state.filteredData,
    dataSource: DataSources[state.dataSource],
    totalCount: state.originalData.length
  };
};
FilterTable = connect(FilterTableState)(FilterTable);

function AggregationsPanelState(state) {
  return {
    aggregations: state.aggregations
  };
}
function AggregationsPanelDispatch(dispatch) {
  return {
    onAggregationChanged: function(index, value) {
      dispatch({type: 'changeAggregation', index: index, by: value});
    },
    onAggregationAdded: function(value) {
      dispatch({type: 'addAggregation', by: value});
    }
  };
}
AggregationsPanel = connect(AggregationsPanelState, AggregationsPanelDispatch)(AggregationsPanel);

function AggregationsTableState(state) {
  return {
    data: state.aggregatedData
  };
}
AggregationsTable = connect(AggregationsTableState)(AggregationsTable);

var QueryPanelState = function(state) {
  return {
    hasDataSource: state.dataSource != null,
    hasData: state.originalData && state.originalData.length > 0
  };
};
QueryPanel = connect(QueryPanelState)(QueryPanel);



// Business logic using Redux

// Async actions

function fetchDataSource(dataSource) {
  if (dataSource) {
    let dsDef = DataSources[dataSource];
    return function(dispatch) {
      return fetch(dsDef.url).then(function(response) {
        return response.json();
      }).then(function(data) {
        let sortedData = _.sortBy(data, 'date');
        dispatch({type: 'loadDataSource', dataSource: dataSource, data: sortedData});
      });
    };
  } else {
    return {type: 'loadDataSource', dataSource: dataSource, data: null};
  }
}

function fetchCities() {
  return function(dispatch) {
    return fetch('data/cities.json').then(function(response) {
      return response.json();
    }).then(function(data) {
      dispatch({type: 'loadCities', data: _.sortBy(data, _.identity)});
    });
  };
}

function filterApplies(filter, row) {
  let value = row[filter.name];

  switch(filter.type) {
  case 'number':
    if (filter.from && parseInt(value) < parseInt(filter.from)) {
      return false;
    }
    if (filter.to && parseInt(value) > parseInt(filter.to)) {
      return false;
    }
    break;
  case 'date':
    if (filter.from && value < filter.from) {
      return false;
    }
    if (filter.to && value > filter.to) {
      return false;
    }
    break;
  }
  return true;
}

function filterRows(state, data) {
  return _.filter(data, function(row) {
    if (state.periodStart && row.date < state.periodStart) {
      return false;
    }
    if (state.periodEnd && row.date > state.periodEnd) {
      return false;
    }
    if (state.location != undefined) {
      let locationName = state.locations[state.location].toLocaleLowerCase().slice(0,3);
      if (!row.location) {
        return false;
      }
      if (locationName != row.location.district.toLocaleLowerCase().slice(0,3)) {
        return false;
      }
    }
    return _.every(state.filters, function(filter) {
      return filterApplies(filter, row);
    });
  });
}

function getGroup(row, by) {
  switch (by) {
  case 'year':
    if (row.date) {
      let year = row.date.slice(0,4);
      return {key: year, label: year};
    } else {
      return null;
    }
  case 'district':
    if (row.location) {
      let label = row.location.district;
      label = label[0].toLocaleUpperCase() + label.slice(1).toLocaleLowerCase();
      let key = label.slice(0,3).toLocaleLowerCase();
      return {key: key, label: label};
    } else {
      return null;
    }
  case 'gender':
    switch (row.gender) {
    case 'M':
      return {key: 'M', label: 'Male'};
    case 'F':
      return {key: 'F', label: 'Female'};
    case 'U':
      return {key: 'U', label: 'Unknown'};
    default:
      return null;
    }
  case 'age':
    if (row.age == undefined) {
      return null;
    }
    let age = parseInt(row.age);
    if (age < 1) {
      return {key: '00-01', label: '0 years'};
    } else if (age <= 4) {
      return {key: '01-04', label: '1-4 years'};
    } else if (age <= 9) {
      return {key: '05-09', label: '5-9 years'};
    } else if (age <= 14) {
      return {key: '10-14', label: '10-14 years'};
    } else if (age <= 19) {
      return {key: '15-19', label: '15-19 years'};
    } else if (age <= 24) {
      return {key: '20-24', label: '20-24 years'};
    } else if (age <= 29) {
      return {key: '25-29', label: '25-29 years'};
    } else if (age <= 34) {
      return {key: '30-34', label: '30-34 years'};
    } else if (age <= 39) {
      return {key: '35-39', label: '35-39 years'};
    } else if (age <= 44) {
      return {key: '40-44', label: '40-44 years'};
    } else if (age <= 49) {
      return {key: '45-49', label: '45-49 years'};
    } else if (age <= 54) {
      return {key: '50-54', label: '50-54 years'};
    } else if (age <= 59) {
      return {key: '55-59', label: '55-59 years'};
    } else if (age <= 64) {
      return {key: '60-64', label: '60-64 years'};
    } else if (age <= 69) {
      return {key: '65-69', label: '65-69 years'};
    } else if (age <= 74) {
      return {key: '70-74', label: '70-74 years'};
    } else if (age <= 79) {
      return {key: '75-79', label: '75-79 years'};
    } else if (age <= 84) {
      return {key: '80-84', label: '80-84 years'};
    } else {
      return {key: '85+', label: '85+ years'};
    }
  default:
    return null;
  }
}

function aggregateRows(state, data) {
  if (state.aggregations.length <= 0) {
    return [];
  }

  let groups = _.map(state.aggregations, function(agg) {
    let groups = {};
    _.each(data, function(row) {
      let group = getGroup(row, agg);
      if (group && !groups.hasOwnProperty(group.key)) {
        groups[group.key] = {key: group.key, label: group.label};
      }
    });
    groups = _.map(groups, _.identity);
    return _.sortBy(groups, 'key');
  });

  function addToBucket(buckets, aggIdx, row) {
    let agg = state.aggregations[aggIdx];
    if (!agg) return;
    let group = getGroup(row, agg);
    if (group != null) {
      let bucket = buckets[group.key] || {count: 0, buckets: {}};
      bucket.count++;
      addToBucket(bucket.buckets, aggIdx+1, row);
      buckets[group.key] = bucket;
    }
  }

  let buckets = {};
  _.each(data, function(row) {
    addToBucket(buckets, 0, row);
  });

  return {groups: groups, data: buckets};
}

var reducer = function(state, action) {
  if (state === undefined) {
    return initialState;
  }
  var newState = state;
  let newFilters, newAggs;
  switch(action.type) {
  case 'changePeriod':
    if (action.field == 'periodStart') {
      newState = Object.assign({}, state, {periodStart: action.value});
    } else {
      newState = Object.assign({}, state, {periodEnd: action.value});
    }
    break;
  case 'selectLocation':
    newState = Object.assign({}, state, {location: action.location});
    break;
  case 'selectDataSource':
    newState = Object.assign({}, state, {dataSource: action.dataSource});
    break;
  case 'addFilter':
    let field = _.find(DataSources[state.dataSource].fields, ['name', action.name]);
    newFilters = state.filters.concat([_.extend({from: '', to: ''}, field)]);
    newState = Object.assign({}, state, {filters: newFilters});
    break;
  case 'removeFilter':
    newFilters = state.filters.concat([]);
    newFilters.splice(action.index, 1);
    newState = Object.assign({}, state, {filters: newFilters});
    break;
  case 'changeFilter':
    newFilters = state.filters.concat([]);
    newFilters[action.index][action.field] = action.value;
    newState = Object.assign({}, state, {filters: newFilters});
    break;
  case 'loadDataSource':
    newState = Object.assign({}, state, {dataSource: action.dataSource,
                                         originalData: action.data});
    break;
  case 'loadCities':
    newState = Object.assign({}, state, {locations: action.data});
    break;
  case 'changeAggregation':
    newAggs = state.aggregations.concat([]);
    if (action.by) {
      newAggs[action.index] = action.by;
    } else {
      newAggs.splice(action.index, 1);
    }
    newState = Object.assign({}, state, {aggregations: newAggs});
    break;
  case 'addAggregation':
    newAggs = state.aggregations.concat([action.by]);
    newState = Object.assign({}, state, {aggregations: newAggs});
    break;
  }

  let filteredRows = filterRows(newState, newState.originalData);
  newState = Object.assign({}, newState, {filteredData: filteredRows});

  let aggregatedRows = aggregateRows(newState, filteredRows);
  newState = Object.assign({}, newState, {aggregatedData: aggregatedRows});

  return newState;
};

var store = createStore(reducer, applyMiddleware(thunk));

store.dispatch(fetchCities());
store.dispatch(fetchDataSource('cchf'));

// ... and render!

ReactDOM.render(<Provider store={store}><QueryPanel/></Provider>, document.getElementById('app'));

$(document).ready(function () {

    function exportTableToCSV($table, filename) {

        var $rows = $table.find('tr:has(td)'),

            // Temporary delimiter characters unlikely to be typed by keyboard
            // This is to avoid accidentally splitting the actual contents
            tmpColDelim = String.fromCharCode(11), // vertical tab character
            tmpRowDelim = String.fromCharCode(0), // null character

            // actual delimiter characters for CSV format
            colDelim = '","',
            rowDelim = '"\r\n"',

            // Grab text from table into CSV formatted string
            csv = '"' + $rows.map(function (i, row) {
                var $row = $(row),
                    $cols = $row.find('td');

                return $cols.map(function (j, col) {
                    var $col = $(col),
                        text = $col.text();

                    return text.replace(/"/g, '""'); // escape double quotes

                }).get().join(tmpColDelim);

            }).get().join(tmpRowDelim)
                .split(tmpRowDelim).join(rowDelim)
                .split(tmpColDelim).join(colDelim) + '"',

            // Data URI
            csvData = 'data:application/csv;charset=utf-8,' + encodeURIComponent(csv);

        $(this)
            .attr({
            'download': filename,
                'href': csvData,
                'target': '_blank'
        });
    }

    // This must be a hyperlink
    $(".export").on('click', function (event) {
        // CSV
        exportTableToCSV.apply(this, [$('table.filter-results'), 'export.csv']);
        
        // IF CSV, don't do event.preventDefault() or return false
        // We actually need this to be a typical hyperlink
    });
});
