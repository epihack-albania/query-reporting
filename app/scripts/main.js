const initialState = {
  periodStart: null,
  periodEnd: null,
  location: null,
  locations: [],
  dataSource: null,
  filters: [1,2],
  aggregations: [],
  nextFilterId: 3,
  currentData: null
};


// Wire dependencies

var createStore = Redux.createStore;
var applyMiddleware = Redux.applyMiddleware;
var Provider = ReactRedux.Provider;
var connect = ReactRedux.connect;
var thunk = ReduxThunk.default;

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
    rows: state.currentData,
    dataSource: DataSources[state.dataSource]
  };
};
FilterTable = connect(FilterTableState)(FilterTable);

var QueryPanelState = function(state) {
  return {
    hasDataSource: state.dataSource != null,
    hasData: state.currentData != null
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

var reducer = function(state, action) {
  if (state === undefined) {
    return initialState;
  }
  var newState = state;
  let newFilters;
  switch(action.type) {
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
                                         currentData: action.data});
    break;
  case 'loadCities':
    newState = Object.assign({}, state, {locations: action.data});
    break;
  }
  return newState;
};

var store = createStore(reducer, applyMiddleware(thunk));

store.dispatch(fetchCities());
store.dispatch(fetchDataSource('cchf'));

// ... and render!

ReactDOM.render(<Provider store={store}><QueryPanel/></Provider>, document.getElementById('app'));
