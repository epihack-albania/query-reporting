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

class LocationPicker extends React.Component {
  constructor(props) {
    super(props);
    this.state = {location: ''};
  }
  handleSelect(ev) {
    this.setState({location: ev.target.selectedIndex - 1});
  }
  render() {
    let options = _.map(Locations, function(location, index) {
      return <option key={index} value={index}>{location}</option>;
    });
    return <select className="form-control" value={this.state.option} onChange={this.handleSelect.bind(this)}><option></option>{options}</select>;
  }
}

class DataSourceSection extends React.Component {
  constructor(props) {
    super(props);
  }
  handleSelect(ev) {
    let newSource = ev.target.selectedIndex - 1;
    newSource = newSource >= 0 ? newSource : null;
    if (this.props.onChange) {
      this.props.onChange(newSource);
    }
  }
  render() {
    let options = _.map(DataSources, function(source, index) {
      return <option key={index} value={index}>{source.name}</option>;
    });
    return <div className="">
      <label>Data Source</label>
      <select className="form-control" value={this.props.dataSource || ''} onChange={this.handleSelect.bind(this)}><option>Select data source...</option>{options}</select>
    </div>;
  }
}

class LocationSection extends React.Component {
  render() {
    return <div className="">
      <label>Location</label>
      <LocationPicker/>
    </div>;
  }
}

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
    if (this.props.onNewFilter) {
      this.props.onNewFilter();
    }
  }
  handleRemoveFilter(index) {
    if (this.props.onRemoveFilter) {
      this.props.onRemoveFilter(index);
    }
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

var nextFilterId = 3;

class QueryPanel extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      periodStart: null,
      periodEnd: null,
      location: null,
      dataSource: null,
      filters: [1,2],
      aggregations: []
    };
  }

  handleDataSourceSelected(dataSource) {
    this.setState({dataSource: dataSource});
  }

  handleNewFilter() {
    let filters = this.state.filters;
    filters.push(nextFilterId++);
    this.setState({filters: filters});
  }

  handleRemoveFilter(filterIndex) {
    let filters = this.state.filters;
    filters.splice(filterIndex, 1);
    this.setState({filters: filters});
  }

  render() {
    let filtersSection;
    if (this.state.dataSource) {
      filtersSection = <FiltersPanel filters={this.state.filters} onNewFilter={this.handleNewFilter.bind(this)} onRemoveFilter={this.handleRemoveFilter.bind(this)}/>;
    }
    return <div>
      <div className="row">
        <TimePeriodSection/>
        <LocationSection/>
        <DataSourceSection dataSource={this.state.dataSource} onChange={this.handleDataSourceSelected.bind(this)}/>
      </div>
      {filtersSection}
    </div>;
  }
}

ReactDOM.render(<QueryPanel/>, document.getElementById('app'));
