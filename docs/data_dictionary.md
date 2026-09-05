# GeoSafe Data Dictionary

This document details every column present in the primary accident dataset `GeoSafe_Chennai_Synthetic_Dataset.xlsx` (10,000 records).

| Column Name | Data Type | Range / Values | Description |
|---|---|---|---|
| `Accident_ID` | String | `ACC00001` - `ACC10000` | Unique alphanumeric identifier for each recorded incident |
| `Latitude` | Float | `12.80` - `13.20` | WGS84 Geographic Latitude coordinate (Chennai bounds) |
| `Longitude` | Float | `80.00` - `80.30` | WGS84 Geographic Longitude coordinate (Chennai bounds) |
| `Road_Name` | String | E.g. Anna Salai, OMR, GST Road | Specific road corridor or street name |
| `Area` | String | E.g. Guindy, T. Nagar, Velachery | Municipal area or neighborhood name |
| `Date` | String | `YYYY-MM-DD` | Date of incident occurrence |
| `Time` | String | `HH:MM` | Time of incident occurrence (24-hour format) |
| `Day_of_Week` | String | Monday - Sunday | Day of week |
| `Weather` | String | Clear, Cloudy, Fog/Mist, Rain, Heavy Rain | Atmospheric weather condition at time of incident |
| `Temperature_C` | Float | `22.0` - `42.0` | Ambient temperature in degrees Celsius |
| `Visibility_km` | Float | `0.5` - `10.0` | Atmospheric visibility distance in kilometers |
| `Traffic_Level` | String | Low, Medium, High, Heavy, Congested | Traffic congestion level at time of incident |
| `Road_Type` | String | Local, Collector, Arterial, Expressway/Highway | Road infrastructure classification |
| `Speed_Limit_kmph` | Integer | `30` - `100` | Designated speed limit in km/h |
| `Construction` | String | Yes, No | Indicator of active road construction activity |
| `Accident_Severity` | String | Minor, Moderate, Severe, Fatal | Severity classification of incident |
| `Vehicles_Involved` | Integer | `1` - `6` | Total count of vehicles involved in incident |
| `Fatalities` | Integer | `0` - `5` | Total count of deceased casualties |
| `Injuries` | Integer | `0` - `10` | Total count of injured persons requiring medical attention |
| `Risk_Score` | Float | `0.0` - `100.0` | Continuous accident risk rating score |
| `Risk_Label` | String | Low, Medium, High, Critical | Discrete risk level classification |
