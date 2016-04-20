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
    let rows;
    if (this.props.rows) {
      rows = _.map(this.props.rows, function(bucket, key) {
        return (
            <tr key={key}>
              <td>{bucket.label}</td>
              <td>{bucket.count}</td>
            </tr>
        );
      });
    }
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
