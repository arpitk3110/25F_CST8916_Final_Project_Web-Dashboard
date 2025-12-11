Real-time Ice & Weather Monitoring Dashboard for the Rideau Canal Skateway


### **1. Overview**

**Dashboard features**

Real-time display of sensor readings for:

 * Ice Thickness

 * Surface Temperature

 * Snow Accumulation

 * External Temperature

Location cards for Dow’s Lake, Fifth Avenue, and NAC

Safety status indicator (Open / Caution / Closed)

Historical trend charts (Ice Thickness & Surface Temperature)

Auto-refresh every 30 seconds

Responsive UI built for desktop and mobile

**Technologies Used**

 * HTML5, CSS3, JavaScript
 * Chart.js for graph visualizations
 * Fetch API for API communication
 * Azure App Service / Static Web Apps for deployment
 * Azure Cosmos DB + Express API as data source


### **2.  Prerequisites**

Before running the dashboard, ensure you have:

 * A running backend API (Node.js/Express) 
 * API URLs available for:
   * /api/latest
   * /api/history/:location
   * /api/status 

* Browser with JavaScript enabled 

### **3.Installation**
Clone this repository:
 * git clone https://github.com/<your-username>/rideau-canal-monitoring-dashboard.git
 * cd rideau-canal-monitoring-dashboard 

No Node.js build is required — this is a static website.


**To run locally:**
 * open index.html
 

### **4. Configuration**

 * Create a config.js file if it does not already exist:

  const API_BASE_URL = "https://<your-backend-url>.azurewebsites.net";

### **5. API Endpoints**

The dashboard communicates with these backend routes:

GET /api/latest

Returns the most recent reading for each location.

**Example Response:**

{
  "DowsLake": { "iceThickness": 28.5, "surfaceTemp": -5.1, "snow": 4.2 },
  "FifthAvenue": { "iceThickness": 31.0, "surfaceTemp": -6.0, "snow": 7.1 },
  "NAC": { "iceThickness": 26.8, "surfaceTemp": -4.4, "snow": 3.5 }
}

GET /api/history/:location

Returns the last N aggregated datapoints for drawing trends

Example : /api/history/DowsLake
 
GET /api/status 

Returns the overall canal safety classification.

Example Response:

 * { "status": "Caution" }
 
**6. Deployment to Azure App Service**

Step-by-Step Guide

 * 1. Open Azure Porta 
 * 2. Create App Service → Runtime Stack: Static HTML
 * 3. Go to Deployment Center
 * 4. Connect your GitHub repo
 * 5. Select branch → Save & Deploy
 * 6. Once deployed, the App Service will host your dashboard at:
    * https://<app-name>.azurewebsites.net
    
**7. Dashboard Features**

**Real-time Updates**
 
 * Fetches new data every 30 seconds 

 * Updates:
   
   * Location cards

   * Status indicator

   * Last updated timestamp

**Charts & Visualizations**

  * Ice Thickness trend (last hour)

  * Surface Temperature trend

  * Built using Chart.js

Safety Status Indicators

Status is determined from Stream Analytics / backend logic:

  * Green: OPEN 

  * Yellow: CAUTION

  * Red: CLOSED

**8. Troubleshooting**

Common Issues & Fixes 

 * Dashboard loads but shows “--” for values

 * The backend API URL is incorrect 

   * Update API_BASE_URL in config.js 


**Charts not updating**

 * Ensure Stream Analytics job is running