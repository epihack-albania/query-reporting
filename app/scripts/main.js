const initialState = {
  locations: [],
  originalData: [],

  periodStart: null,
  periodEnd: null,
  location: null,
  dataSource: null,

  nextFilterId: 3,
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
  return {filters: state.filters};
};
var FiltersPanelDispatch = function(dispatch) {
  return {
    addFilter: function() {
      dispatch({type: 'addFilter'});
    },
    removeFilter: function(filterIndex) {
      dispatch({type: 'removeFilter', index: filterIndex});
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
    return true;
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
    return _.sortBy(groups, 'label');
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
    let nextId = state.nextFilterId;
    newFilters = state.filters.concat([nextId]);
    newState = Object.assign({}, state, {filters: newFilters, nextFilterId: nextId + 1});
    break;
  case 'removeFilter':
    newFilters = state.filters.concat([]);
    newFilters.splice(action.index, 1);
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
