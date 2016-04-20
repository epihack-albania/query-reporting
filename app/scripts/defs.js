// Static data

var DataSources = {
  cchf: {
    label: "CCHF",
    url: "data/cchf.json",
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
    url: "data/brucellosis.json",
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
