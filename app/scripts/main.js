// Static data

var DataSources = [
  {id: "cchf", name: "CCHF", fields: [
    {name: "date", type: "date"},
    {name: "location", type: "location"},
    {name: "age", type: "number"},
    {name: "gender", type: "enumeration"},
    {name: "case_contact", type: "enumeration"},
    {name: "date_onset", type: "date"},
    {name: "date_hospitalization_district", type: "date"},
    {name: "date_hospitalization_central", type: "date"},
    {name: "district_reporting_date", type: "date"},
    {name: "iph_reporting_date", type: "date"},
    {name: "patient_status", type: "enumeration"},
    {name: "epi_investigation_date", type: "date"}
  ]},
  {id: "brucelosis", name: "Brucellosis", fields: [
  ]},
  {id: "hbv_hbc", name: "HBV and HCV", fields: [
  ]},
  {id: "field_ticks", name: "Field Ticks", fields: [
  ]},
  {id: "sand_flies", name: "Sand flies", fields: [
  ]},
  {id: "mosquitoes", name: "Mosquitoes", fields: [
  ]},
  {id: "hanta", name: "Hanta Virus", fields: [
  ]}
];

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
var Provider = ReactRedux.Provider;
var connect = ReactRedux.connect;

// Component definition

class DataSourceSection extends React.Component {
  handleSelect(selected) {
    this.props.onSelected(selected && selected.value);
  }
  render() {
    let options = _.map(DataSources, function(source, index) {
      return {value: index, label: source.name};
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
      dispatch({type: 'selectDataSource', dataSource: dataSource});
    }
  };
};

DataSourceSection = connect(DataSourceSectionState, DataSourceSectionDispatch)(DataSourceSection);

class LocationSection extends React.Component {
  handleSelect(selected) {
    this.props.onSelected(selected && selected.value);
  }
  render() {
    let options = _.map(Locations, function(location, index) {
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
    location: state.location
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

class QueryPanel extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    let filtersSection;
    if (this.props.dataSource) {
      filtersSection = <FiltersPanel/>;
    }
    return <div>
      <div className="row">
        <TimePeriodSection/>
        <LocationSection/>
        <DataSourceSection/>
      </div>
      {filtersSection}
    </div>;
  }
}

var QueryPanelState = function(state) {
  return {
    dataSource: state.dataSource
  };
};

QueryPanel = connect(QueryPanelState)(QueryPanel);

// Business logic using Redux

var initialState = {
  periodStart: null,
  periodEnd: null,
  location: null,
  dataSource: null,
  filters: [1,2],
  aggregations: [],
  nextFilterId: 3
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
  }
  return newState;
};

var store = createStore(reducer, initialState);

// ... and render!

ReactDOM.render(<Provider store={store}><QueryPanel/></Provider>, document.getElementById('app'));
