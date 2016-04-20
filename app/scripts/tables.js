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

class QueryPanel extends React.Component {
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
