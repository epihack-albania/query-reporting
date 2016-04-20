// Static data

var DataSources = {
  cchf: {
    label: "CCHF",
    url: "/data/cchf.json",
    fields: [
      {name: "date", label: "Date of onset", type: "date"},
      {name: "location", label: "Location", type: "location"},
      {name: "age", label: "Age", type: "number"},
      {name: "gender", label: "Gender", type: "enumeration"},
      {name: "case_contact", label: "Case type", type: "enumeration"},
      {name: "date_hospitalization_district", label: "Date of hospitalization in district", type: "date"},
      {name: "date_hospitalization_central", label: "Date of hospitalization in central", type: "date"},
      {name: "district_reporting_date", label: "Date of reporting for district", type: "date"},
      {name: "iph_reporting_date", label: "Date of reporting for IPH", type: "date"},
      {name: "patient_status", label: "Patient status", type: "enumeration"},
      {name: "epi_investigation_date", label: "EPI investigation", type: "date"}
    ]
  },
  brucellosis: {
    label: "Brucellosis",
    url: "/data/brucellosis.json",
    fields: [
      {name: "date", label: "Date of onset", type: "date"},
      {name: "location", label: "Location", type: "location"},
      {name: "age", label: "Age", type: "number"},
      {name: "gender", label: "Gender", type: "enumeration"},
      {name: "case_contact", label: "Case type", type: "enumeration"},
      {name: "date_hospitalization_district", label: "Date of hospitalization in district", type: "date"},
      {name: "date_hospitalization_central", label: "Date of hospitalization in central", type: "date"}
    ]
  },
  hbv_hbc: {
    label: "HBV and HCV", fields: []
  }
};

var Locations = [
  "Tirana",
  "Saranda",
  "Elbasan",
  "Korça",
  "Durrsi",
  "Shkodra"
];


// Wire dependencies

var createStore = Redux.createStore;
var applyMiddleware = Redux.applyMiddleware;
var Provider = ReactRedux.Provider;
var connect = ReactRedux.connect;
var thunk = ReduxThunk.default;

// Component definition

class DataSourceSection extends React.Component {
  handleSelect(selected) {
    this.props.onSelected(selected && selected.value);
  }
  render() {
    let options = _.map(DataSources, function(source, sourceId) {
      return {value: sourceId, label: source.label};
    });
    return <div className="">
      <label>Data Source</label>
      <Select value={this.props.dataSource} onChange={this.handleSelect.bind(this)} options={options}/>
    </div>;
  }
}

var DataSourceSectionState = function(state) {
  return {
    dataSource: state.dataSource
  };
};

var DataSourceSectionDispatch = function(dispatch) {
  return {
    onSelected: function(dataSource) {
      dispatch(fetchDataSource(dataSource));
    }
  };
};

DataSourceSection = connect(DataSourceSectionState, DataSourceSectionDispatch)(DataSourceSection);

class LocationSection extends React.Component {
  handleSelect(selected) {
    this.props.onSelected(selected && selected.value);
  }
  render() {
    let options = _.map(this.props.locations, function(location, index) {
      return {value: index, label: location};
    });
    return <div className="">
      <label>Location</label>
      <Select value={this.props.location} onChange={this.handleSelect.bind(this)} options={options}/>
    </div>;
  }
}

var LocationSectionState = function(state) {
  return {
    location: state.location,
    locations: state.locations
  };
};

var LocationSectionDispatch = function(dispatch) {
  return {
    onSelected: function(location) {
      dispatch({type: 'selectLocation', location: location});
    }
  };
};

LocationSection = connect(LocationSectionState, LocationSectionDispatch)(LocationSection);

class TimePeriodSection extends React.Component {
  render() {
    return <div className="">
      <label>Time Period</label>
      <input type="date" className="form-control"/>
      <input type="date" className="form-control"/>
    </div>;
  }
}

class FilterRow extends React.Component {
  render() {
    return <div className="row form-inline filter-row">
      <label>Filter #{this.props.name}</label>
      <input className="form-control"/>
      <button className="btn btn-danger" onClick={this.props.onRemove}>Remove filter</button>
    </div>;
  }
}

class FiltersPanel extends React.Component {
  handleNewFilter() {
    this.props.addFilter();
  }
  handleRemoveFilter(index) {
    this.props.removeFilter(index);
  }
  render() {
    let filters = _.map(this.props.filters, function(filter, index) {
      return <FilterRow key={index} name={filter} onRemove={this.handleRemoveFilter.bind(this, index)}/>;
    }.bind(this));
    return <div className="">
      <fieldset>
        <legend>Filters</legend>
        {filters}
        <div className="row">
          <button className="btn btn-primary" onClick={this.handleNewFilter.bind(this)}>Add filter</button>
        </div>
      </fieldset>
    </div>;
  }
}

var FiltersPanelState = function(state) {
  return {
    filters: state.filters
  };
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

function displayValue(field, value) {
  if (!value) return '';
  switch (field.type) {
  case 'location':
    return `${value.district}, ${value.municipality}, ${value.village}`;
  default:
    return value.toString();
  }
}

class FilterTableRow extends React.Component {
  render() {
    let cols;
    cols = _.map(this.props.fields, function(field) {
      let value = this.props.data[field.name];
      value = displayValue(field, value);
      return <td key={field.name}>{value}</td>;
    }.bind(this));
    return <tr>{cols}</tr>;
  }
}

class FilterTable extends React.Component {
  render() {
    let rows, headers;
    if (this.props.rows) {
      let fields = this.props.dataSource.fields;
      rows = _.map(this.props.rows, function(row, index) {
        return <FilterTableRow data={row} fields={fields} key={index}/>;
      });
      headers = _.map(fields, function(field) {
        return <th key={field.name}>{field.label}</th>;
      });
    }
    return (
        <div className="col-md-12">
          <table className="table filter-results">
            <thead>
              <tr>
                {headers}
              </tr>
            </thead>
            <tbody>
              {rows}
            </tbody>
          </table>
        </div>
    );
  }
}

var FilterTableState = function(state) {
  return {
    rows: state.currentData,
    dataSource: DataSources[state.dataSource]
  };
};

FilterTable = connect(FilterTableState)(FilterTable);

class QueryPanel extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    let filtersSection, filtersTable;
    if (this.props.hasDataSource) {
      filtersSection = <FiltersPanel/>;
      if (this.props.hasData) {
        filtersTable = <FilterTable/>;
      }
    }
    return <div>
      <div className="row">
        <TimePeriodSection/>
        <LocationSection/>
        <DataSourceSection/>
      </div>
      {filtersSection}
      {filtersTable}
    </div>;
  }
}

var QueryPanelState = function(state) {
  return {
    hasDataSource: state.dataSource != null,
    hasData: state.currentData != null
  };
};

QueryPanel = connect(QueryPanelState)(QueryPanel);



// Business logic using Redux

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
    return fetch('/data/cities.json').then(function(response) {
      return response.json();
    }).then(function(data) {
      dispatch({type: 'loadCities', data: _.sortBy(data, _.identity)});
    });
  };
}

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

store.dispatch(fetchDataSource('cchf'));
store.dispatch(fetchCities());

// ... and render!

ReactDOM.render(<Provider store={store}><QueryPanel/></Provider>, document.getElementById('app'));
