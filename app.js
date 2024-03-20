const express = require('express')
const app = express()
const path = require('path')
const dbPath = path.join(__dirName, 'covid19India.db')
app.use(express.json)
const {open} = require('sqlite')
const sqlite3 = require('sqlite3')
let db = null

const initialiseDataBase = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: Database,
    })
    app.listen(3000) = () => {
      console.log('server is running at localhost 3000')
    }
  } catch (e) {
    console.log(`db error : {e.message}`)
    process.exit(1)
  }
}


const objectSnakeToCamel = (newObject)=>{
  return{
    stateId : newObject.state_id,
    stateName:newObject.state_name,
    population:newObject.population,
  };
};
const districtSnakeToCamel =(newObject)=>{
  return{
    districtId:newObject.district_id,
    districtName:newObject.district_name,
    stateId:newObject.state_id,
    cases:newObject.cases,
    active:newObject.active,
    deaths:newObject.deaths,
  };
};

const reportSnakeToCamelCase =(newObject)=>{
  return{
    totalCases:newObject.cases,
    totalcured:newObject.cured,
    totalActive:newObject.active,
    totalDeaths:newObject.deaths,
  };
};
initialiseDataBase()

app.get('/states/', (request, response) => {
   const allStateList = `SELECT * FROM state
   ORDER BY state_id;
   
   `;
const stateList = await db.all(allStateList);
const stateResult =stateList.map((eachObject)=>{
  return objectSnakeToCamel(eachObject);
});
 response.send(stateResult);
});

app.get("/states/:stateId/", async (request,response) =>{
  const {stateId} = request.params;
  const getState = `SELECT * FROM state WHERE 
  state_id = ${stateId};`;
  const newState = await db.get(getState);
  const stateResult = objectSnakeToCamel(newState);
  response.send(stateResult);
});

app.post("/districts/", async (request,response)=>{
  const createDistrict = request.body;
  const {
    districtName,
    stateId,
    cases,
    cured,
    active,
    deaths,
  } = createDistrict;
  const newDistrict =
  `INSERT INTO 
  district (district_name,state_id,cases,cured,active,deaths)
  Values 
  (
    '${districtName}',
    ${stateId},
    ${cases},
    ${cured},
    ${active},
    ${deaths}
  );`;
  const addDistrict = await db.run(newDistrict);
  const districtId = addDistrict.lastId;
  response.send("District Successfully Added");
});

app.get("/districts/:districtId/", async (request,response) =>{
  const {districtId} = request.params;
  const getDistrict = `SELECT * FROM district  WHERE 
  district_id = ${districtId};`;
  const newDistrict = await db.get(getDistrict);
  const districtResult = objectSnakeToCamel(newDistrict);
  response.send(districtResult);
});


app.delete("/districts/:districtId/", async (request,response) =>{
  const {districtId} = request.params;
  const deleteDistrict = `DELETE   FROM district  WHERE 
  district_id = ${districtId};`;
  await db.run(deleteDistrict);
  
  response.send("District removed");
});

app.put("/districts/:districtId/", async (request,response)=>{
  const {districtId} = request.params;
  const districtDetails = request.body;
  const {
    districtName,
    stateId,
    cases,
    cured,
    active,
    deaths,
  } = districtDetails;
  const updateDistrict =
  `UPDATE  
  district
  SET 
    distict_name ='${districtName}',
    state_id=${stateId},
    cases=${cases},
    cured=${cured},
    active=${active},
    deaths=${deaths}
    WHERE district_id = ${districtId};
  );`;
  await db.run(updateDistrict);
  
  response.send("District Details Updated");
});

app.get("/states/:stateId/stats/", async (request,response) =>{
  const {stateId} = request.params;
  const getStateReport = `SELECT SUM(cases) AS cases,
  SUM(cured) AS cured,
  SUM(active) AS active,
  SUM (deaths) AS deaths 
  FROM district WHERE
  state_id = ${stateId};`;
  const stateReport = await db.get(getStateReport);
  const resultReport = reportSnakeToCamelCase(stateReport);
  response.send(resultReport);
});

app.get("/districts/:districtId/details/",async (request,response)=>{
  const {districtId} = request.params;
  const stateDetails =  `
  SELECT state_name 
  From state JOIN district.state_id
  WHERE district.district_id = ${districtId};`;
  const stateName = await db.get(stateDetails);
  response.send({stateName:stateName.state_name});
});







module.exports =app;
