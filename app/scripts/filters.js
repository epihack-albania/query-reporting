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
  handleChange(field, evt) {
    this.props.onPeriodChanged(field, evt.target.value);
  }
  render() {
    return <div className="">
      <label>Time Period</label>
      <input className="form-control" value={this.props.periodStart || ''} onChange={this.handleChange.bind(this, 'periodStart')}/>
      <input className="form-control" value={this.props.periodEnd || ''} onChange={this.handleChange.bind(this, 'periodEnd')}/>
    </div>;
  }
}

class FilterRow extends React.Component {
  render() {
    return <div className="form-inline filter-row">
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
    return (<div className="additional-filters">
              {filters}
              <button className="btn btn-primary" onClick={this.handleNewFilter.bind(this)}>Add filter</button>
            </div>);
  }
}

class AggregationRow extends React.Component {
  render() {
    let aggregationFields = _.map(['Year', 'Quarter', 'Month', 'Week', 'Day', 'District', 'Municipality', 'Village', 'Age', 'Gender'], function(by) { return {value: by, label: by}; });
    return (
      <div class="row form-inline aggregation-row">
        <label for="agg1">Aggregate by</label>
        <Select value={this.props.by} options={aggregationFields}/>
      </div>
    );
  }
}

class AggregationsPanel extends React.Component {
  render() {
    let aggs = _.map(this.props.aggregations, function(agg, index) {
      return <AggregationRow by={agg} key={index}/>;
    });
    return (
      <div className="col-md-12">
        <fieldset>
          <legend>Aggregations</legend>
          {aggs}
        </fieldset>
      </div>
    );
  }
}
