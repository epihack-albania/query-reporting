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
  handleChange(field, evt) {
    this.props.onChange(field, evt.target.value);
  }

  render() {
    let filterControl;
    switch(this.props.data.type) {
    case 'number':
    case 'date':
      filterControl = [<input key="from" value={this.props.data.from} onChange={this.handleChange.bind(this, 'from')}/>,
                       <input key="to" value={this.props.data.to} onChange={this.handleChange.bind(this, 'to')}/>];
      break;
    case 'enumeration':
      let enumOptions = [];
      filterControl = <Select options={enumOptions} multi="true"/>;
      break;
    }
    return <div className="form-inline filter-row">
      <label>
      <button className="btn btn-danger btn-xs" onClick={this.props.onRemove}>
      <span className="glyphicon glyphicon-remove"></span></button>
      {this.props.name}</label>
      {filterControl}
    </div>;
  }
}

class FiltersPanel extends React.Component {
  handleNewFilter(field) {
    this.props.addFilter(field.value);
  }
  handleRemoveFilter(index) {
    this.props.removeFilter(index);
  }
  handleFilterChange(index, field, value) {
    this.props.changeFilter(index, field, value);
  }
  render() {
    let filters = _.map(this.props.filters, function(filter, index) {
      return <FilterRow key={index} name={filter.label} data={filter}
                        onChange={this.handleFilterChange.bind(this, index)}
                        onRemove={this.handleRemoveFilter.bind(this, index)}/>;
    }.bind(this));
    let filterableFields = _.filter(this.props.fields, function(field) {
      return field.name != 'date' && field.name != 'location';
    });
    let fields = _.map(filterableFields, function(field, index) {
      return {value: field.name, label: field.label};
    });
    return (<div className="additional-filters">
              {filters}
              <Select className="add-filter" options={fields} placeholder="Add new filter..." onChange={this.handleNewFilter.bind(this)}/>
            </div>);
  }
}

class AggregationRow extends React.Component {
  handleChange(value) {
    this.props.onChange(value && value.value);
  }
  render() {
    let aggregationFields = _.map(AggregationTypes, function(by) { return {value: by.toLocaleLowerCase(), label: by}; });
    return (
      <div class="row form-inline aggregation-row">
        <Select clearable={!!this.props.clearable} value={this.props.by} options={aggregationFields} onChange={this.handleChange.bind(this)}/>
      </div>
    );
  }
}

class AggregationsPanel extends React.Component {
  handleChange(index, value) {
    this.props.onAggregationChanged(index, value);
  }
  handleAdd(value) {
    this.props.onAggregationAdded(value);
  }
  render() {
    let aggCount = this.props.aggregations.length;
    let aggs = _.map(this.props.aggregations, function(agg, index) {
      return <AggregationRow by={agg} key={index} onChange={this.handleChange.bind(this, index)} clearable={aggCount > 1}/>;
    }.bind(this));
    if (aggs.length < 3) {
      aggs.push(<AggregationRow key="new" onChange={this.handleAdd.bind(this)} clearable={true}/>);
    }
    return (
      <div className="col-md-12">
        <fieldset>
          <legend>Aggregations</legend>
          <p>Group records by</p>
          {aggs}
        </fieldset>
      </div>
    );
  }
}
