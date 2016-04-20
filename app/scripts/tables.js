var connect = ReactRedux.connect;

// Component definition

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
    let filterCount = this.props.rows.length;
    let totalCount = this.props.totalCount;
    return (
        <div className="col-md-12">
        <p className="fineprint">Showing {filterCount} of {totalCount} records.</p>
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

class AggregationsTable extends React.Component {
  render() {
    if (!this.props.data) return <div></div>;

    switch(this.props.data.groups.length) {
    case 1:
      return this.renderOneDimension();
    case 2:
      return this.renderTwoDimensions();
    default:
      return <div></div>;
    }
  }

  renderOneDimension() {
    let data = this.props.data.data;
    let rows = _.map(this.props.data.groups[0], function(group) {
      return (
          <tr key={group.key}>
            <td>{group.label}</td>
            <td>{data[group.key].count}</td>
          </tr>
      );
    });
    return (
        <table className="table">
          <thead>
            <tr>
              <th>Group</th>
              <th>No. of cases</th>
            </tr>
          </thead>
          <tbody>
            {rows}
          </tbody>
        </table>
    );
  }

  renderTwoDimensions() {
    let data = this.props.data.data;
    let groups = this.props.data.groups;

    let headers = _.map(groups[0], function(colGroup) {
      return <th key={colGroup.key}>{colGroup.label}</th>;
    });

    let rows = _.map(groups[1], function(rowGroup) {
      let cols = _.map(groups[0], function(colGroup) {
        let colBucket = data[colGroup.key];
        let rowBucket = colBucket.buckets[rowGroup.key];
        return <td key={colGroup.key}>{rowBucket ? rowBucket.count : 0}</td>;
      });
      return (
          <tr key={rowGroup.key}>
            <td>{rowGroup.label}</td>
            {cols}
          </tr>
      );
    });
    return (
      <table className="table">
        <thead>
          <tr><th></th>{headers}</tr>
        </thead>
        <tbody>
          {rows}
        </tbody>
      </table>
    );
  }
}

class QueryPanel extends React.Component {
  render() {
    let filtersSection, filtersTable, aggregationsSection, aggregationsTable;
    if (this.props.hasDataSource) {
      filtersSection = <FiltersPanel/>;
      aggregationsSection = <AggregationsPanel/>;
      if (this.props.hasData) {
        filtersTable = <FilterTable/>;
        aggregationsTable = <AggregationsTable/>;
      }
    }
    return (<div>
              <div className="row">
                <div className="col-md-3">
                  <legend>Filters</legend>
                  <TimePeriodSection/>
                  <LocationSection/>
                  <DataSourceSection/>
                  {filtersSection}
                </div>
                <div className="col-md-9">
                  {filtersTable}
                </div>
              </div>
              <div className="row">
                <div className="col-md-3">
                  {aggregationsSection}
                </div>
                <div className="col-md-9">
                  {aggregationsTable}
                </div>
              </div>
            </div>);
  }
}
