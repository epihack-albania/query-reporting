var connect = ReactRedux.connect;

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

