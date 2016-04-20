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

class AggregationsTable extends React.Component {
  render() {
    return (
      <div className="col-md-12">
        <table className="table">
          <thead>
            <tr>
              <th colspan="2" rowspan="2">Number of cases</th>
              <th colspan="2">2013</th>
              <th colspan="2">2014</th>
              <th colspan="2">2015</th>
            </tr>
            <tr>
              <th>Tirana</th>
              <th>Saranda</th>
              <th>Tirana</th>
              <th>Saranda</th>
              <th>Tirana</th>
              <th>Saranda</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td rowspan="3">Gender</td>
              <td>Male</td>
              <td>10</td>
              <td>35</td>
              <td>24</td>
              <td>42</td>
              <td>33</td>
              <td>15</td>
            </tr>
            <tr>
              <td>Female</td>
              <td>10</td>
              <td>35</td>
              <td>24</td>
              <td>42</td>
              <td>33</td>
              <td>15</td>
            </tr>
            <tr>
              <td>Undecided</td>
              <td>10</td>
              <td>35</td>
              <td>24</td>
              <td>42</td>
              <td>33</td>
              <td>15</td>
            </tr>
          </tbody>
        </table>
      </div>
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
        <TimePeriodSection/>
        <LocationSection/>
        <DataSourceSection/>
      </div>
      {filtersSection}
      {filtersTable}
      {aggregationsSection}
      {aggregationsTable}
    </div>);
  }
}
